"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { playAlarmBurst, playTick, unlockAudio } from "./alarm";

type Status = "idle" | "running" | "paused" | "done";

type Persisted = {
  duration: number;
  status: Status;
  endAt: number | null;
  remaining: number;
  alarm: boolean;
};

type TimerApi = Persisted & {
  left: number;
  start: (duration?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  add: (ms: number) => void;
  setDuration: (ms: number) => void;
  setAlarm: (on: boolean) => void;
};

const STORAGE_KEY = "hgd-timer";
const ALARM_REPEATS = 3;
const DEFAULT: Persisted = { duration: 90_000, status: "idle", endAt: null, remaining: 90_000, alarm: true };

const TimerContext = createContext<TimerApi | null>(null);

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const saved = { ...DEFAULT, ...(JSON.parse(raw) as Persisted) };
    const expired = saved.status === "done" || (saved.status === "running" && (saved.endAt ?? 0) <= Date.now());
    return expired ? { ...saved, status: "idle", endAt: null, remaining: saved.duration } : saved;
  } catch {
    return DEFAULT;
  }
}

function notify(body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
      new Notification("Rest is over", { body, icon: "/icon.png", tag: "hgd-timer" });
    }
  } catch {}
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(DEFAULT);
  const [now, setNow] = useState(() => Date.now());
  const alarmCount = useRef(0);
  const lastTickSecond = useRef<number | null>(null);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage after mount
    setState(load());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const left =
    state.status === "running" && state.endAt ? Math.max(0, state.endAt - now) : state.status === "done" ? 0 : state.remaining;

  useEffect(() => {
    if (state.status !== "running" && state.status !== "done") return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (state.status !== "running" || !state.endAt || left > 0) return;
    alarmCount.current = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- timer reached zero
    setState((s) => ({ ...s, status: "done", endAt: null, remaining: 0 }));
    if (state.alarm) notify("Time for the next set.");
  }, [left, state.status, state.endAt, state.alarm]);

  useEffect(() => {
    if (state.status !== "done" || !state.alarm) return;
    const ring = () => {
      if (alarmCount.current >= ALARM_REPEATS) return;
      alarmCount.current++;
      playAlarmBurst();
      if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200, 100, 400]);
    };
    ring();
    const id = setInterval(ring, 1500);
    return () => clearInterval(id);
  }, [state.status, state.alarm]);

  useEffect(() => {
    if (state.status !== "running" || !state.alarm) return;
    const second = Math.ceil(left / 1000);
    if (second <= 3 && second > 0 && lastTickSecond.current !== second) playTick();
    lastTickSecond.current = second;
  }, [left, state.status, state.alarm]);

  useEffect(() => {
    if (state.status !== "running") {
      void wakeLock.current?.release().catch(() => {});
      wakeLock.current = null;
      return;
    }
    if ("wakeLock" in navigator) {
      navigator.wakeLock
        .request("screen")
        .then((lock) => (wakeLock.current = lock))
        .catch(() => {});
    }
  }, [state.status]);

  const start = useCallback((duration?: number) => {
    unlockAudio();
    try {
      if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission();
    } catch {}
    setNow(Date.now());
    setState((s) => {
      const d = duration ?? s.duration;
      return { ...s, duration: d, remaining: d, status: "running", endAt: Date.now() + d };
    });
  }, []);

  const pause = useCallback(() => {
    setState((s) =>
      s.status === "running" && s.endAt ? { ...s, status: "paused", remaining: Math.max(0, s.endAt - Date.now()), endAt: null } : s,
    );
  }, []);

  const resume = useCallback(() => {
    unlockAudio();
    setNow(Date.now());
    setState((s) => (s.status === "paused" ? { ...s, status: "running", endAt: Date.now() + s.remaining } : s));
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...s, status: "idle", endAt: null, remaining: s.duration }));
  }, []);

  const add = useCallback((ms: number) => {
    setState((s) => {
      if (s.status === "running" && s.endAt) return { ...s, endAt: Math.max(Date.now(), s.endAt + ms) };
      if (s.status === "done") return { ...s, status: "running", endAt: Date.now() + ms, remaining: ms };
      const remaining = Math.max(5_000, s.remaining + ms);
      return s.status === "idle" ? { ...s, duration: remaining, remaining } : { ...s, remaining };
    });
  }, []);

  const setDuration = useCallback((ms: number) => {
    setState((s) => ({ ...s, duration: ms, remaining: ms, status: "idle", endAt: null }));
  }, []);

  const setAlarm = useCallback((on: boolean) => {
    if (on) unlockAudio();
    setState((s) => ({ ...s, alarm: on }));
  }, []);

  const api = useMemo<TimerApi>(
    () => ({ ...state, left, start, pause, resume, reset, add, setDuration, setAlarm }),
    [state, left, start, pause, resume, reset, add, setDuration, setAlarm],
  );

  return <TimerContext.Provider value={api}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used inside TimerProvider");
  return ctx;
}

export function formatClock(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

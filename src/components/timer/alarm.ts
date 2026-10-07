let ctx: AudioContext | null = null;

// iOS only lets audio play from a context created or resumed inside a user gesture.
export function unlockAudio() {
  if (typeof window === "undefined") return;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
}

function beep(at: number, freq: number, length = 0.14) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.35, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

export function playAlarmBurst() {
  if (!ctx) return;
  const t = ctx.currentTime + 0.02;
  [0, 0.18, 0.36].forEach((offset) => beep(t + offset, 1046));
  beep(t + 0.6, 1318, 0.3);
}

export function playTick() {
  if (!ctx) return;
  beep(ctx.currentTime + 0.01, 660, 0.06);
}

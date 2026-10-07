import type { Metadata } from "next";
import { TimerView } from "@/components/timer/timer-view";

export const metadata: Metadata = { title: "Timer" };

export default function TimerPage() {
  return <TimerView />;
}

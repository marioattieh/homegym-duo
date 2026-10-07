import { requireMember } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { TimerProvider } from "@/components/timer/timer-context";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember();
  return (
    <TimerProvider>
      <AppShell member={member}>{children}</AppShell>
    </TimerProvider>
  );
}

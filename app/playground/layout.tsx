import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { PlaygroundShell } from "@/components/playground/PlaygroundShell";

export const metadata: Metadata = { title: "Playground", robots: { index: false } };

export default async function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(["student"]);
  return (
    <PlaygroundShell soundEnabled={user.sound_enabled}>
      <main id="main" className="min-h-dvh bg-gradient-to-b from-sky-100 to-mint-100">{children}</main>
    </PlaygroundShell>
  );
}

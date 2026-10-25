"use client";

import { SoundProvider } from "@/lib/client/sound";
import { setSound } from "@/app/actions/auth";

export function PlaygroundShell({ soundEnabled, children }: { soundEnabled: boolean; children: React.ReactNode }) {
  return (
    <SoundProvider initialEnabled={soundEnabled} onChange={(v) => void setSound(v)}>
      {children}
    </SoundProvider>
  );
}

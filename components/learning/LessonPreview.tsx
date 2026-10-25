"use client";

import { SoundProvider } from "@/lib/client/sound";
import { LessonPlayer } from "@/components/learning/LessonPlayer";
import type { Lesson } from "@/types";

export function LessonPreview({ lesson, exitHref }: { lesson: Lesson; exitHref: string }) {
  return (
    <SoundProvider>
      <LessonPlayer lesson={lesson} preview exitHref={exitHref} />
    </SoundProvider>
  );
}

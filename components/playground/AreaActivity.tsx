"use client";

import type { AreaKey } from "@/types";
import { AREA_BY_KEY } from "@/lib/learning/areas";
import { ActivityTopBar } from "@/components/playground/TopBar";
import { AlphabetGarden } from "@/components/learning/AlphabetGarden";
import { NumberPlayground } from "@/components/learning/NumberPlayground";
import { ShapesColours } from "@/components/learning/ShapesColours";
import { AnimalWorld } from "@/components/learning/AnimalWorld";
import { Storytime } from "@/components/learning/Storytime";
import { CreativeStudio } from "@/components/learning/CreativeStudio";
import { LifeSkills } from "@/components/learning/LifeSkills";

export function AreaActivity({ area }: { area: AreaKey }) {
  const info = AREA_BY_KEY[area];
  return (
    <>
      <ActivityTopBar title={info.title} emoji={info.emoji} color={info.color} />
      {area === "abc-garden" && <AlphabetGarden />}
      {area === "number-playground" && <NumberPlayground />}
      {area === "shapes-colours" && <ShapesColours />}
      {area === "animal-world" && <AnimalWorld />}
      {area === "storytime" && <Storytime />}
      {area === "creative-studio" && <CreativeStudio />}
      {area === "life-skills" && <LifeSkills />}
    </>
  );
}

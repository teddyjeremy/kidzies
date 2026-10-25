import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AREA_BY_KEY, isAreaKey } from "@/lib/learning/areas";
import { AreaActivity } from "@/components/playground/AreaActivity";

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params;
  return { title: isAreaKey(area) ? AREA_BY_KEY[area].title : "Playground" };
}

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  if (!isAreaKey(area)) notFound();
  return <AreaActivity area={area} />;
}

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { LEARNING_ADVENTURES } from "@/lib/learning/areas";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/how-it-works", "/learning", "/admissions", "/admissions/apply", "/admissions/status", "/about", "/contact", "/privacy", "/terms", "/accessibility", "/login"];
  return [...pages, ...LEARNING_ADVENTURES.map((a) => `/learning/${a.slug}`)].map((p) => ({ url: `${SITE_URL}${p}` }));
}

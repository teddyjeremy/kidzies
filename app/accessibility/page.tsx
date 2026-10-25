import { PublicPage } from "@/components/site/PublicPage";

export const metadata = { title: "Accessibility" };

export default function Accessibility() {
  return (
    <PublicPage title="Accessibility">
      <ul className="list-disc space-y-2 pl-5 text-ink-700">
        <li>Large touch targets and high-contrast text throughout.</li>
        <li>Spoken instructions on activities, with a sound on/off switch.</li>
        <li>Full keyboard navigation and visible focus outlines; the 3D map has a list of places alongside it.</li>
        <li>Reduced-motion settings are respected and a simpler 2D map is used on devices without 3D support.</li>
        <li>Forms have labels and clear error messages.</li>
      </ul>
      <p className="mt-6 text-ink-700">Found a barrier? Please tell your school so we can fix it.</p>
    </PublicPage>
  );
}

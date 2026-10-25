import { PublicPage } from "@/components/site/PublicPage";

export const metadata = { title: "About" };

export default function About() {
  return (
    <PublicPage title="About Kidzies" intro="A playful, safe learning world for children aged 3 to 6, built for schools and families.">
      <div className="prose-kz space-y-4 text-lg text-ink-700">
        <p>Kidzies turns early-years learning into a toy island children want to explore. Letters, numbers, shapes, animals, stories and everyday life skills each have their own place to visit.</p>
        <p>Behind the playful surface sit simple tools for the adults: teachers plan and assign activities, parents follow progress, and school staff manage admissions and accounts.</p>
        <p>We design for little hands and short attention spans: big buttons, spoken instructions, gentle sounds, and no adverts, chat or tracking.</p>
      </div>
    </PublicPage>
  );
}

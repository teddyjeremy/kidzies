import Link from "next/link";
import { PublicPage } from "@/components/site/PublicPage";
import { LEARNING_ADVENTURES } from "@/lib/learning/areas";

export const metadata = { title: "Learning Adventures" };

export default function LearningPage() {
  return (
    <PublicPage title="Learning Adventures" intro="Each place on the Kidzies island teaches a part of the early-years curriculum." wide>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LEARNING_ADVENTURES.map((a) => (
          <Link key={a.slug} href={`/learning/${a.slug}`} className="card block p-6 transition hover:-translate-y-1">
            <span className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: `${a.color}22` }} aria-hidden>{a.emoji}</span>
            <h2 className="mt-3 text-xl font-bold">{a.title}</h2>
            <p className="mt-1 text-sm text-ink-700">{a.description}</p>
          </Link>
        ))}
      </div>
    </PublicPage>
  );
}

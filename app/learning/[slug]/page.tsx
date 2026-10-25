import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/site/PublicPage";
import { LEARNING_ADVENTURES } from "@/lib/learning/areas";

export function generateStaticParams() {
  return LEARNING_ADVENTURES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = LEARNING_ADVENTURES.find((x) => x.slug === slug);
  return { title: a?.title ?? "Learning Adventure", description: a?.description };
}

export default async function Adventure({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = LEARNING_ADVENTURES.find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <PublicPage title={`${a.emoji} ${a.title}`} intro={a.description}>
      <section className="card p-6">
        <h2 className="text-xl font-bold">Skills children practise</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5">{a.skills.map((s) => <li key={s}>{s}</li>)}</ul>
        <p className="mt-4 text-sm text-ink-700">Activities give spoken instructions, use large tap targets and celebrate effort. Results feed into the parent and teacher portals.</p>
      </section>
      <div className="mt-6 flex gap-3"><Link href="/login" className="btn btn-primary">Play with the demo student</Link><Link href="/learning" className="btn btn-secondary">All adventures</Link></div>
    </PublicPage>
  );
}

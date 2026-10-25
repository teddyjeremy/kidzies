import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export function PublicPage({ title, intro, children, wide = false }: { title: string; intro?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className={`mx-auto px-4 py-12 sm:px-6 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        <h1 className="font-display text-4xl font-bold text-ink-900 sm:text-5xl">{title}</h1>
        {intro && <p className="mt-3 text-lg text-ink-700">{intro}</p>}
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

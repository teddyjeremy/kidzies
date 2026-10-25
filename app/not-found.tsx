import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream p-6 text-center">
      <div>
        <p className="text-7xl" aria-hidden>🧸</p>
        <h1 className="mt-4 font-display text-4xl font-bold">Oops, this page wandered off</h1>
        <p className="mt-2 text-ink-700">We couldn&apos;t find that page, or you don&apos;t have access to it.</p>
        <Link href="/" className="btn btn-primary mt-6">Go home</Link>
      </div>
    </main>
  );
}

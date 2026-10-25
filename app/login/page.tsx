import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/SiteHeader";
import { LoginForms } from "@/components/forms/LoginForms";
import { getCurrentUser } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/auth/roles";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user && !sp.switch) redirect(ROLE_HOME[user.role]);
  const type = sp.type === "adult" ? "adult" : "student";
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex flex-1 items-start justify-center bg-gradient-to-b from-sky-100 to-cream px-4 py-12">
        <div className="flex w-full max-w-md flex-col items-center gap-5">
          <div className="text-center">
            <p className="text-5xl" aria-hidden="true">🧸</p>
            <h1 className="mt-2 text-4xl font-bold">Welcome to Kidzies</h1>
            <p className="mt-1 text-ink-700">Who is signing in today?</p>
          </div>
          {sp.expired && <p role="status" className="w-full rounded-2xl bg-sun-100 p-3 text-center text-sm font-semibold">Please sign in to continue. Your session may have ended.</p>}
          {sp.signedOut && <p role="status" className="w-full rounded-2xl bg-mint-100 p-3 text-center text-sm font-semibold">You have signed out. See you soon!</p>}
          <LoginForms initialType={type} initialId={(sp.id ?? "").slice(0, 120)} demo={sp.demo === "1"} next={sp.next ?? ""} />
          <p className="text-sm text-ink-500">Just looking? <Link className="font-bold text-coral-600 underline" href="/#demo">Use a demo account</Link></p>
        </div>
      </main>
    </>
  );
}

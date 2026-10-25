import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = { title: { default: "Teacher portal", template: "%s · Teacher · Kidzies" }, robots: { index: false } };

const NAV = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/classes", label: "Classes" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/lessons", label: "Lessons" },
  { href: "/teacher/assignments", label: "Assignments" },
  { href: "/teacher/results", label: "Results" },
];

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(["teacher"]);
  return <PortalShell user={user} nav={NAV} accent="#2f9cf4">{children}</PortalShell>;
}

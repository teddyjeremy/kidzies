import type { Role } from "@/types";

export const ROLE_HOME: Record<Role, string> = {
  student: "/playground",
  parent: "/parent",
  teacher: "/teacher",
  admin: "/admin",
  admissions: "/admissions/dashboard",
};

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  parent: "Parent / Guardian",
  teacher: "Teacher",
  admin: "Administrator",
  admissions: "Admissions Officer",
};

/** Route prefixes and the roles allowed to open them. Checked again on the server for every page and action. */
export const PROTECTED_PREFIXES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/playground", roles: ["student"] },
  { prefix: "/parent", roles: ["parent"] },
  { prefix: "/teacher", roles: ["teacher"] },
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/admissions/dashboard", roles: ["admissions", "admin"] },
  { prefix: "/account", roles: ["parent", "teacher", "admin", "admissions"] },
];

export function rolesForPath(pathname: string): Role[] | null {
  const match = PROTECTED_PREFIXES.find((p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`));
  return match ? match.roles : null;
}

/** Only allow same-site relative redirects after login. */
export function safeNext(next: string | null | undefined, role: Role): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return ROLE_HOME[role];
  const allowed = rolesForPath(next.split("?")[0]);
  if (allowed && !allowed.includes(role)) return ROLE_HOME[role];
  if (!allowed) return ROLE_HOME[role];
  return next;
}

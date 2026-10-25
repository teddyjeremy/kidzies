import { describe, expect, it } from "vitest";
import { rolesForPath, safeNext } from "@/lib/auth/roles";

describe("route protection", () => {
  it("maps prefixes to roles", () => {
    expect(rolesForPath("/teacher/lessons")).toEqual(["teacher"]);
    expect(rolesForPath("/admissions/dashboard/abc")).toEqual(["admissions", "admin"]);
    expect(rolesForPath("/admissions/apply")).toBeNull();
    expect(rolesForPath("/parentx")).toBeNull();
  });
  it("only redirects to same-site pages the role may open", () => {
    expect(safeNext("/teacher/results", "teacher")).toBe("/teacher/results");
    expect(safeNext("/admin", "parent")).toBe("/parent");
    expect(safeNext("//evil.example", "student")).toBe("/playground");
    expect(safeNext("https://evil.example", "admin")).toBe("/admin");
    expect(safeNext(null, "admissions")).toBe("/admissions/dashboard");
  });
});

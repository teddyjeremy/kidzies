import { describe, expect, it } from "vitest";
import { adultLoginSchema, applicationSchema, normaliseStudentCode, passwordChangeSchema, statusCheckSchema, studentLoginSchema } from "@/lib/validation";

describe("student login", () => {
  it("normalises codes", () => expect(normaliseStudentCode("qf5g-7j90 ")).toBe("QF5G7J90"));
  it("accepts the demo code", () => expect(studentLoginSchema.safeParse({ code: "qf5g7j90", password: "x" }).success).toBe(true));
  it("rejects short codes", () => expect(studentLoginSchema.safeParse({ code: "ABC", password: "x" }).success).toBe(false));
});

describe("adult login", () => {
  it("lowercases emails", () => {
    const r = adultLoginSchema.parse({ email: " Parent@Demo.Kidzies.Local ", password: "x" });
    expect(r.email).toBe("parent@demo.kidzies.local");
  });
});

describe("application", () => {
  const dob = new Date(Date.now() - 4 * 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const base = { child_first_name: "Ada", child_last_name: "Okafor", child_date_of_birth: dob, requested_level: "KG1", guardian_name: "Ngozi Okafor", guardian_email: "n@example.com", guardian_phone: "+254 700 000 000", consent_data: true, consent_terms: true };
  it("accepts a valid application", () => expect(applicationSchema.safeParse(base).success).toBe(true));
  it("requires consent", () => expect(applicationSchema.safeParse({ ...base, consent_terms: false }).success).toBe(false));
  it("rejects ages outside 2–7", () => expect(applicationSchema.safeParse({ ...base, child_date_of_birth: "2010-01-01" }).success).toBe(false));
  it("validates status references", () => {
    expect(statusCheckSchema.safeParse({ reference: "kz-2026-demo01", email: "a@b.co" }).success).toBe(true);
    expect(statusCheckSchema.safeParse({ reference: "123", email: "a@b.co" }).success).toBe(false);
  });
});

describe("password change", () => {
  it("requires matching, long passwords", () => {
    expect(passwordChangeSchema.safeParse({ current: "a", next: "short", confirm: "short" }).success).toBe(false);
    expect(passwordChangeSchema.safeParse({ current: "a", next: "longenough1", confirm: "different11" }).success).toBe(false);
    expect(passwordChangeSchema.safeParse({ current: "a", next: "longenough1", confirm: "longenough1" }).success).toBe(true);
  });
});

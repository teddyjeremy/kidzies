import { expect, test } from "@playwright/test";
import { loginAdult } from "./helpers";

test.describe("D · admissions from application to enrolment", () => {
  test("family applies, staff accept and enrol", async ({ page, browser }) => {
    const ctx = await browser.newContext();
    const family = await ctx.newPage();
    const dob = new Date(Date.now() - 4 * 365 * 86400_000).toISOString().slice(0, 10);
    const email = `family${Date.now()}@example.com`;
    await family.goto("/admissions/apply");
    await family.locator("#child_first_name").fill("Test");
    await family.locator("#child_last_name").fill("Child");
    await family.locator("#child_date_of_birth").fill(dob);
    await family.locator("#guardian_name").fill("Test Guardian");
    await family.locator("#guardian_email").fill(email);
    await family.locator("#guardian_phone").fill("+254 700 123 456");
    await family.locator("input[name=documents]").setInputFiles({ name: "birth-certificate.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%demo\n") });
    await family.locator("input[name=consent_data]").check();
    await family.locator("input[name=consent_terms]").check();
    await family.getByRole("button", { name: "Submit application" }).click();
    const reference = (await family.getByTestId("application-reference").textContent())!.trim();
    expect(reference).toMatch(/^KZ-\d{4}-[A-Z0-9]{6}$/);

    await family.goto("/admissions/status");
    await family.locator("#reference").fill(reference);
    await family.locator("#email").fill(email);
    await family.getByRole("button", { name: "Check status" }).click();
    await expect(family.getByTestId("application-status")).toHaveText("Submitted");

    await loginAdult(page, "admissions");
    await page.getByPlaceholder(/Search name/).fill(reference);
    await page.getByRole("button", { name: "Filter" }).click();
    await page.getByRole("link", { name: reference }).click();
    await expect(page.getByRole("link", { name: "birth-certificate.pdf" })).toBeVisible();
    await page.locator("#status").selectOption("accepted");
    await page.getByRole("button", { name: "Update status" }).click();
    await expect(page.getByText("Status updated.")).toBeVisible();
    await page.reload();
    await page.locator("#class_id").selectOption({ index: 1 });
    await page.getByRole("button", { name: "Enrol student" }).click();
    await page.getByTestId("confirm-yes").click();
    await expect(page.getByTestId("reveal-student_code")).toHaveText(/^[A-Z0-9]{8}$/);
    await expect(page.getByTestId("reveal-initial_password")).not.toBeEmpty();

    await family.getByRole("button", { name: "Check status" }).click();
    await expect(family.getByTestId("application-status")).toHaveText("Enrolled");
    await ctx.close();
  });
});

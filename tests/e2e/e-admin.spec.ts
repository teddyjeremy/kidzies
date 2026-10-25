import { expect, test } from "@playwright/test";
import { loginAdult, loginStudent } from "./helpers";

test.describe("E · administrator manages student accounts", () => {
  test("create a student, sign in with the issued code, reset it", async ({ page, browser }) => {
    await loginAdult(page, "admin");
    await page.goto("/admin/students");
    await page.locator("#first_name").fill("Pat");
    await page.locator("#last_name").fill(`Tester${Date.now().toString().slice(-4)}`);
    await page.getByRole("button", { name: "Create student" }).click();
    const code = (await page.getByTestId("reveal-student_code").textContent())!.trim();
    const password = (await page.getByTestId("reveal-initial_password").textContent())!.trim();

    const ctx = await browser.newContext();
    const kid = await ctx.newPage();
    await loginStudent(kid, code, password);
    await kid.waitForURL("**/playground");
    await ctx.close();

    // The shared demo student is protected.
    await page.reload();
    await expect(page.getByTestId("student-row").filter({ hasText: "QF5G7J90" })).toContainText(/protected/i);

    await page.goto("/admin/settings");
    await expect(page.getByText(/read-only/)).toBeVisible();
    await page.goto("/admin/audit-logs");
    await expect(page.getByText("student.created").first()).toBeVisible();
  });
});

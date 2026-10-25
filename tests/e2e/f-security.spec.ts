import { expect, test } from "@playwright/test";
import { loginStudent } from "./helpers";

test.describe("F · access control and public pages", () => {
  test("signed-out visitors are sent to sign in", async ({ page }) => {
    for (const path of ["/playground", "/parent", "/teacher", "/admin", "/admissions/dashboard"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("a student cannot open adult portals or documents", async ({ page }) => {
    await loginStudent(page);
    await page.waitForURL("**/playground");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/playground$/);
    const res = await page.request.get("/api/documents/00000000-0000-4000-8000-000000000000");
    expect(res.status()).toBe(403);
  });

  test("public pages load and show the demo accounts", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("QF5G7J90").first()).toBeVisible();
    for (const path of ["/how-it-works", "/learning", "/admissions", "/privacy", "/terms", "/accessibility"]) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    }
    const missing = await page.goto("/does-not-exist");
    expect(missing?.status()).toBe(404);
  });
});

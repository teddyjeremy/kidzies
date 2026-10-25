import { expect, test } from "@playwright/test";
import { loginStudent } from "./helpers";

test.describe("A · student learning journey", () => {
  test("wrong password shows a friendly error", async ({ page }) => {
    await loginStudent(page, "QF5G7J90", "not-the-password");
    await expect(page.getByText(/not quite right|didn.t match|try again/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("student signs in, opens the playground and completes counting", async ({ page }) => {
    await loginStudent(page);
    await page.waitForURL("**/playground");
    await expect(page.getByTestId("student-name")).toContainText(/Amara|Mara/);
    await expect(page.getByTestId("playground-scene")).toBeVisible();

    await page.goto("/playground/number-playground");
    for (let round = 0; round < 10; round++) {
      if (await page.getByTestId("save-status").isVisible().catch(() => false)) break;
      const prompt = page.getByTestId("count-prompt");
      const target = Number((await prompt.textContent())?.match(/\d+/)?.[0] ?? "0");
      const buttons = page.getByTestId("collect-btn");
      for (let i = 0; i < target; i++) await buttons.nth(i).click();
      await page.getByTestId("count-done").click();
      await page.waitForTimeout(1900);
    }
    await expect(page.getByTestId("save-status")).toContainText("Saved", { timeout: 30_000 });
  });
});

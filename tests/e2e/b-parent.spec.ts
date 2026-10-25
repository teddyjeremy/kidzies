import { expect, test } from "@playwright/test";
import { loginAdult } from "./helpers";

test.describe("B · parent sees only their own child", () => {
  test("overview, progress and isolation", async ({ page }) => {
    await loginAdult(page, "parent");
    await expect(page.getByTestId("child-name").first()).toContainText("Amara");
    await expect(page.getByTestId("weekly-summary").first()).toBeVisible();
    await page.getByRole("link", { name: /full progress/i }).first().click();
    await expect(page.getByRole("heading", { name: /Amara's learning/ })).toBeVisible();

    // Another family's child must not be visible.
    const res = await page.goto("/parent/progress?child=00000000-0000-4000-8001-000000000011");
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Leo")).toHaveCount(0);

    // Parents cannot open staff portals.
    await page.goto("/teacher");
    await expect(page).toHaveURL(/\/parent$/);
  });
});

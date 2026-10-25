import { expect, test } from "@playwright/test";
import { loginAdult, loginStudent } from "./helpers";

test.describe("C · teacher assigns work the student can see", () => {
  test("assign a lesson to Amara and find it in the playground", async ({ page, browser }) => {
    await loginAdult(page, "teacher");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await page.goto("/teacher/assignments");
    await page.locator("#target").selectOption({ label: "Amara Okafor" });
    const note = `Practice time ${Date.now().toString().slice(-5)}`;
    await page.locator("#note").fill(note);
    await page.getByRole("button", { name: "Assign" }).click();
    await expect(page.getByText(/Assigned!/)).toBeVisible();

    await page.goto("/teacher/results");
    await expect(page.getByTestId("results-table")).toBeVisible();

    const ctx = await browser.newContext();
    const kid = await ctx.newPage();
    await loginStudent(kid);
    await kid.waitForURL("**/playground");
    await expect(kid.getByTestId("assignment-list")).toBeVisible();
    await ctx.close();
  });
});

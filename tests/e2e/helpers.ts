import { expect, type Page } from "@playwright/test";

export const PASSWORD = "KidziesDemo123!";
export const STUDENT_CODE = "QF5G7J90";

export async function loginStudent(page: Page, code = STUDENT_CODE, password = PASSWORD) {
  await page.goto("/login");
  await page.locator("#tab-student").click();
  await page.locator("#code").fill(code);
  await page.locator("#panel-student #password").fill(password);
  await page.locator("#panel-student button[type=submit]").click();
}

export async function loginAdult(page: Page, who: "parent" | "teacher" | "admin" | "admissions") {
  await page.goto("/login");
  await page.locator("#tab-adult").click();
  await page.locator("#email").fill(`${who}@demo.kidzies.local`);
  await page.locator("#panel-adult #password").fill(PASSWORD);
  await page.locator("#panel-adult button[type=submit]").click();
  const home = who === "admissions" ? "/admissions/dashboard" : `/${who}`;
  await page.waitForURL(`**${home}`);
  await expect(page.getByTestId("logout").first()).toBeVisible();
}

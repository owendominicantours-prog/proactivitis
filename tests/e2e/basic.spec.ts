import { test, expect } from "@playwright/test";

test("home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Proactivitis/i);
});

test("tours page lists items", async ({ page }) => {
  await page.goto("/tours");
  await expect(page.locator("text=Proactivitis Tours")).toBeVisible();
  // Hay grilla de cards; verificamos que exista al menos 1 card.
  await expect(page.locator("text=Desde $").first()).toBeVisible();
});

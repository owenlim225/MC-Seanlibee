import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("category carousel marks the URL-selected chip as current", async ({ page }) => {
  await signInUser(page, "customer1@example.com", "CUSTOMER", "Chris Customer");
  await page.goto("/customer");

  const carousel = page.getByRole("region", { name: "Menu categories" });
  await expect(carousel).toBeVisible();

  const allChip = carousel.getByRole("tab", { name: "All" });
  await expect(allChip).toHaveAttribute("aria-current", "page");

  const mainMeals = carousel.getByRole("tab", { name: "Main Meals" });
  await mainMeals.click();

  await expect(page).toHaveURL(/\/customer\?category=main-meals/);
  await expect(mainMeals).toHaveAttribute("aria-current", "page");
  await expect(allChip).not.toHaveAttribute("aria-current", "page");
});

test("customer page has no horizontal page overflow at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await signInUser(page, "customer1@example.com", "CUSTOMER", "Chris Customer");
  await page.goto("/customer");

  const overflow = await page.evaluate(() => {
    const root = document.scrollingElement ?? document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
});

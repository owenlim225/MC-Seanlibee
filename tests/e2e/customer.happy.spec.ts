import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("customer can browse the menu after signing in", async ({ page }) => {
  await signInUser(page, "customer1@example.com");
  await page.goto("/customer");
  await expect(page.getByRole("heading", { name: "Menu" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Burgers" })).toBeVisible();
});

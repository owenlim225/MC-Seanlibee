import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("customer cannot access kitchen routes", async ({ page }) => {
  await signInUser(page, "customer1@example.com");
  await page.goto("/kitchen");
  await expect(page).toHaveURL(/\/dev\/role-switcher/);
});

test("kitchen cannot access driver routes", async ({ page }) => {
  await signInUser(page, "kitchen@example.com");
  await page.goto("/driver");
  await expect(page).toHaveURL(/\/dev\/role-switcher/);
});

test("driver cannot access admin routes", async ({ page }) => {
  await signInUser(page, "driver@example.com");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/dev\/role-switcher/);
});

test("admin cannot access customer routes", async ({ page }) => {
  await signInUser(page, "admin@example.com");
  await page.goto("/customer");
  await expect(page).toHaveURL(/\/dev\/role-switcher/);
});

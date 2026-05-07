import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test.describe("role boundaries (requires provisioned users)", () => {
  test("customer cannot access kitchen routes", async ({ page }) => {
    await signInUser(page, "ginalyn@customer.com", "CUSTOMER", "Ginalyn Customer");
    await page.goto("/kitchen");
    await expect(page).toHaveURL(/\/auth\/login\?.*denied=1/);
  });

  test("kitchen cannot access driver routes", async ({ page }) => {
    await signInUser(page, "christian@kitchen.com", "KITCHEN", "Christian Kitchen");
    await page.goto("/driver");
    await expect(page).toHaveURL(/\/auth\/login\?.*denied=1/);
  });

  test("driver cannot access admin routes", async ({ page }) => {
    await signInUser(page, "sean@driver.com", "DRIVER", "Sean Driver");
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login\?.*denied=1/);
  });

  test("admin cannot access customer routes", async ({ page }) => {
    await signInUser(page, "sherwin@admin.com", "ADMIN", "Sherwin Admin");
    await page.goto("/customer");
    await expect(page).toHaveURL(/\/auth\/login\?.*denied=1/);
  });
});

test("unauthenticated /customer redirects to /auth/login with next param", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/customer");
  await expect(page).toHaveURL(/\/auth\/login\?next=%2Fcustomer/);
  await context.close();
});

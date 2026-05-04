import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("admin can view the dashboard", async ({ page }) => {
  await signInUser(page, "admin@example.com");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Operations dashboard" })).toBeVisible();
});

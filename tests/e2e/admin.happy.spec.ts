import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, "requires SUPABASE_SERVICE_ROLE_KEY for provisioning auth users");

test("admin can view the dashboard", async ({ page }) => {
  await signInUser(page, "admin@example.com", "ADMIN", "Alex Admin");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Operations dashboard" })).toBeVisible();
});

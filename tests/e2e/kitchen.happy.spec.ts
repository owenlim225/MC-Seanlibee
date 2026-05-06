import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, "requires SUPABASE_SERVICE_ROLE_KEY for provisioning auth users");

test("kitchen operator can open the queue console", async ({ page }) => {
  await signInUser(page, "kitchen@example.com", "KITCHEN", "Kim Kitchen");
  await page.goto("/kitchen");
  await expect(page.getByRole("heading", { name: "Kitchen queue" })).toBeVisible();
});

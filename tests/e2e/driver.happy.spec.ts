import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, "requires SUPABASE_SERVICE_ROLE_KEY for provisioning auth users");

test("driver can open the routing console", async ({ page }) => {
  await signInUser(page, "driver@example.com", "DRIVER", "Dana Driver");
  await page.goto("/driver");
  await expect(page.getByRole("heading", { name: "Driver routes" })).toBeVisible();
});

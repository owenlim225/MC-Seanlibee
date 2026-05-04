import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("driver can open the routing console", async ({ page }) => {
  await signInUser(page, "driver@example.com");
  await page.goto("/driver");
  await expect(page.getByRole("heading", { name: "Driver routes" })).toBeVisible();
});

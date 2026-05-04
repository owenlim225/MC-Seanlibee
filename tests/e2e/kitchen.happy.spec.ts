import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("kitchen operator can open the queue console", async ({ page }) => {
  await signInUser(page, "kitchen@example.com");
  await page.goto("/kitchen");
  await expect(page.getByRole("heading", { name: "Kitchen queue" })).toBeVisible();
});

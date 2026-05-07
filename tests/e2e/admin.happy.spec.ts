import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("admin can view the dashboard", async ({ page }) => {
  await signInUser(page, "sherwin@admin.com", "ADMIN", "Sherwin Admin");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Operations dashboard" })).toBeVisible();
});

test("admin can run user CRUD lifecycle", async ({ page }) => {
  await signInUser(page, "sherwin@admin.com", "ADMIN", "Sherwin Admin");
  await page.goto("/admin/users");

  const stamp = Date.now();
  const email = `crud-${stamp}@example.com`;
  const updatedName = `CRUD Updated ${stamp}`;

  await page.getByPlaceholder("Name").fill(`CRUD User ${stamp}`);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByRole("button", { name: "Create" }).click();

  const row = page.locator('[data-testid="user-row"]').filter({ hasText: email }).first();
  await expect(row).toContainText(email);

  await row.locator("input[name='name']").fill(updatedName);
  await row.getByRole("combobox").first().selectOption("DRIVER");
  await row.getByRole("button", { name: "Save" }).click();
  await expect(row).toContainText(updatedName);
  await expect(row).toContainText("DRIVER");

  await row.getByRole("button", { name: "Deactivate" }).click();
  await expect(row).toContainText("Inactive");

  await row.getByRole("button", { name: "Restore" }).click();
  await expect(row).not.toContainText("Inactive");
});

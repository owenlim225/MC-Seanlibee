import type { Page } from "@playwright/test";

export async function signInUser(page: Page, email: string) {
  await page.goto("/dev/role-switcher");

  const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await page.getByRole("button", { name: new RegExp(escaped) }).click();

  await page.waitForURL((url) => url.pathname !== "/dev/role-switcher", { timeout: 30_000 });
}

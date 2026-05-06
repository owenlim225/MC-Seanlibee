import type { Page } from "@playwright/test";
import { Role } from "@prisma/client";
import { provisionAppUser } from "./provision";

const DEFAULT_E2E_PASSWORD = "E2E-Pw-ChangeMe-123!";

export async function signInUser(
  page: Page,
  email: string,
  role: Role,
  name: string,
  password: string = process.env.E2E_AUTH_PASSWORD ?? DEFAULT_E2E_PASSWORD,
) {
  await provisionAppUser({ email, role, name, password });

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL((url) => url.pathname !== "/login", { timeout: 30_000 });
}

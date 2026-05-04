import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("two drivers cannot claim the same READY order", async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  await signInUser(pageA, "driver@example.com");
  await signInUser(pageB, "driver2@example.com");

  await Promise.all([pageA.goto("/driver"), pageB.goto("/driver")]);

  const claimA = pageA.getByTestId("driver-claim-order-ready-playwright").getByRole("button", { name: "Claim" });
  const claimB = pageB.getByTestId("driver-claim-order-ready-playwright").getByRole("button", { name: "Claim" });

  await expect(claimA).toBeVisible();
  await expect(claimB).toBeVisible();

  await Promise.all([claimA.click(), claimB.click()]);

  await expect
    .poll(
      async () =>
        (await pageA.getByText("Another driver claimed it.").isVisible().catch(() => false)) ||
        (await pageB.getByText("Another driver claimed it.").isVisible().catch(() => false)),
      { timeout: 20_000 },
    )
    .toBeTruthy();

  await ctxA.close();
  await ctxB.close();
});

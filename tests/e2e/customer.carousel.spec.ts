import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("category carousel marks the URL-selected chip as current", async ({ page }) => {
  await signInUser(page, "customer1@example.com");
  await page.goto("/customer");
  const regionCounts = await page.evaluate(() => {
    const regions = Array.from(document.querySelectorAll('[role="region"][aria-label]')) as HTMLElement[];
    return regions.map((node) => node.getAttribute("aria-label"));
  });
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"f8a007"},body:JSON.stringify({sessionId:"f8a007",runId:"pre-fix",hypothesisId:"H1",location:"tests/e2e/customer.carousel.spec.ts:7",message:"region labels rendered on customer page",data:{regionCounts},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const carousel = page.getByRole("region", { name: "Menu categories" });
  await expect(carousel).toBeVisible();

  const allChip = carousel.getByRole("tab", { name: "All" });
  await expect(allChip).toHaveAttribute("aria-current", "page");

  const mainMeals = carousel.getByRole("tab", { name: "Main Meals" });
  await mainMeals.click();

  await expect(page).toHaveURL(/\/customer\?category=main-meals/);
  await expect(mainMeals).toHaveAttribute("aria-current", "page");
  await expect(allChip).not.toHaveAttribute("aria-current", "page");
});

test("customer page has no horizontal page overflow at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await signInUser(page, "customer1@example.com");
  await page.goto("/customer");

  const overflow = await page.evaluate(() => {
    const root = document.scrollingElement ?? document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
});

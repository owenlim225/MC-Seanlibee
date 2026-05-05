import { expect, test } from "@playwright/test";
import { signInUser } from "./utils/auth";

test("customer can browse the menu after signing in", async ({ page }) => {
  await signInUser(page, "customer1@example.com");
  await page.goto("/customer");
  const headingCounts = await page.evaluate(() =>
    Array.from(document.querySelectorAll("h1, h2, h3")).map((node) => node.textContent?.trim() ?? ""),
  );
  // #region agent log
  fetch("http://127.0.0.1:7817/ingest/c3fc8591-bb49-4618-b7bd-5aef2b04dae3",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"f8a007"},body:JSON.stringify({sessionId:"f8a007",runId:"pre-fix",hypothesisId:"H2",location:"tests/e2e/customer.happy.spec.ts:7",message:"heading labels rendered on customer page",data:{headingCounts},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  await expect(page.getByRole("heading", { name: "Menu" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Burgers" })).toBeVisible();
});

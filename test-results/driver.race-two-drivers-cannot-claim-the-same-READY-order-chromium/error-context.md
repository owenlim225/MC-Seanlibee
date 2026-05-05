# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: driver.race.spec.ts >> two drivers cannot claim the same READY order
- Location: tests\e2e\driver.race.spec.ts:4:5

# Error details

```
Error: expect(received).toBeTruthy()

Received: false

Call Log:
- Timeout 20000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "MC Food MVP" [ref=e4] [cursor=pointer]:
        - /url: /
      - generic [ref=e5]:
        - link "Customer" [ref=e6] [cursor=pointer]:
          - /url: /customer
        - link "Dev roles" [ref=e7] [cursor=pointer]:
          - /url: /dev/role-switcher
        - link "Multi-role demo" [ref=e8] [cursor=pointer]:
          - /url: /dev/multi-role
  - main [ref=e9]:
    - generic [ref=e10]:
      - navigation "Role navigation" [ref=e11]:
        - link "Customer" [ref=e12] [cursor=pointer]:
          - /url: /customer
        - link "Kitchen" [ref=e13] [cursor=pointer]:
          - /url: /kitchen
        - link "Driver" [ref=e14] [cursor=pointer]:
          - /url: /driver
        - link "Admin" [ref=e15] [cursor=pointer]:
          - /url: /admin
      - generic [ref=e16]:
        - generic [ref=e18]:
          - heading "Driver routes" [level=1] [ref=e19]
          - paragraph [ref=e20]: Claim READY orders first — claims are race-safe.
        - generic [ref=e21]:
          - generic [ref=e22]:
            - heading "Ready — available" [level=2] [ref=e23]
            - generic [ref=e24]: "1"
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: READY
              - generic [ref=e29]: 3h ago
            - generic [ref=e30]: $119.00
            - generic [ref=e31]: customer2@example.com
            - list [ref=e32]:
              - listitem [ref=e33]: 1 × "Game Day" Jumbo Fried Chicken Wings - 24 Pack
            - button "Claim" [active] [ref=e36]
        - generic [ref=e37]:
          - generic [ref=e38]:
            - heading "My active deliveries" [level=2] [ref=e39]
            - generic [ref=e40]: "0"
          - generic [ref=e41]:
            - generic [ref=e42]: No active deliveries
            - generic [ref=e43]: Claim an order from the READY list.
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { signInUser } from "./utils/auth";
  3  | 
  4  | test("two drivers cannot claim the same READY order", async ({ browser }) => {
  5  |   const ctxA = await browser.newContext();
  6  |   const ctxB = await browser.newContext();
  7  |   const pageA = await ctxA.newPage();
  8  |   const pageB = await ctxB.newPage();
  9  | 
  10 |   await signInUser(pageA, "driver@example.com");
  11 |   await signInUser(pageB, "driver2@example.com");
  12 | 
  13 |   await Promise.all([pageA.goto("/driver"), pageB.goto("/driver")]);
  14 | 
  15 |   const claimA = pageA.getByTestId("driver-claim-order-ready-playwright").getByRole("button", { name: "Claim" });
  16 |   const claimB = pageB.getByTestId("driver-claim-order-ready-playwright").getByRole("button", { name: "Claim" });
  17 | 
  18 |   await expect(claimA).toBeVisible();
  19 |   await expect(claimB).toBeVisible();
  20 | 
  21 |   await Promise.all([claimA.click(), claimB.click()]);
  22 | 
> 23 |   await expect
     |   ^ Error: expect(received).toBeTruthy()
  24 |     .poll(
  25 |       async () =>
  26 |         (await pageA.getByText("Another driver claimed it.").isVisible().catch(() => false)) ||
  27 |         (await pageB.getByText("Another driver claimed it.").isVisible().catch(() => false)),
  28 |       { timeout: 20_000 },
  29 |     )
  30 |     .toBeTruthy();
  31 | 
  32 |   await ctxA.close();
  33 |   await ctxB.close();
  34 | });
  35 | 
```
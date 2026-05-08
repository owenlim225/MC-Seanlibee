# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: driver.race.spec.ts >> two drivers cannot claim the same READY order
- Location: tests\e2e\driver.race.spec.ts:4:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('driver-claim-order-ready-playwright').getByRole('button', { name: 'Claim' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByTestId('driver-claim-order-ready-playwright').getByRole('button', { name: 'Claim' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Mc Seanlibee" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]: Mc Seanlibee
      - navigation "Primary" [ref=e6]:
        - generic [ref=e7]: sean@driver.com
        - button "Logout" [ref=e9] [cursor=pointer]
  - main [ref=e10]:
    - generic [ref=e12]:
      - generic [ref=e14]:
        - heading "Driver routes" [level=1] [ref=e15]
        - paragraph [ref=e16]: Claim READY orders first — claims are race-safe.
      - generic [ref=e17]:
        - generic [ref=e18]:
          - heading "Ready — available" [level=2] [ref=e19]
          - generic [ref=e20]: "1"
        - generic [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: READY
            - generic [ref=e25]: 2m ago
          - generic [ref=e26]: $89.00
          - generic [ref=e27]: marvin@customer.com
          - list [ref=e28]:
            - listitem [ref=e29]: 1 × 4505 Burgers & BBQ
          - button "Accept" [ref=e32]
      - generic [ref=e33]:
        - generic [ref=e34]:
          - heading "My active deliveries" [level=2] [ref=e35]
          - generic [ref=e36]: "0"
        - generic [ref=e37]:
          - generic [ref=e38]: No active deliveries
          - generic [ref=e39]: Claim an order from the READY list.
  - contentinfo "Site footer" [ref=e40]:
    - generic [ref=e41]:
      - region "Footer links" [ref=e42]:
        - generic [ref=e43]:
          - heading "Account" [level=2] [ref=e44]
          - list [ref=e45]:
            - listitem [ref=e46]:
              - link "Login" [ref=e47] [cursor=pointer]:
                - /url: /auth/login
            - listitem [ref=e48]:
              - link "Sign up" [ref=e49] [cursor=pointer]:
                - /url: /auth/signup
            - listitem [ref=e50]:
              - link "Orders" [ref=e51] [cursor=pointer]:
                - /url: /customer/orders
            - listitem [ref=e52]:
              - link "Cart" [ref=e53] [cursor=pointer]:
                - /url: /customer/cart
        - generic [ref=e54]:
          - heading "Operations" [level=2] [ref=e55]
          - list [ref=e56]:
            - listitem [ref=e57]:
              - link "Dashboard" [ref=e58] [cursor=pointer]:
                - /url: /admin
            - listitem [ref=e59]:
              - link "Menu" [ref=e60] [cursor=pointer]:
                - /url: /admin/menu
            - listitem [ref=e61]:
              - link "Users" [ref=e62] [cursor=pointer]:
                - /url: /admin/users
            - listitem [ref=e63]:
              - link "Audit" [ref=e64] [cursor=pointer]:
                - /url: /admin/audit
        - generic [ref=e65]:
          - heading "Roles" [level=2] [ref=e66]
          - list [ref=e67]:
            - listitem [ref=e68]:
              - link "Customer" [ref=e69] [cursor=pointer]:
                - /url: /customer
            - listitem [ref=e70]:
              - link "Kitchen" [ref=e71] [cursor=pointer]:
                - /url: /kitchen
            - listitem [ref=e72]:
              - link "Driver" [ref=e73] [cursor=pointer]:
                - /url: /driver
            - listitem [ref=e74]:
              - link "Admin" [ref=e75] [cursor=pointer]:
                - /url: /admin
        - generic [ref=e76]:
          - heading "Developer" [level=2] [ref=e77]
          - list [ref=e78]:
            - listitem [ref=e79]:
              - link "Dev role switcher" [ref=e80] [cursor=pointer]:
                - /url: /dev/role-switcher
            - listitem [ref=e81]: Mock Stripe Checkout
            - listitem [ref=e82]:
              - link "Multi-role iframe lab" [ref=e83] [cursor=pointer]:
                - /url: /dev/multi-role
      - region "Brand and app links" [ref=e84]:
        - generic [ref=e85]:
          - paragraph [ref=e87]: MC Seanlibee
          - paragraph [ref=e88]: Multi-role food ordering MVP with mocked integrations
        - generic [ref=e89]:
          - heading "App" [level=2] [ref=e90]
          - generic "App links" [ref=e91]:
            - link "Login" [ref=e92] [cursor=pointer]:
              - /url: /auth/login
              - img [ref=e93]
              - generic [ref=e96]: Login
            - link "Sign up" [ref=e97] [cursor=pointer]:
              - /url: /auth/signup
              - img [ref=e98]
              - generic [ref=e101]: Sign up
      - region "Legal and external links" [ref=e102]:
        - paragraph [ref=e103]: © 2026 MC Seanlibee
        - generic "External links" [ref=e104]:
          - link "Open Next.js documentation" [ref=e105] [cursor=pointer]:
            - /url: https://nextjs.org/docs/app/api-reference/cli/create-next-app
            - img [ref=e106]
          - link "Open Google Fonts" [ref=e108] [cursor=pointer]:
            - /url: https://fonts.google.com
            - img [ref=e109]
          - link "Open Supabase asset" [ref=e111] [cursor=pointer]:
            - /url: https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.webp
            - img [ref=e112]
  - button "Open Next.js Dev Tools" [ref=e119] [cursor=pointer]:
    - img [ref=e120]
  - alert [ref=e123]
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
  10 |   await signInUser(pageA, "sean@driver.com", "DRIVER", "Sean Driver");
  11 |   await signInUser(pageB, "driver2@example.com", "DRIVER", "Drew Driver");
  12 | 
  13 |   await Promise.all([pageA.goto("/driver"), pageB.goto("/driver")]);
  14 | 
  15 |   const claimA = pageA.getByTestId("driver-claim-order-ready-playwright").getByRole("button", { name: "Claim" });
  16 |   const claimB = pageB.getByTestId("driver-claim-order-ready-playwright").getByRole("button", { name: "Claim" });
  17 | 
> 18 |   await expect(claimA).toBeVisible();
     |                        ^ Error: expect(locator).toBeVisible() failed
  19 |   await expect(claimB).toBeVisible();
  20 | 
  21 |   await Promise.all([claimA.click(), claimB.click()]);
  22 | 
  23 |   await expect
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
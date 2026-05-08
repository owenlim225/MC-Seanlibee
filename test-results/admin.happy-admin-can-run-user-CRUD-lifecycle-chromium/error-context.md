# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.happy.spec.ts >> admin can run user CRUD lifecycle
- Location: tests\e2e\admin.happy.spec.ts:11:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('[data-testid="user-row"]').filter({ hasText: 'crud-1778205917044@example.com' }).first()
Expected substring: "crud-1778205917044@example.com"
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('[data-testid="user-row"]').filter({ hasText: 'crud-1778205917044@example.com' }).first()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Mc Seanlibee" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]: Mc Seanlibee
      - navigation "Primary" [ref=e6]:
        - generic [ref=e7]: sherwin@admin.com
        - button "Logout" [ref=e9] [cursor=pointer]
  - main [ref=e10]:
    - generic [ref=e11]:
      - navigation [ref=e12]:
        - link "Dashboard" [ref=e13] [cursor=pointer]:
          - /url: /admin
        - link "Menu" [ref=e14] [cursor=pointer]:
          - /url: /admin/menu
        - link "Users" [ref=e15] [cursor=pointer]:
          - /url: /admin/users
        - link "Audit" [ref=e16] [cursor=pointer]:
          - /url: /admin/audit
      - generic [ref=e17]:
        - generic [ref=e19]:
          - heading "Users & roles" [level=1] [ref=e20]
          - paragraph [ref=e21]: Promote seeded operators between mock roles.
        - generic [ref=e22]:
          - heading "Create user" [level=2] [ref=e23]
          - generic [ref=e24]:
            - textbox "Name" [ref=e25]: CRUD User 1778205917044
            - textbox "Email" [ref=e26]: crud-1778205917044@example.com
            - combobox [ref=e27]:
              - option "CUSTOMER" [selected]
              - option "KITCHEN"
              - option "DRIVER"
              - option "ADMIN"
            - combobox [ref=e28]:
              - option "Active" [selected]
              - option "Inactive"
            - textbox "Password (min 8 chars)" [active] [ref=e29]
            - button "Create" [ref=e30]
        - navigation "User sections" [ref=e31]:
          - link "Active users" [ref=e32] [cursor=pointer]:
            - /url: "#active-users"
          - link "Archived users" [ref=e33] [cursor=pointer]:
            - /url: "#archived-users"
        - generic [ref=e34]:
          - heading "Active users" [level=2] [ref=e35]
          - generic [ref=e36]:
            - generic [ref=e37]:
              - generic [ref=e38]: Christian Kitchen
              - generic [ref=e39]: christian@kitchen.com
              - generic [ref=e40]: cmow9uhwg0001lnhgo0phuacf
            - generic [ref=e41]:
              - textbox [ref=e42]: Christian Kitchen
              - textbox [ref=e43]: christian@kitchen.com
              - combobox [ref=e44]:
                - option "CUSTOMER"
                - option "KITCHEN" [selected]
                - option "DRIVER"
                - option "ADMIN"
              - combobox [ref=e45]:
                - option "Active" [selected]
                - option "Inactive"
              - button "Save" [ref=e46]
            - button "Deactivate" [ref=e48]
          - generic [ref=e49]:
            - generic [ref=e50]:
              - generic [ref=e51]: Drew Driver
              - generic [ref=e52]: driver2@example.com
              - generic [ref=e53]: cmow9uiwj0003lnhgog8mjfka
            - generic [ref=e54]:
              - textbox [ref=e55]: Drew Driver
              - textbox [ref=e56]: driver2@example.com
              - combobox [ref=e57]:
                - option "CUSTOMER"
                - option "KITCHEN"
                - option "DRIVER" [selected]
                - option "ADMIN"
              - combobox [ref=e58]:
                - option "Active" [selected]
                - option "Inactive"
              - button "Save" [ref=e59]
            - button "Deactivate" [ref=e61]
          - generic [ref=e62]:
            - generic [ref=e63]:
              - generic [ref=e64]: Ginalyn Customer
              - generic [ref=e65]: ginalyn@customer.com
              - generic [ref=e66]: cmow9uji50004lnhgyun79hm3
            - generic [ref=e67]:
              - textbox [ref=e68]: Ginalyn Customer
              - textbox [ref=e69]: ginalyn@customer.com
              - combobox [ref=e70]:
                - option "CUSTOMER" [selected]
                - option "KITCHEN"
                - option "DRIVER"
                - option "ADMIN"
              - combobox [ref=e71]:
                - option "Active" [selected]
                - option "Inactive"
              - button "Save" [ref=e72]
            - button "Deactivate" [ref=e74]
          - generic [ref=e75]:
            - generic [ref=e76]:
              - generic [ref=e77]: Marvin Customer
              - generic [ref=e78]: marvin@customer.com
              - generic [ref=e79]: cmow9uji50005lnhgxap83xvm
            - generic [ref=e80]:
              - textbox [ref=e81]: Marvin Customer
              - textbox [ref=e82]: marvin@customer.com
              - combobox [ref=e83]:
                - option "CUSTOMER" [selected]
                - option "KITCHEN"
                - option "DRIVER"
                - option "ADMIN"
              - combobox [ref=e84]:
                - option "Active" [selected]
                - option "Inactive"
              - button "Save" [ref=e85]
            - button "Deactivate" [ref=e87]
          - generic [ref=e88]:
            - generic [ref=e89]:
              - generic [ref=e90]: Rhene Customer
              - generic [ref=e91]: rhene@customer.com
              - generic [ref=e92]: cmow9uji50006lnhgvin0reax
            - generic [ref=e93]:
              - textbox [ref=e94]: Rhene Customer
              - textbox [ref=e95]: rhene@customer.com
              - combobox [ref=e96]:
                - option "CUSTOMER" [selected]
                - option "KITCHEN"
                - option "DRIVER"
                - option "ADMIN"
              - combobox [ref=e97]:
                - option "Active" [selected]
                - option "Inactive"
              - button "Save" [ref=e98]
            - button "Deactivate" [ref=e100]
          - generic [ref=e101]:
            - generic [ref=e102]:
              - generic [ref=e103]: Sean Driver
              - generic [ref=e104]: sean@driver.com
              - generic [ref=e105]: cmow9uif40002lnhgd1a0o3x3
            - generic [ref=e106]:
              - textbox [ref=e107]: Sean Driver
              - textbox [ref=e108]: sean@driver.com
              - combobox [ref=e109]:
                - option "CUSTOMER"
                - option "KITCHEN"
                - option "DRIVER" [selected]
                - option "ADMIN"
              - combobox [ref=e110]:
                - option "Active" [selected]
                - option "Inactive"
              - button "Save" [ref=e111]
            - button "Deactivate" [ref=e113]
          - generic [ref=e114]:
            - generic [ref=e115]:
              - generic [ref=e116]: Sherwin Admin
              - generic [ref=e117]: sherwin@admin.com
              - generic [ref=e118]: cmow9uhah0000lnhgq5ws8vm5
            - generic [ref=e119]:
              - textbox [ref=e120]: Sherwin Admin
              - textbox [ref=e121]: sherwin@admin.com
              - combobox [ref=e122]:
                - option "CUSTOMER"
                - option "KITCHEN"
                - option "DRIVER"
                - option "ADMIN" [selected]
              - combobox [ref=e123]:
                - option "Active" [selected]
                - option "Inactive"
              - button "Save" [ref=e124]
            - button "Deactivate" [ref=e126]
        - generic [ref=e127]:
          - heading "Archived users" [level=2] [ref=e128]
          - generic [ref=e129]: No archived users yet.
  - contentinfo "Site footer" [ref=e130]:
    - generic [ref=e131]:
      - region "Footer links" [ref=e132]:
        - generic [ref=e133]:
          - heading "Account" [level=2] [ref=e134]
          - list [ref=e135]:
            - listitem [ref=e136]:
              - link "Login" [ref=e137] [cursor=pointer]:
                - /url: /auth/login
            - listitem [ref=e138]:
              - link "Sign up" [ref=e139] [cursor=pointer]:
                - /url: /auth/signup
            - listitem [ref=e140]:
              - link "Orders" [ref=e141] [cursor=pointer]:
                - /url: /customer/orders
            - listitem [ref=e142]:
              - link "Cart" [ref=e143] [cursor=pointer]:
                - /url: /customer/cart
        - generic [ref=e144]:
          - heading "Operations" [level=2] [ref=e145]
          - list [ref=e146]:
            - listitem [ref=e147]:
              - link "Dashboard" [ref=e148] [cursor=pointer]:
                - /url: /admin
            - listitem [ref=e149]:
              - link "Menu" [ref=e150] [cursor=pointer]:
                - /url: /admin/menu
            - listitem [ref=e151]:
              - link "Users" [ref=e152] [cursor=pointer]:
                - /url: /admin/users
            - listitem [ref=e153]:
              - link "Audit" [ref=e154] [cursor=pointer]:
                - /url: /admin/audit
        - generic [ref=e155]:
          - heading "Roles" [level=2] [ref=e156]
          - list [ref=e157]:
            - listitem [ref=e158]:
              - link "Customer" [ref=e159] [cursor=pointer]:
                - /url: /customer
            - listitem [ref=e160]:
              - link "Kitchen" [ref=e161] [cursor=pointer]:
                - /url: /kitchen
            - listitem [ref=e162]:
              - link "Driver" [ref=e163] [cursor=pointer]:
                - /url: /driver
            - listitem [ref=e164]:
              - link "Admin" [ref=e165] [cursor=pointer]:
                - /url: /admin
        - generic [ref=e166]:
          - heading "Developer" [level=2] [ref=e167]
          - list [ref=e168]:
            - listitem [ref=e169]:
              - link "Dev role switcher" [ref=e170] [cursor=pointer]:
                - /url: /dev/role-switcher
            - listitem [ref=e171]: Mock Stripe Checkout
            - listitem [ref=e172]:
              - link "Multi-role iframe lab" [ref=e173] [cursor=pointer]:
                - /url: /dev/multi-role
      - region "Brand and app links" [ref=e174]:
        - generic [ref=e175]:
          - paragraph [ref=e177]: MC Seanlibee
          - paragraph [ref=e178]: Multi-role food ordering MVP with mocked integrations
        - generic [ref=e179]:
          - heading "App" [level=2] [ref=e180]
          - generic "App links" [ref=e181]:
            - link "Login" [ref=e182] [cursor=pointer]:
              - /url: /auth/login
              - img [ref=e183]
              - generic [ref=e186]: Login
            - link "Sign up" [ref=e187] [cursor=pointer]:
              - /url: /auth/signup
              - img [ref=e188]
              - generic [ref=e191]: Sign up
      - region "Legal and external links" [ref=e192]:
        - paragraph [ref=e193]: © 2026 MC Seanlibee
        - generic "External links" [ref=e194]:
          - link "Open Next.js documentation" [ref=e195] [cursor=pointer]:
            - /url: https://nextjs.org/docs/app/api-reference/cli/create-next-app
            - img [ref=e196]
          - link "Open Google Fonts" [ref=e198] [cursor=pointer]:
            - /url: https://fonts.google.com
            - img [ref=e199]
          - link "Open Supabase asset" [ref=e201] [cursor=pointer]:
            - /url: https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/logo.webp
            - img [ref=e202]
  - button "Open Next.js Dev Tools" [ref=e209] [cursor=pointer]:
    - img [ref=e210]
  - alert [ref=e213]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { signInUser } from "./utils/auth";
  3  | 
  4  | test("admin can view the dashboard", async ({ page }) => {
  5  |   await signInUser(page, "sherwin@admin.com", "ADMIN", "Sherwin Admin");
  6  |   await page.goto("/admin");
  7  |   await expect(page.getByRole("heading", { name: "Operations dashboard" })).toBeVisible();
  8  |   await expect(page.getByRole("heading", { name: "Orders by status (today)" })).toBeVisible();
  9  | });
  10 | 
  11 | test("admin can run user CRUD lifecycle", async ({ page }) => {
  12 |   await signInUser(page, "sherwin@admin.com", "ADMIN", "Sherwin Admin");
  13 |   await page.goto("/admin/users");
  14 | 
  15 |   const stamp = Date.now();
  16 |   const email = `crud-${stamp}@example.com`;
  17 |   const updatedName = `CRUD Updated ${stamp}`;
  18 | 
  19 |   await page.getByPlaceholder("Name").fill(`CRUD User ${stamp}`);
  20 |   await page.getByPlaceholder("Email").fill(email);
  21 |   await page.getByRole("button", { name: "Create" }).click();
  22 | 
  23 |   const row = page.locator('[data-testid="user-row"]').filter({ hasText: email }).first();
> 24 |   await expect(row).toContainText(email);
     |                     ^ Error: expect(locator).toContainText(expected) failed
  25 | 
  26 |   await row.locator("input[name='name']").fill(updatedName);
  27 |   await row.getByRole("combobox").first().selectOption("DRIVER");
  28 |   await row.getByRole("button", { name: "Save" }).click();
  29 |   await expect(row).toContainText(updatedName);
  30 |   await expect(row).toContainText("DRIVER");
  31 | 
  32 |   await row.getByRole("button", { name: "Deactivate" }).click();
  33 |   await expect(row).toContainText("Inactive");
  34 | 
  35 |   await row.getByRole("button", { name: "Restore" }).click();
  36 |   await expect(row).not.toContainText("Inactive");
  37 | });
  38 | 
```
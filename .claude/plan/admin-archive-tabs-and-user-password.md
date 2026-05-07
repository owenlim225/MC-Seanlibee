## Implementation Plan: Admin archive tabs + create-user password field

### Task Type
- [x] Frontend (UI sections/tabs + forms)
- [x] Backend (server actions + Prisma reads/writes)
- [x] Fullstack (admin data flow + tests)

### Requirement Scope
1. On admin users page, add an archived users tab/section that lists archived users from `ArchivedUser`.
2. On admin menu page, add an archived menu items button/tab after category browser that lists archived menu items from `ArchivedMenuItem`.
3. On admin users page create-user form, add a password input field and persist secure hash from submitted value.

### Context Retrieved
- `app/(admin)/admin/users/page.tsx` currently renders create form and a single active/inactive users list from `User`.
- `app/(admin)/admin/menu/page.tsx` currently has sticky in-page nav (`Overview`, `Category form`, `Item form`, `Category browser`) and only active menu items (`deletedAt: null`).
- `app/(admin)/admin/actions.ts`:
  - `createUserForm` currently ignores admin-entered password and sets random hash via `hashPassword(randomUUID())`.
  - `softDeleteUserForm` already archives to `archivedUser`.
  - `deleteMenuItem` already archives to `archivedMenuItem`.
- `prisma/schema.prisma` includes `ArchivedUser` and `ArchivedMenuItem`.
- `app/(admin)/admin/actions.test.ts` has existing tests for create user and menu archive behaviors.

### Technical Solution
Use existing archive snapshot tables as read sources for new admin archive views. Keep page-level fetch on server components, with explicit partition:
- Active/live entities from `User` / `MenuItem` (existing behavior)
- Archived entities from `ArchivedUser` / `ArchivedMenuItem` (new behavior)

For create-user password:
- Extend form with `password` input
- Parse/validate password in `createUserForm`
- Hash via existing `hashPassword`
- Persist hash, rejecting invalid/empty passwords (fail-closed no-op pattern consistent with existing actions)

### Implementation Steps
1. **Add shared server-side parsing for password**
   - In `app/(admin)/admin/actions.ts`, add `parsePassword()` helper with minimum constraints (e.g., trim + min length).
   - Update `createUserForm` to read `password` from `FormData`.
   - Replace random UUID password generation with `hashPassword(parsedPassword)`.
   - Keep existing duplicate email handling (`P2002`) unchanged.

2. **Update create-user UI**
   - In `app/(admin)/admin/users/page.tsx`, add password input in the create form.
   - Keep layout usable by increasing grid columns responsively (e.g., add one extra field slot).
   - Use `type="password"`, required, placeholder, and existing input style classes for consistency.

3. **Add archived users data query**
   - In `AdminUsersPage`, add `prisma.archivedUser.findMany` query.
   - Order archived rows for usefulness (e.g., newest first by `archivedAt`).
   - Select render-safe fields only (name/email/role/isActive/archivedAt/originalId).

4. **Render users page tabs/sections**
   - Add local in-page nav controls (tab-like anchors/buttons): `Active users`, `Archived users`.
   - Keep existing active user cards under active section.
   - Add archived users section with dedicated cards/table rows, including archive metadata.
   - Use clear empty state when no archived users exist.

5. **Add archived menu items data query**
   - In `app/(admin)/admin/menu/page.tsx`, add `prisma.archivedMenuItem.findMany`.
   - Order by `archivedAt desc`.
   - Keep existing active menu category browser untouched.

6. **Add archive nav/button after category browser**
   - Extend existing sticky nav links array by adding `Archived menu items` immediately after `Category browser`.
   - Add new section id (e.g., `#archived-menu-items`) below category browser section.
   - Render archived item cards/list with core fields (`name`, `description`, `priceCents`, `isAvailable`, `archivedAt`, `originalId`).
   - Include empty state if no archived menu items.

7. **Tests (unit/integration-level server action + rendering checks)**
   - Update `app/(admin)/admin/actions.test.ts`:
     - Assert `createUserForm` now hashes submitted password rather than random UUID.
     - Add test for invalid/missing password -> no create/no revalidate.
   - Add/extend page render tests for:
     - users page includes archived users section content.
     - menu page includes archived menu items nav entry and section content.

8. **Validation checklist before implementation complete**
   - Ensure only admin can reach these pages/actions (existing `requireRoleLite(Role.ADMIN)` remains intact).
   - Confirm no plain-text password persistence.
   - Confirm archived reads are from archive tables, not live soft-deleted rows.
   - Confirm styling and navigation remain consistent with current admin UI.

### Pseudo-code
```ts
// actions.ts
function parsePassword(value: FormDataEntryValue | null): string | null {
  const password = String(value ?? "").trim();
  if (password.length < 8) return null;
  return password;
}

export async function createUserForm(formData: FormData): Promise<void> {
  await requireRoleLite(Role.ADMIN);
  const email = parseEmail(formData.get("email"));
  const name = parseName(formData.get("name"));
  const role = parseRole(formData.get("role"));
  const isActive = parseBoolean(formData.get("isActive"), true);
  const password = parsePassword(formData.get("password"));
  if (!email || !name || !role || !password) return;

  await prisma.user.create({
    data: { email, name, role, isActive, password: hashPassword(password) },
  });
  revalidatePath("/admin/users");
}
```

```tsx
// users/page.tsx
const [users, archivedUsers] = await Promise.all([
  prisma.user.findMany({ orderBy: [{ isActive: "desc" }, { email: "asc" }] }),
  prisma.archivedUser.findMany({ orderBy: { archivedAt: "desc" } }),
]);

// render nav/tabs for Active users + Archived users
// render existing active list
// render archived list card/table with archivedAt, originalId metadata
```

```tsx
// menu/page.tsx
const [categories, archivedMenuItems] = await Promise.all([
  prisma.menuCategory.findMany(/* existing active query */),
  prisma.archivedMenuItem.findMany({ orderBy: { archivedAt: "desc" } }),
]);

const links = [
  { href: "#overview", label: "Overview" },
  { href: "#new-category", label: "Category form" },
  { href: "#new-item", label: "Item form" },
  { href: "#category-browser", label: "Category browser" },
  { href: "#archived-menu-items", label: "Archived menu items" },
];
```

### Key Files
| File | Operation | Description |
|------|-----------|-------------|
| `app/(admin)/admin/actions.ts` | Modify | Add password parsing/validation, use submitted password hash in `createUserForm` |
| `app/(admin)/admin/users/page.tsx` | Modify | Add password input and archived users tab/section with data fetch |
| `app/(admin)/admin/menu/page.tsx` | Modify | Add archived menu items nav/button + section and query |
| `app/(admin)/admin/actions.test.ts` | Modify | Update create-user expectations for password input hashing |
| `app/(admin)/admin/users/page.test.tsx` (if present/add) | Add/Modify | Verify archived users content renders |
| `app/(admin)/admin/menu/page.test.tsx` (if present/add) | Add/Modify | Verify archived menu nav/section renders |

### Risks and Mitigation
| Risk | Mitigation |
|------|------------|
| Password accepted with weak/empty value | Enforce parse validation (min length) and fail fast in action |
| Archived and active sections visually confusing | Distinct section titles, badge labels, and metadata rows |
| Large archive sets hurt page load | Select only needed fields and paginate later if needed |
| Tests fail due changed createUserForm behavior | Update mocks/assertions to expect hash from submitted password |

### Requirement Ambiguities / Assumptions
1. Assumption: “archived users/menu items” means records from `ArchivedUser` and `ArchivedMenuItem` tables (not filtered live tables by `deletedAt`).
2. Assumption: “tab” can be implemented as in-page anchored tab-like navigation consistent with existing menu page section-nav style.
3. Assumption: Password policy minimum for now is basic (non-empty + minimum length) unless stricter rule is specified.

### SESSION_ID (for /ccg:execute use)
- CODEX_SESSION: `e672f0b2-216b-40a0-8bb8-66c69d916ae7` (fallback subagent; local Codex CLI unavailable)
- GEMINI_SESSION: `f8fdf946-cc3b-4929-8401-ce7139e8dfa8` (fallback subagent model)
- Wrapper attempt status: `codeagent-wrapper` failed in PowerShell due missing `codex` command in PATH.

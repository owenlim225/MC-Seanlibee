# Implementation Plan: Homepage + Header Light UI Refactor

## Task Type
- [x] Frontend (UI + layout + assets)
- [ ] Backend
- [ ] Fullstack

## Requirements Restatement
- Refactor homepage and shared header in the existing Next.js 16 app to a clean light-mode presentation.
- Enforce light mode visual baseline: white (or near-white) surfaces, high-contrast dark text, readable spacing.
- Set header background to primary brand color.
- Apply provided assets:
  - Image 1 as homepage hero banner
  - Image 2 only as visual/layout guidance
  - Logo in header brand area
  - Icon as favicon/app icon
- Remove all dev-related navigation links from header, including:
  - `/dev/role-switcher` ("Dev roles")
  - `/dev/multi-role` ("Multi-role demo")
- Do not change backend/auth/api/prisma behavior.

## Context Retrieved
- `components/site-header.tsx`: current nav and dev links live here.
- `app/page.tsx`: current homepage content; no banner image yet.
- `app/layout.tsx`: global metadata and app shell; header is mounted here.
- `components/site-header.test.ts`: existing tests for header auth states; no assertions for dev-link removal yet.
- `app/globals.css`: currently includes a `prefers-color-scheme: dark` override that conflicts with "always light mode".

## ui-ux-pro-max Findings (Grounding Inputs)
- Color recommendation for food service:
  - Primary: `#DC2626`
  - Secondary: `#F87171`
  - CTA: `#CA8A04`
  - Background: `#FEF2F2` / white-like light backdrop
  - Text: `#450A0A` (deep dark red-brown)
- Next.js stack guidance:
  - Use `next/image` for images (hero/logo/icon display contexts where applicable)
  - Keep internal nav with `next/link`
  - Prefer responsive image containers (`fill` with positioned parent when needed)

## Technical Solution
- Keep design tokens centralized in `app/globals.css` and enforce light mode by removing runtime dark-scheme overrides.
- Update header styling in `components/site-header.tsx`:
  - Primary brand background + white foreground text for header actions
  - Header brand area becomes logo + name lockup
  - Remove all dev-only links unconditionally
- Build homepage hero in `app/page.tsx` using Image 1 with `next/image`, preserving a11y and responsive behavior.
- Update `app/layout.tsx` metadata icons for favicon/app icon mapping.
- Extend tests in `components/site-header.test.ts` to lock in nav cleanup and logo rendering markers.

## Implementation Steps

### Phase 1 — Token & Theme Baseline
**Deliverable:** Stable light-only theme tokens with readable contrast.
1. In `app/globals.css`, preserve light palette tokens and remove or neutralize `@media (prefers-color-scheme: dark)` overrides.
2. Keep core semantic variables (`--background`, `--foreground`, `--border`) mapped to light values.
3. Validate that body/background/text remain light mode regardless of OS setting.

### Phase 2 — Header Refactor
**Deliverable:** Branded light-mode header without dev links.
1. Edit `components/site-header.tsx`:
   - Replace plain text brand title with logo + text lockup.
   - Apply primary color background and proper foreground contrast.
   - Keep auth actions (Login/Sign up/Logout) but ensure readable contrast on primary header.
2. Remove dev link block (`/dev/role-switcher`, `/dev/multi-role`) entirely.
3. Preserve sticky behavior, spacing rhythm, and responsive wrapping.

### Phase 3 — Homepage Hero
**Deliverable:** Home hero using provided Image 1 and adapted layout from reference Image 2.
1. Edit `app/page.tsx`:
   - Create hero section with banner image and concise text hierarchy.
   - Keep the existing value cards but align spacing, typography, and CTA affordances to the new visual direction.
2. Use `next/image` for hero and any logo image usage; ensure descriptive `alt`.
3. Maintain mobile-first layout and avoid horizontal overflow.

### Phase 4 — App Icon/Favicon Integration
**Deliverable:** Icon wired into app metadata.
1. Edit `app/layout.tsx` metadata icons config to point at the provided icon asset (copied to a stable public path if needed).
2. Keep title/description consistent unless product copy update is explicitly requested.

### Phase 5 — Test & Verification Updates
**Deliverable:** Regression-proofed UI changes.
1. Update `components/site-header.test.ts`:
   - Assert no dev links rendered.
   - Assert brand area includes expected logo marker/text.
2. Add homepage test only if current test infrastructure for page rendering exists; otherwise document manual visual verification checklist.
3. Run verification commands:
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - Targeted manual responsive checks at 375/768/1024/1440 widths.

## Key Files
| File | Operation | Description |
|------|-----------|-------------|
| `app/globals.css` | Modify | Enforce light-only theme variables and remove dark override behavior |
| `components/site-header.tsx` | Modify | Apply primary header style, logo lockup, remove dev links |
| `app/page.tsx` | Modify | Add hero banner section and align homepage layout styling |
| `app/layout.tsx` | Modify | Wire icon/favicon metadata |
| `components/site-header.test.ts` | Modify | Add assertions for removed dev links and updated branding |

## Pseudo-Code (Critical Parts)

```tsx
// components/site-header.tsx (shape only)
<header className="sticky ... bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]">
  <div className="...">
    <Link href="/" className="flex items-center gap-2">
      <Image src="/branding/logo.png" alt="Mc Seanlibee logo" width={32} height={32} />
      <span>MC Seanlibee</span>
    </Link>
    <nav>
      {/* auth links only; no /dev links */}
    </nav>
  </div>
</header>
```

```tsx
// app/page.tsx (shape only)
<section className="rounded-xl border ... bg-white">
  <div className="relative aspect-[16/6] w-full overflow-hidden rounded-lg">
    <Image src="/branding/hero-banner.png" alt="Mc Seanlibee hero banner" fill className="object-cover" priority />
  </div>
  <h1>Welcome to Mc Seanlibee</h1>
  <p>...supporting text...</p>
</section>
```

```ts
// app/layout.tsx metadata (shape only)
export const metadata = {
  ...,
  icons: {
    icon: "/branding/icon.png",
    shortcut: "/branding/icon.png",
    apple: "/branding/icon.png",
  },
}
```

## Risks and Mitigation
| Risk | Mitigation |
|------|------------|
| Header contrast regression on red background | Use `--brand-primary-foreground` and verify WCAG contrast for text/actions |
| Layout shift from image insertion | Use fixed aspect ratio containers and `next/image` sizing patterns |
| Asset path breakage | Copy assets to stable public branding path and reference from there |
| Unintended nav behavior changes | Restrict edits to visual + dev-link removal only; keep auth branch logic intact |
| Theme drift from existing tokens | Update token mappings centrally in `globals.css` rather than ad hoc class overrides |

## Test Strategy
- **Unit/UI tests:**
  - `components/site-header.test.ts` assertions for:
    - no `/dev/role-switcher`
    - no `/dev/multi-role`
    - header brand text/logo marker present
- **Static verification:**
  - lint and typecheck must pass.
- **Manual visual checks:**
  - Desktop + mobile header wrapping
  - Hero rendering and cropping quality
  - Focus styles visible for keyboard nav
  - No low-contrast text on white surfaces

## Complexity & Scope
- Complexity: **Medium**
- Estimated touched files: 5
- Non-goals:
  - No backend/auth/api/db changes
  - No unrelated component redesign
  - No dependency churn unless absolutely necessary

## SESSION_ID (for /ccg:execute use)
- CODEX_SESSION: `a053389d-9a4a-4059-9733-43f5922da21d`
- GEMINI_SESSION: `e7af0a9e-d537-461f-8a3b-22549179dbb3`


# Brand Kit

## Core Palette

- Primary: `#8e1327`
- Base background: `#ffffff`
- Subtle surface: `#f5f5f6`
- Primary text: `#000000`
- Button text on primary: `#ffffff`

## Semantic Token Contract

Use semantic tokens from `app/globals.css` instead of hardcoded color values:

- `--brand-primary`, `--brand-primary-hover`, `--brand-primary-active`
- `--surface-base`, `--surface-subtle`
- `--text-primary`, `--text-muted`
- `--border-default`, `--focus-ring`
- `--motion-fast`, `--motion-base`, `--motion-slow`, `--ease-standard`

## Typography

- Brand font family: `VAG Rounded Next`
- Current implementation: fallback chain under `--font-brand-sans` until licensed asset is provided
- Approved fallback chain: `--font-brand-sans`, `Segoe UI`, `ui-sans-serif`, `system-ui`

## Interaction and State Rules

- Primary actions use the brand-primary background.
- Secondary surfaces use subtle background + border.
- Focus indicators must remain visible at all times with a brand-derived ring.
- Hover and active interactions should be subtle and never cause abrupt layout movement.

## Motion

- Standard durations:
  - Fast: `150ms`
  - Base: `200ms`
  - Slow: `300ms`
- Standard easing: `cubic-bezier(0.2, 0, 0, 1)`
- Respect `prefers-reduced-motion` with near-zero transition and animation durations.

## Accessibility Baseline

- Maintain contrast for text and key controls in both light and dark schemes.
- Keyboard users must see a clear focus outline on interactive controls.
- Avoid color-only state communication for critical statuses.

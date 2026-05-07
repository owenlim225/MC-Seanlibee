# Component Style Guide

## Buttons

- Default variant is primary.
- Primary button:
  - Background: `--brand-primary`
  - Hover: `--brand-primary-hover`
  - Active: `--brand-primary-active`
  - Text: `--brand-primary-foreground`
- Disabled buttons reduce opacity and suppress hover affordance.
- Use visible focus ring on keyboard focus.

## Cards and Containers

- Background: `--surface-base`
- Border: `--border-default`
- Radius: medium-large (`--radius-md` or `--radius-lg`)
- Hover behavior: subtle shadow or border emphasis only.

## Form Inputs

- Neutral border at rest, stronger border + focus ring on focus.
- Minimum touch-friendly hit target for auth and primary action flows.

## Status and Feedback

- Status badges should use non-saturated, readable surfaces.
- Error components use danger surface + danger text.
- Loading and empty states use muted text but maintain readability.

## Page Headers

- Titles use strong hierarchy and compact tracking.
- Description text uses muted semantic token.
- Action groups should align and wrap consistently on narrow screens.

## Navigation

- Header keeps subtle translucent background and tokenized border.
- Interactive nav items use brand accent on hover/focus.

## Motion Defaults

- Use tokenized transition durations/easing values.
- Prefer transitions on color, border-color, box-shadow, and background-color.
- Avoid aggressive transform scale for default states.

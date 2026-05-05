# Unified Menu Taxonomy Summary

## Featured categories and rationale
- **BBQ & Smoked Meats**: High-intent protein-heavy items and kits clustered for grill/comfort food browsing.
- **Burgers & Sandwiches**: Portable savory items grouped for fast decision-making in delivery contexts.
- **Pizza & Breads**: Carb-forward shareables and bakery staples commonly browsed together.
- **Steaks & Premium Meats**: Premium raw/cook-at-home meat offers separated for high-ticket buyers.
- **Fried Chicken & Wings**: Crispy chicken meals and wing/tender packs grouped by occasion demand.
- **Desserts & Ice Cream**: Sweet category unified across baked desserts and frozen treats.
- **Drinks & Mixers**: Beverage kits, mixers, and concentrates separated from food mains.

## Dedup and normalization rules used
- Parsed all list-based JSON menu files under `prisma/` and ignored non-list/non-menu files.
- Built stable key from normalized description/name text (lowercase, punctuation-stripped, harmonized phrases).
- Merged entries sharing the same normalized key; aggregated `source_files`, tags, and best-seller signals.
- Standardized display names to cleaned `dsc` text and retained the most informative description on merges.
- Kept pack-size variants as distinct items when meaningfully different (e.g., 4-pack vs 8-pack).
- Removed empty/noise records by requiring id/name and description-like text.

## Counts per category
- **BBQ & Smoked Meats**: 63 items
- **Burgers & Sandwiches**: 36 items
- **Pizza & Breads**: 41 items
- **Steaks & Premium Meats**: 22 items
- **Fried Chicken & Wings**: 19 items
- **Desserts & Ice Cream**: 57 items
- **Drinks & Mixers**: 21 items

## Notable edge-case decisions
- Items appearing in multiple files (e.g., BBQ, sandwiches, desserts overlaps) were merged by normalized key and tracked via `source_files`.
- Cross-domain kits (e.g., fried chicken sandwich kits, BBQ sandwich kits) receive secondary categories to preserve browse discoverability.
- Beverage-adjacent kits with no clear edible component were forced into `Drinks & Mixers` to avoid unclassified records.
- Mixed combo entries keep one primary category based on strongest intent keyword, with up to three secondary categories.

## Processing totals
- Raw source rows processed: **299**
- Deduplicated final items: **259**
- Duplicates merged/removed: **40**

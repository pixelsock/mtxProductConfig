# Spec Requirements Document

> Spec: Product Override Filtering Fix
> Created: 2025-09-23

## Overview

Fix the product override filtering bug where selecting products with option overrides incorrectly removes or filters other option sets that should remain unaffected. Currently, when a product override is applied (e.g., Circle products filtering sizes), other option collections like Light Direction are being inappropriately filtered or reduced.

## User Stories

### Product Override Isolation

As a user configuring a product, I want product-specific overrides to only affect their intended option collections, so that other unrelated option sets remain fully available for selection.

When I select a Circle Full Frame Edge mirror style (which has size overrides), the sizes should be filtered to only show circle-compatible options (2 options instead of 9), but Light Direction should still show all available options (Direct, Indirect, Both) rather than being reduced to just "Indirect".

### Consistent Option Availability

As a user, I want non-override option collections to maintain their full availability when product overrides are applied, so that I can still make valid selections across all relevant configuration options.

The filtering logic should distinguish between:
- Collections with product-specific overrides (should be filtered)
- Collections without overrides (should remain unfiltered)
- Collections affected by rules (should be disabled, not hidden)

## Spec Scope

1. **Override Isolation Logic** - Ensure product overrides only affect their specifically targeted option collections
2. **Dynamic Filtering Correction** - Fix the rebuildProductOptionsFromCache function to preserve non-override collections
3. **Option Set Preservation** - Maintain full availability of option sets that don't have product-specific overrides
4. **Filtering Logic Separation** - Clearly separate product override filtering from rule-based disabling and dynamic product matching
5. **Console Logging Enhancement** - Add detailed logging to track which collections are being filtered and why

## Out of Scope

- Modifying the existing product override data structure
- Changing the UI rendering logic for disabled vs hidden options
- Altering the rule processing system
- Modifying the SKU assembly logic

## Expected Deliverable

1. Circle Full Frame Edge selection filters sizes correctly (9→2 options) while preserving full Light Direction availability
2. Product override filtering only affects collections explicitly listed in products_options_overrides table
3. Console logs clearly show which collections are being filtered by overrides vs other filtering mechanisms
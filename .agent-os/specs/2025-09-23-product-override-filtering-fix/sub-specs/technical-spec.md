# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-23-product-override-filtering-fix/spec.md

> Created: 2025-09-23
> Version: 1.0.0

## Technical Requirements

- Modify `rebuildProductOptionsFromCache` function in `src/services/dynamic-filtering.ts` to only rebuild collections that have explicit product overrides
- Update filtering logic to distinguish between override-driven filtering vs rule-driven disabling vs dynamic product matching
- Preserve original option availability for collections not listed in `products_options_overrides` table
- Add collection-specific logging to track which filtering mechanism is affecting each option set
- Implement override isolation to prevent cross-collection filtering contamination
- Ensure `recomputeFiltering` function in `src/store/slices/apiSlice.ts` correctly segregates override application from other filtering types
- Add validation to verify that only intended collections are modified when product overrides are applied
- Maintain existing rule-based disabling behavior (disabled but visible options) separate from override-based hiding
- Preserve dynamic product matching behavior that filters based on actual product availability

## Approach

The issue stems from the current implementation treating all option collections uniformly when applying product overrides, rather than selectively applying overrides only to collections that have explicit override definitions in the `products_options_overrides` table.

### Core Changes Required

1. **Override Detection**: Modify the filtering logic to first identify which collections have explicit overrides for the current product
2. **Selective Rebuilding**: Only rebuild option availability for collections with actual overrides, leaving others untouched
3. **Filtering Segregation**: Clearly separate the three types of filtering mechanisms:
   - Product overrides (hide unavailable options)
   - Rule-based disabling (disable but keep visible)
   - Dynamic product matching (filter based on actual product availability)

### Implementation Strategy

- Update the `rebuildProductOptionsFromCache` function to accept a list of collections that should be rebuilt rather than rebuilding all collections
- Modify the override application logic to query the `products_options_overrides` table and only process collections that have entries
- Add debugging capabilities to trace which filtering mechanism is affecting each option collection
- Ensure the three filtering types can operate independently without interference

## External Dependencies

None - this fix uses existing dependencies and focuses on correcting the internal filtering logic.
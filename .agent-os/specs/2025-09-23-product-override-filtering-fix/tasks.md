# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-23-product-override-filtering-fix/spec.md

> Created: 2025-09-23
> Status: Ready for Implementation

## Tasks

### 1. Investigate Current Product Override Filtering Logic

- [ ] 1.1 Write tests to reproduce the product override filtering bug where non-override collections are affected
- [ ] 1.2 Analyze the `rebuildProductOptionsFromCache` function in `src/services/dynamic-filtering.ts` to understand current behavior
- [ ] 1.3 Examine the `recomputeFiltering` function in `src/store/slices/apiSlice.ts` to trace filtering flow
- [ ] 1.4 Document which collections are being rebuilt when product overrides are applied
- [ ] 1.5 Identify the root cause of cross-collection filtering contamination
- [ ] 1.6 Map the current filtering mechanisms: product overrides vs rules vs dynamic matching
- [ ] 1.7 Create test cases for Circle Full Frame Edge scenario that demonstrates the bug
- [ ] 1.8 Verify current behavior shows sizes correctly filtered (9→2) but Light Direction incorrectly reduced

### 2. Implement Override Isolation Logic

- [ ] 2.1 Write tests for selective override application that only affects intended collections
- [ ] 2.2 Modify `rebuildProductOptionsFromCache` to accept collection-specific filtering parameters
- [ ] 2.3 Update override application logic to only rebuild collections with explicit overrides in database
- [ ] 2.4 Implement collection-specific logging to track which filtering mechanism affects each option set
- [ ] 2.5 Add validation to ensure only collections listed in `products_options_overrides` are modified
- [ ] 2.6 Preserve original option availability for non-override collections during product changes
- [ ] 2.7 Test that Light Direction maintains full availability when Circle products are selected
- [ ] 2.8 Verify that size overrides still work correctly (filtering from 9 to 2 options for circles)

### 3. Separate Filtering Mechanisms

- [ ] 3.1 Write tests to verify filtering mechanism segregation works correctly
- [ ] 3.2 Create clear separation between override-driven filtering and rule-driven disabling
- [ ] 3.3 Ensure dynamic product matching filtering operates independently of product overrides
- [ ] 3.4 Implement distinct logging for each filtering type (overrides, rules, dynamic matching)
- [ ] 3.5 Update filtering flow to process each mechanism in proper sequence
- [ ] 3.6 Add safeguards to prevent one filtering type from interfering with another
- [ ] 3.7 Test that rules still properly disable options (visible but disabled) separate from override hiding
- [ ] 3.8 Verify that dynamic filtering based on product availability works independently

### 4. Enhanced Logging and Debugging

- [ ] 4.1 Write tests for enhanced logging functionality
- [ ] 4.2 Add detailed console logging to show which collections are being filtered and why
- [ ] 4.3 Implement collection-specific filtering status tracking in the store
- [ ] 4.4 Create debugging output that shows before/after states for each filtering operation
- [ ] 4.5 Add logging to distinguish between different types of option modifications
- [ ] 4.6 Include override source information in logs (which product override triggered filtering)
- [ ] 4.7 Test that console output clearly shows filtering rationale for each collection
- [ ] 4.8 Verify logging helps developers understand why specific options are hidden/disabled/available

### 5. Integration Testing and Validation

- [ ] 5.1 Write comprehensive integration tests for the complete override filtering fix
- [ ] 5.2 Test Circle Full Frame Edge scenario shows correct behavior (sizes filtered, Light Direction preserved)
- [ ] 5.3 Validate that other products with overrides work correctly without cross-contamination
- [ ] 5.4 Test products without overrides maintain full option availability across all collections
- [ ] 5.5 Verify rule-based disabling still works correctly and independently of override filtering
- [ ] 5.6 Test dynamic product matching continues to work for availability-based filtering
- [ ] 5.7 Validate that switching between products with and without overrides works correctly
- [ ] 5.8 Verify all integration tests pass for the product override filtering fix
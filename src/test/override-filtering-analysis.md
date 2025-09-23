# Product Override Filtering Bug Analysis

## Root Cause Identified

After analyzing the code in `src/services/dynamic-filtering.ts`, I've identified the core issue:

### Current Override Application Logic (Lines 263-312)

The current system only applies product overrides when there are "enough selections to identify a specific product":

```typescript
const hasEnoughSelectionsForSpecificProduct = hasProductLine && hasMirrorStyle &&
  (currentSelection.light_directions || currentSelection.frame_thicknesses);
```

**Problem**: This means overrides are NOT applied when only `mirror_style` is selected, even though Circle products should have their size restrictions applied immediately.

### Why This Causes Cross-Collection Contamination

1. **Missed Override Application**: When user selects Circle (mirror_style=2), size overrides aren't applied because the condition requires additional selections
2. **Fallback to Product Matching**: Instead, the system falls back to the product-based filtering (lines 175-257)
3. **Broad Filtering**: This product-based filtering affects ALL collections that have data in the products table, not just collections with explicit overrides

### The Bug Scenario: Circle Selection

1. User selects Circle (mirror_style=2)
2. System finds products with mirror_style=2 (products 101, 102, 105)
3. System extracts available light_directions from these products: [1, 2, 3]
4. BUT since override logic didn't run, the system may be using inconsistent filtering
5. The result is that some collections get filtered when they shouldn't

### Expected vs Actual Behavior

**Expected (after fix)**:
- Mirror style=Circle selected
- Size overrides immediately applied: sizes filtered to [5, 6]
- Light directions remain unaffected: [1, 2, 3] (no overrides for this collection)

**Current**:
- Mirror style=Circle selected
- No overrides applied (condition not met)
- Product-based filtering applied broadly
- Collections may get incorrectly filtered

## Core Issues to Fix

### 1. Override Condition Too Restrictive
The condition on line 263-264 prevents overrides from applying when they should.

### 2. Missing Collection-Specific Override Logic
The system doesn't check which collections actually have overrides before applying broad filtering.

### 3. No Isolation Between Filtering Mechanisms
Product overrides, rule-based disabling, and dynamic product matching all interfere with each other.

## Required Changes

### 1. Fix Override Application Timing
Apply overrides as soon as enough context is available, not just when a specific product is identified.

### 2. Implement Collection-Specific Override Detection
```typescript
// Pseudo-code for the fix
const getCollectionsWithOverrides = (productIds: number[]) => {
  const applicableOverrides = productOverridesCache.filter(override =>
    productIds.includes(override.products_id)
  );
  return new Set(applicableOverrides.map(o => o.collection));
};
```

### 3. Only Apply Overrides to Collections That Have Them
```typescript
// Only rebuild collections that have explicit overrides
const collectionsWithOverrides = getCollectionsWithOverrides(matchingProductIds);
Object.entries(overridesByCollection).forEach(([collection, overrideItems]) => {
  if (collectionsWithOverrides.has(collection)) {
    // Apply override
    result.all[collection] = [...new Set(overrideItems)];
    result.available[collection] = [...new Set(overrideItems)];
  }
  // Collections without overrides remain unchanged
});
```

## Test Cases Needed

1. Circle selection should filter sizes but preserve light directions
2. Products without overrides should maintain all default options
3. Override application should be collection-specific
4. Dynamic product matching should work independently of overrides

## Files to Modify

1. `src/services/dynamic-filtering.ts` - Core filtering logic
2. `src/store/slices/apiSlice.ts` - recomputeFiltering function (if needed)
3. Add comprehensive tests to verify the fix
# Filtering Mechanisms Mapping

## Current System Analysis

### Three Types of Filtering Identified

Based on analysis of `src/services/dynamic-filtering.ts` and `src/store/slices/apiSlice.ts`, there are three distinct filtering mechanisms:

#### 1. Product Line Default Options (Base Availability)
**Location**: Lines 148-160 in `dynamic-filtering.ts`
**Purpose**: Defines which collections and options should appear in the UI
**Data Source**: `product_lines_default_options` table
**Behavior**:
- Creates the base set of available options for each collection
- All options in this set are initially available
- This is the "universe" of possible options for a product line

```typescript
const baseOptionsByCollection = productLineOptions.reduce((acc, option) => {
  if (!acc[option.collection]) {
    acc[option.collection] = [];
  }
  acc[option.collection].push(option.item);
  return acc;
}, {} as Record<string, string[]>);
```

#### 2. Dynamic Product Matching (Availability Filtering)
**Location**: Lines 175-257 in `dynamic-filtering.ts`
**Purpose**: Filter options based on actual products that exist
**Data Source**: `products` table
**Behavior**:
- Finds products that match current selections (product_line + mirror_style)
- Extracts available values from product fields (mirror_style, light_direction, frame_thickness)
- Disables options that don't exist in matching products
- **Currently affects**: mirror_styles, light_directions, frame_thicknesses

```typescript
if (hasProductLine && hasMirrorStyle) {
  const filteredProducts = productsCache.filter(p =>
    p.product_line === productLineId &&
    p.mirror_style?.toString() === currentSelection.mirror_styles
  );

  // Extract available options from these specific products
  availableFromProducts.light_directions = Array.from(
    new Set(
      filteredProducts
        .map(p => p.light_direction?.toString())
        .filter((item): item is string => Boolean(item))
    )
  );
}
```

#### 3. Product Overrides (Hide Specific Options)
**Location**: Lines 262-312 in `dynamic-filtering.ts`
**Purpose**: Replace default options with product-specific restrictions
**Data Source**: `products_options_overrides` table
**Behavior**:
- ONLY applies when very specific conditions are met (too restrictive currently)
- REPLACES the entire option set for affected collections
- Should ONLY affect collections that have explicit override entries

```typescript
// Current (buggy) condition - too restrictive
const hasEnoughSelectionsForSpecificProduct = hasProductLine && hasMirrorStyle &&
  (currentSelection.light_directions || currentSelection.frame_thicknesses);

if (hasEnoughSelectionsForSpecificProduct) {
  // Apply overrides - these REPLACE the default options for affected collections
  Object.entries(overridesByCollection).forEach(([collection, overrideItems]) => {
    result.all[collection] = [...new Set(overrideItems)];
    result.available[collection] = [...new Set(overrideItems)];
    result.disabled[collection] = [];
  });
}
```

#### 4. Rule-Based Disabling (Separate System)
**Location**: `src/store/slices/apiSlice.ts` lines 292-398
**Purpose**: Disable options based on business rules while keeping them visible
**Data Source**: `rules` table processed by `rules-ui-integration.ts`
**Behavior**:
- Applied in `recomputeFiltering` function after dynamic filtering
- Disables options but keeps them visible in UI
- Can set values and disable alternatives

## Current Problem: Collections Being Rebuilt

### Collections Currently Affected by Dynamic Product Matching
Based on the code in lines 184-218:

1. **mirror_styles** - Always rebuilt from matching products
2. **light_directions** - Always rebuilt from matching products
3. **frame_thicknesses** - Always rebuilt from matching products

### Collections That Should Have Override Support
Based on database schema and spec:

1. **sizes** - Circle products have size overrides (main bug case)
2. **frame_colors** - Could have product-specific color restrictions
3. **mounting_options** - Could have product-specific mounting restrictions
4. **drivers** - Could have product-specific driver restrictions
5. **accessories** - Could have product-specific accessory restrictions

### Collections Currently Not Processed by Dynamic Matching
These rely only on product line defaults:

1. **mounting_options**
2. **drivers**
3. **color_temperatures**
4. **light_outputs**
5. **sizes** (This is part of the bug!)
6. **accessories**

## The Bug: Collection Contamination

### Root Cause Analysis

1. **Missing Override Application**: When Circle (mirror_style=2) is selected, size overrides don't apply because the condition is too restrictive
2. **Inconsistent Collection Processing**: Some collections get dynamic product matching, others don't
3. **No Override Isolation**: The system doesn't distinguish between collections with overrides vs those without

### Collections That Should Be Rebuilt vs Preserved

**Should be rebuilt when Circle is selected**:
- `sizes` - Has explicit overrides in database, should filter 9→2

**Should be preserved when Circle is selected**:
- `light_directions` - No overrides exist, but currently gets filtered by product matching
- `mounting_options` - No overrides exist, should maintain defaults
- `drivers` - No overrides exist, should maintain defaults
- `accessories` - No overrides exist, should maintain defaults

## Fix Strategy

### 1. Separate Override Detection from Product Matching

```typescript
// New function to detect which collections have overrides
const getCollectionsWithOverrides = (productIds: number[]): Set<string> => {
  const applicableOverrides = productOverridesCache.filter(override =>
    productIds.includes(override.products_id)
  );
  return new Set(applicableOverrides.map(o => o.collection));
};
```

### 2. Apply Overrides Earlier and More Selectively

```typescript
// Apply overrides when mirror_style is selected, not waiting for full product identification
if (hasProductLine && hasMirrorStyle) {
  const productsWithThisMirrorStyle = productsCache.filter(p =>
    p.product_line === productLineId &&
    p.mirror_style?.toString() === currentSelection.mirror_styles
  );

  const collectionsWithOverrides = getCollectionsWithOverrides(
    productsWithThisMirrorStyle.map(p => p.id)
  );

  // Only apply overrides to collections that actually have them
  // Leave other collections unchanged
}
```

### 3. Preserve Non-Override Collections

Collections without overrides should maintain their full availability from product line defaults, regardless of product matching results.
# Ordered SKU System Guide

## Problem Analysis

The current SKU system has two major issues:

1. **Products already have complete SKUs**: `T22i`, `W01D`, etc. in their `sku_code` field
2. **SKU structure is hardcoded**: The system ignores the `sku_code_order` collection that defines SKU structure

### Current Issues

1. **Products already have complete SKUs**: `T22i`, `W01D`, etc.
2. **System ignores them**: Uses complex SKU generation instead
3. **Rules override them**: Changes `T22i` to `W01D` 
4. **SKU structure is hardcoded**: Ignores `sku_code_order` collection
5. **Result**: User sees `W01D` but actual product is `T22i`

### The Missing Piece: `sku_code_order` Collection

Your `sku_code_order` collection defines the **order and inclusion** of different option sets:

```json
{
  "data": [
    {"id": "f24ac8f4-1015-4950-a726-f09c040de579", "sku_code_item": "product_lines", "order": 1},
    {"id": "43aa9bcd-c6cb-40fb-944e-b15894905006", "sku_code_item": "sizes", "order": 2},
    {"id": "259c5673-ba56-42c1-aa01-9c78e950cc1c", "sku_code_item": "light_outputs", "order": 3},
    {"id": "69b349b4-d535-4ba3-a6af-21c11a4cee1a", "sku_code_item": "color_temperatures", "order": 4},
    {"id": "41e19b5b-847e-4474-ac82-ae4b9de4f4d4", "sku_code_item": "drivers", "order": 5},
    {"id": "e2e58b31-269f-498e-ad3b-145f8bd82b71", "sku_code_item": "mounting_options", "order": 6},
    {"id": "40ebb49c-9e3c-44e7-8b42-10c9a4a449cf", "sku_code_item": "hanging_techniques", "order": 7},
    {"id": "3a3141f0-e546-4fd6-81be-9337459a2d4c", "sku_code_item": "accessories", "order": 8},
    {"id": "6cfb0c55-43da-4077-88d5-d5773b95b480", "sku_code_item": "frame_colors", "order": 9}
  ]
}
```

**This collection is completely ignored by the current system!**

## Solution: Ordered SKU System

### 1. Use Product SKU as Base

**Instead of generating SKUs, use the product's existing `sku_code` field:**

```typescript
// Product has: sku_code: "T22i"
// Use it directly as the core SKU
const coreSku = product.sku_code; // "T22i"
```

### 2. Use `sku_code_order` for Structure

**Build additional SKU parts based on the order collection:**

```typescript
// From sku_code_order collection:
// 1. product_lines (core SKU: T22i)
// 2. sizes (if selected: 24x36)
// 3. light_outputs (if selected: High)
// 4. color_temperatures (if selected: 3000K)
// 5. drivers (if selected: Dimmable)
// 6. mounting_options (if selected: Wall Mount)
// 7. hanging_techniques (if selected: French Cleat)
// 8. accessories (if selected: Remote+Sensor)
// 9. frame_colors (if selected: Black)

// Final SKU: T22i-2436-H-3K-DIM-WM-FC-RC+MS-BLK
```

### 3. Dynamic Configuration Display

**Show only the option sets that are enabled in `sku_code_order`:**

```typescript
// Only show options that are in sku_code_order
const enabledOptionSets = getEnabledOptionSets(skuCodeOrder);
// Result: ['product_lines', 'sizes', 'light_outputs', 'color_temperatures', ...]
```

## Implementation

### 1. SKU Code Order Service

**`src/services/sku-code-order.ts`**
- Fetches `sku_code_order` collection from Directus
- Provides functions to check if option sets should be included
- Maps option set names to config keys and options collections

### 2. Ordered SKU Builder

**`src/utils/ordered-sku-builder.ts`**
- Uses `sku_code_order` to determine SKU structure
- Builds SKU parts in the correct order
- Only includes enabled option sets
- Supports product SKU override for core SKU

### 3. Ordered SKU Display Component

**`src/components/ui/ordered-sku-display.tsx`**
- Displays SKU based on `sku_code_order` configuration
- Shows current configuration for enabled option sets
- Handles product SKU overrides

## Key Benefits

### 1. **Accuracy**
- Uses actual product SKU as base
- Follows `sku_code_order` for structure
- No more mismatched SKUs

### 2. **Flexibility**
- SKU structure defined by `sku_code_order` collection
- Easy to reorder or disable option sets
- No hardcoded SKU templates

### 3. **Maintainability**
- SKU structure managed in Directus
- No code changes needed to modify SKU order
- Clear separation of concerns

### 4. **Performance**
- Direct product SKU lookup
- No complex rule processing
- Efficient option set filtering

## Migration Strategy

### Phase 1: Create Ordered SKU System
- [x] Create `sku-code-order.ts` service
- [x] Create `ordered-sku-builder.ts` utility
- [x] Create `ordered-sku-display.tsx` component
- [x] Create demo script

### Phase 2: Test with Real Data
- [ ] Test with actual `sku_code_order` collection
- [ ] Test with real product data
- [ ] Verify SKU structure matches expectations

### Phase 3: Integrate into App
- [ ] Replace SKU display components
- [ ] Update URL synchronization
- [ ] Update product search logic

### Phase 4: Remove Old System
- [ ] Remove `buildFullSku` function
- [ ] Remove `generateProductSKU` function
- [ ] Remove complex rule processing
- [ ] Clean up unused code

## Usage Examples

### Basic SKU Display

```typescript
<OrderedSkuDisplay
  config={config}
  options={options}
  productLine={productLine}
  productSkuOverride="T22i" // Use product's actual SKU
/>
```

### With Configuration Display

```typescript
<OrderedSkuDisplay
  config={config}
  options={options}
  productLine={productLine}
  showConfiguration={true} // Show selected options
/>
```

### Programmatic SKU Building

```typescript
const result = await buildOrderedSku(config, options, productLine, {
  productSkuOverride: 'T22i' // Override core SKU
});

console.log(result.sku); // "T22i-2436-H-3K-DIM-WM-FC-RC+MS-BLK"
console.log(result.enabledParts); // ['product_lines', 'sizes', 'light_outputs', ...]
```

## Configuration Management

### Enable/Disable Option Sets

To disable an option set, remove it from the `sku_code_order` collection:

```sql
-- Disable hanging_techniques
DELETE FROM sku_code_order WHERE sku_code_item = 'hanging_techniques';
```

### Reorder Option Sets

To reorder option sets, update the `order` field:

```sql
-- Move frame_colors before accessories
UPDATE sku_code_order SET order = 7 WHERE sku_code_item = 'frame_colors';
UPDATE sku_code_order SET order = 8 WHERE sku_code_item = 'accessories';
```

### Add New Option Sets

To add new option sets, insert into `sku_code_order`:

```sql
-- Add new option set
INSERT INTO sku_code_order (sku_code_item, order) VALUES ('new_option_set', 10);
```

## Testing

Run the demo script to see how the ordered SKU system works:

```bash
# In development mode
npm run dev

# The demo will show:
# - SKU structure based on sku_code_order
# - Product SKU override handling
# - Configuration display
# - Comparison with old system
```

## Key Files

1. **Services:**
   - `src/services/sku-code-order.ts` - Manages `sku_code_order` collection
   - `src/services/simple-product-matcher.ts` - Direct product SKU matching

2. **Utils:**
   - `src/utils/ordered-sku-builder.ts` - Builds SKU using `sku_code_order`
   - `src/utils/sku-builder.ts` - Old system (to be removed)

3. **Components:**
   - `src/components/ui/ordered-sku-display.tsx` - New SKU display
   - `src/components/ui/sku-display.tsx` - Old system (to be removed)

4. **Tests:**
   - `src/test/ordered-sku-demo.ts` - Demonstration script
   - `src/test/sku-simplification-demo.ts` - Comparison demo

## Conclusion

The ordered SKU system solves both major issues:

1. **Uses actual product SKUs** instead of generating them
2. **Respects `sku_code_order` collection** for proper structure
3. **Provides flexible configuration** through Directus
4. **Eliminates complex rule processing** and hardcoded templates

**The key insight: Products have complete SKUs + `sku_code_order` defines structure = Perfect SKU system!**

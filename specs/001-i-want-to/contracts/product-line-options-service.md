# API Contract: Product Line Options Service

**Service**: ProductLineOptionsService  
**Version**: 1.0.0  
**Date**: 2025-09-25

## Interface Definition

### getProductLineDefaultOptions
**Purpose**: Retrieve all default option sets for a given product line using M2A relationship

```typescript
interface GetProductLineDefaultOptionsRequest {
  productLineId: number;
}

interface GetProductLineDefaultOptionsResponse {
  success: boolean;
  data: {
    productLine: Database['public']['Tables']['product_lines']['Row'];
    defaultOptions: M2AOption[];
  };
  error?: string;
}

interface M2AOption {
  collection: string; // e.g., 'sizes', 'colors', 'mounting_options'
  item: string; // The item ID within that collection
  itemData: any; // The actual item data from the collection table
}
```

**Behavior**:
- Query `product_lines_default_options` for M2A relationships
- For each collection/item pair, fetch actual data from the respective table
- Return empty array if no defaults configured
- Include only active items (`active = true`)
- Maintain sort order from collection tables

### getProductOptionOverrides
**Purpose**: Retrieve option overrides for a specific product

```typescript
interface GetProductOptionOverridesRequest {
  productId: number;
}

interface GetProductOptionOverridesResponse {
  success: boolean;
  data: {
    product: Database['public']['Tables']['products']['Row'];
    overrides: M2AOption[];
  };
  error?: string;
}
```

**Behavior**:
- Query `products_options_overrides` for product-specific M2A relationships
- For each collection/item pair, fetch actual data from the respective table
- Return empty array if no overrides exist
- Include only active items
- Maintain priority ordering if multiple overrides per collection

### computeEffectiveOptions
**Purpose**: Calculate final option sets considering both defaults and overrides

```typescript
interface ComputeEffectiveOptionsRequest {
  productLineId: number;
  productId?: number;
}

interface ComputeEffectiveOptionsResponse {
  success: boolean;
  data: {
    effectiveOptions: Record<string, any[]>; // collection -> items mapping
    sources: Record<string, 'product_line_default' | 'product_override'>; // collection -> source
  };
  error?: string;
}
```

**Behavior**:
- Load product line defaults from M2A relationship
- Load product overrides from M2A relationship (if productId provided)
- Merge with override precedence: product overrides supersede defaults by collection
- Return organized by collection name (e.g., 'sizes', 'colors')
- Apply rules engine filtering if applicable

## Collection Mapping

### Dynamic Collection Queries
```typescript
const COLLECTION_TABLES = {
  'sizes': 'sizes',
  'color_temperatures': 'color_temperatures',
  'frame_colors': 'frame_colors',
  'mounting_options': 'mounting_options',
  'light_directions': 'light_directions',
  'mirror_styles': 'mirror_styles',
  'frame_thicknesses': 'frame_thicknesses',
  'light_outputs': 'light_outputs',
  'drivers': 'drivers',
  // Add more as discovered from schema
} as const;
```

### Query Pattern for Collections
```sql
-- Example for 'sizes' collection
SELECT * FROM sizes 
WHERE id = ? AND active = true 
ORDER BY sort;

-- Example for 'color_temperatures' collection  
SELECT * FROM color_temperatures 
WHERE id = ? AND active = true 
ORDER BY sort;
```

## Error Handling

### Missing Product Line Defaults
```typescript
// When product_lines_default_options is empty
{
  success: true,
  data: {
    productLine: ProductLineRow,
    defaultOptions: []
  }
}
```

### Corrupted Option Override Data
```typescript
// When option override references invalid collection/item
{
  success: false,
  error: "Invalid option override configuration for product {productId}. Admin intervention required."
}
```

### Non-existent Collection Items
```typescript
// When M2A references missing items in collection tables
{
  success: false,
  error: "Product line {productLineId} references non-existent items in {collection}. Configuration error."
}
```

## Performance Requirements

- Response time: < 100ms for all operations
- Use Supabase's built-in query optimization
- Batch collection queries where possible
- Cache product line defaults (5 min TTL)
- Cache product overrides (5 min TTL)

## Validation Rules

### Request Validation
- `productLineId` must be valid number and exist in product_lines table
- `productId` must exist in products table
- `productId` must have matching `product_line` field when both provided

### Response Validation
- All collection items must have `active = true`
- Sort order must be maintained from collection tables
- No duplicate collections in effective options
- All referenced collections must exist as actual tables
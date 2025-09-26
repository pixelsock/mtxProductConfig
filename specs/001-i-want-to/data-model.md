# Data Model: Product Line Default Options Integration

**Feature**: Product Line Default Options Integration  
**Date**: 2025-09-25  
**Status**: Complete - Based on Existing Supabase Schema

## Core Entities (Existing Schema)

### product_lines
```typescript
interface ProductLine {
  id: number;
  name: string | null;
  description: string | null;
  sku_code: string | null;
  image: string | null; // References directus_files
  active: boolean | null;
  sort: number | null;
  date_updated: string | null;
}
```

### product_lines_default_options (M2A Junction Table)
```typescript
interface ProductLineDefaultOption {
  id: number;
  product_lines_id: number | null; // FK to product_lines
  collection: string | null; // The collection name (e.g., 'sizes', 'colors')
  item: string | null; // The item ID within that collection
}
```

### products
```typescript
interface Product {
  id: number;
  name: string | null;
  description: string | null;
  sku_code: string | null;
  product_line: number | null; // FK to product_lines
  mirror_style: number | null;
  light_direction: number | null;
  frame_thickness: Json | null;
  horizontal_image: string | null;
  vertical_image: string | null;
  spec_sheet: string | null;
  revit_file: string | null;
  active: boolean | null;
  sort: number | null;
  webflow_id: string | null;
}
```

### products_options_overrides (M2A Junction Table)
```typescript
interface ProductOptionOverride {
  id: number;
  products_id: number | null; // FK to products
  collection: string | null; // The collection name being overridden
  item: string | null; // The override item ID within that collection
}
```

### rules (Business Logic Engine)
```typescript
interface Rule {
  id: string;
  name: string | null;
  priority: number | null;
  if_this: Json | null; // Condition logic as JSON
  then_that: Json | null; // Action logic as JSON
}
```

### Option Collections (Examples from Schema)
```typescript
// sizes table
interface Size {
  id: number;
  name: string | null;
  width: string | null;
  height: string | null;
  sku_code: string | null;
  active: boolean | null;
  sort: number | null;
  webflow_id: string | null;
}

// color_temperatures table
interface ColorTemperature {
  id: number;
  name: string | null;
  description: string | null;
  sku_code: string | null;
  active: boolean | null;
  sort: number | null;
  webflow_id: string | null;
}

// frame_colors, mounting_options, etc. follow similar pattern
```

## M2A Relationship Logic

### Product Line Default Options
The `product_lines_default_options` table implements Many-to-Any relationships:
- **product_lines_id**: Links to specific product line
- **collection**: Specifies which option collection (e.g., 'sizes', 'colors')  
- **item**: The specific item ID within that collection

### Product Option Overrides
The `products_options_overrides` table implements product-specific overrides:
- **products_id**: Links to specific product
- **collection**: Specifies which option collection is being overridden
- **item**: The override item ID within that collection

## State Management Schema (Updated)

### ConfiguratorState (Zustand)
```typescript
interface ConfiguratorState {
  // Current selections
  selectedProductLine: Database['public']['Tables']['product_lines']['Row'] | null;
  selectedProduct: Database['public']['Tables']['products']['Row'] | null;
  
  // Available options (computed from M2A relationships)
  availableOptions: Record<string, any[]>; // collection -> items mapping
  
  // Loading states
  isLoadingOptions: boolean;
  isTransitioning: boolean;
  
  // Error states
  optionLoadError: string | null;
  
  // Actions
  setProductLine: (productLine: ProductLine) => void;
  setProduct: (product: Product) => void;
  loadProductLineDefaults: (productLineId: number) => Promise<void>;
  loadProductOverrides: (productId: number) => Promise<void>;
  clearErrors: () => void;
}
```

## Query Patterns (Real Schema)

### Load Product Line Default Options
```sql
-- Query the M2A relationship
SELECT 
  pldo.collection,
  pldo.item,
  pldo.product_lines_id
FROM product_lines_default_options pldo
WHERE pldo.product_lines_id = ?;

-- Then for each collection, query the specific table
-- e.g., for collection 'sizes':
SELECT * FROM sizes WHERE id = ? AND active = true;
```

### Load Product Option Overrides
```sql
-- Query the product overrides
SELECT 
  poo.collection,
  poo.item,
  poo.products_id
FROM products_options_overrides poo
WHERE poo.products_id = ?;

-- Then query each override collection
-- Same dynamic approach as product line defaults
```

### Rules Engine Queries
```sql
-- Get applicable rules (simplified - actual logic may be more complex)
SELECT * FROM rules 
WHERE priority IS NOT NULL 
ORDER BY priority DESC;

-- Rules contain JSON logic in if_this/then_that fields
-- Implementation will need to parse and evaluate JSON conditions
```

## Data Processing Logic

### Option Resolution Hierarchy
1. **Load product line defaults** from `product_lines_default_options`
2. **Load product overrides** from `products_options_overrides`
3. **Merge with override precedence**: Product overrides supersede defaults by collection
4. **Apply rules engine**: Filter results based on business rules
5. **Return effective options**: Final option sets for configurator

### Collection Mapping
```typescript
const OPTION_COLLECTIONS = {
  'sizes': 'sizes',
  'color_temperatures': 'color_temperatures', 
  'frame_colors': 'frame_colors',
  'mounting_options': 'mounting_options',
  'light_directions': 'light_directions',
  // ... other collections from schema introspection
} as const;
```

## Performance Considerations

### Caching Strategy
- **Product line defaults**: Cache by product_line_id (5 min TTL)
- **Product overrides**: Cache by product_id (5 min TTL)
- **Rules evaluation**: Cache by configuration state (1 min TTL)
- **Option collections**: Cache individual collections (10 min TTL)

### Query Optimization
- Index on `product_lines_default_options.product_lines_id`
- Index on `products_options_overrides.products_id` 
- Batch queries for multiple collections
- Use Supabase's built-in query optimization

## Data Validation Rules

### Runtime Validation (Zod)
```typescript
import { z } from 'zod';
import type { Database } from '../types/database';

const ProductLineSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  active: z.boolean().nullable()
});

const M2AOptionSchema = z.object({
  collection: z.string().nullable(),
  item: z.string().nullable()
});
```

### Business Rules
- Product must belong to selected product line (`products.product_line`)
- Option overrides must reference valid collections and items
- Rules engine evaluates JSON conditions against current state
- All active flags must be respected (`active = true`)
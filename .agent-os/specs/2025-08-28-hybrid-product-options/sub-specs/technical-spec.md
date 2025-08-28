# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-28-hybrid-product-options/spec.md

## Technical Requirements

### 1. Data Fetching Enhancement

- **Update getAllProducts() function** to include options_overrides field in the Directus query
- **Expand options_overrides** to include full polymorphic relationship data (item, collection)
- **Cache invalidation** strategy for product data when options_overrides change
- **Batch fetching** optimization for related option items

### 2. Hybrid Filtering Implementation

- **Create getProductSpecificOptions()** function to retrieve product-level overrides
- **Modify filterOptionsByProductLine()** to accept optional product parameter
- **Implement cascade logic**: Check product overrides → Fall back to product line defaults
- **Support all collection types**: frame_thicknesses, sizes, mirror_styles, light_directions, etc.

### 3. Type Safety & Validation

- **Extend DecoProduct interface** to include properly typed options_overrides
- **Create OptionsOverride interface** for polymorphic relationship structure
- **Add validation** for options_overrides data integrity
- **Type guards** for runtime validation of fetched data

### 4. Performance Optimization

- **Implement smart caching** for hybrid lookups (5-minute TTL with stale-while-revalidate)
- **Minimize API calls** by fetching all necessary data in single requests
- **Lazy loading** of option details only when needed
- **Memoization** of filtering results for repeated calls

### 5. UI Integration

- **Update configuration form** to use hybrid filtering for option dropdowns
- **Maintain current user experience** - no visible changes for products without overrides
- **Dynamic option availability** based on selected product
- **Clear indication** when using product-specific vs product-line options (developer console only)

## Implementation Details

### Modified getAllProducts Query Structure
```typescript
fields: [
  'id',
  'name',
  'product_line',
  'mirror_style',
  'light_direction',
  'frame_thickness',  // Add if direct field exists
  'vertical_image',
  'horizontal_image',
  'additional_images.directus_files_id.id',
  'options_overrides.id',
  'options_overrides.item',
  'options_overrides.collection',
  'active'
]
```

### New Interface Definitions
```typescript
interface OptionsOverride {
  id: number;
  products_id?: number;
  item: string;  // ID of the related item
  collection: string;  // Collection name (e.g., 'frame_thicknesses')
}

interface ProductWithOverrides extends DecoProduct {
  options_overrides?: OptionsOverride[];
}
```

### Hybrid Filtering Function Signature
```typescript
function filterOptionsByProductLine<T extends { id: number }>(
  allOptions: T[],
  productLine: ProductLine,
  collectionName: string,
  product?: ProductWithOverrides  // New optional parameter
): T[]
```

## Testing Requirements

- **Unit tests** for hybrid filtering logic with various override scenarios
- **Integration tests** for Directus API calls with options_overrides
- **Performance tests** to ensure no regression in load times
- **Fallback tests** to verify backward compatibility
- **Edge cases**: Empty overrides, invalid collection names, missing items
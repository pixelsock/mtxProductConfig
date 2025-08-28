# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-28-hybrid-product-options/spec.md

## Modified API Endpoints

### GET /items/products

**Purpose:** Fetch products with their options_overrides for hybrid filtering
**Modified Fields:** Added options_overrides relationship expansion
**Parameters:** 
- `fields`: Now includes `options_overrides.id,options_overrides.item,options_overrides.collection`
- `filter`: Existing filters remain unchanged
**Response Enhancement:**
```json
{
  "data": [{
    "id": 1720,
    "name": "T01D",
    "product_line": 1,
    "options_overrides": [
      {
        "id": 22,
        "item": "2",
        "collection": "frame_thicknesses"
      }
    ]
  }]
}
```

### GET /items/products_options_overrides

**Purpose:** Direct access to options overrides for bulk operations
**Parameters:**
- `filter[products_id]`: Filter by specific product
- `filter[collection]`: Filter by collection type
**Response:**
```json
{
  "data": [{
    "id": 22,
    "products_id": 1720,
    "item": "2",
    "collection": "frame_thicknesses"
  }]
}
```

## New Service Layer Functions

### getProductWithOverrides(productId: number)

**Purpose:** Fetch a single product with fully expanded options_overrides
**Parameters:** Product ID
**Response:** Product object with options_overrides array
**Errors:** 404 if product not found, 500 for server errors

### getFilteredOptionsForProduct(product: ProductWithOverrides, collectionName: string)

**Purpose:** Get filtered options for a specific product using hybrid logic
**Parameters:** 
- `product`: Product object with options_overrides
- `collectionName`: Name of the options collection
**Response:** Array of filtered option objects
**Logic Flow:**
1. Check product.options_overrides for matching collection
2. If found, return only those specific options
3. If not found, fall back to product line defaults
4. If no product line defaults, return all active options

### batchFetchOptionItems(overrides: OptionsOverride[])

**Purpose:** Efficiently fetch actual option items for multiple overrides
**Parameters:** Array of OptionsOverride objects
**Response:** Map of collection → items
**Optimization:** Groups by collection to minimize API calls

## Caching Strategy

### Cache Keys
- `products:all` - All products with overrides (5 min TTL)
- `product:{id}:overrides` - Specific product overrides (5 min TTL)
- `options:{collection}:{productId}` - Filtered options per product (5 min TTL)

### Cache Invalidation
- Clear on product update via Directus webhook (if configured)
- Manual clear via `clearCache()` function
- Automatic expiry after TTL

## Error Handling

### Graceful Degradation
- If options_overrides fetch fails → Use product line defaults
- If specific option item not found → Skip that option
- If collection name invalid → Return empty array with console warning

### Logging
- Log all API calls with timing information
- Warn on fallback to defaults
- Error on complete failure to fetch options
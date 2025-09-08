# Full SKUs Test - Custom Directus Endpoint

This directory contains the implementation and testing for a custom Directus endpoint that generates all possible SKU combinations based on:

1. **Product Lines** - Shows all default options available
2. **Products** - Individual products with potential option overrides via `products_options_overrides`
3. **SKU Code Order** - Defines the order SKUs should be presented
4. **Rules** - Business logic that modifies or constrains combinations

## Architecture Overview

### Data Flow
1. **Product Line Default Options** → Base set of available options per product line
2. **Product Options Overrides** → Product-specific replacements for default options (replaces entire option set for that collection)
3. **Rules Engine** → Applies business logic to filter/modify combinations
4. **SKU Code Order** → Determines final SKU structure ordering

### Key Collections
- `product_lines` - Contains `default_options` (M2A relationship to various option collections)
- `products` - Contains `options_overrides` (M2A relationship via `products_options_overrides`)
- `products_options_overrides` - Junction table linking products to replacement options by collection
- `rules` - Contains `if_this`/`then_that` logic for combinations
- `sku_code_order` - Defines SKU component ordering (products=0, sizes=3, light_outputs=4, etc.)

### Override Logic
When a product has entries in `products_options_overrides` for a specific collection (e.g., "sizes"), those options **completely replace** the default options from the product line for that collection. This allows products to have different available sizes, colors, etc. than the product line defaults.

## Implementation Plan

### Phase 1: Core SKU Generation
- [ ] Create base SKU generator function
- [ ] Implement product line option resolution
- [ ] Handle product-specific overrides (replacement logic)
- [ ] Apply SKU code ordering

### Phase 2: Rules Engine Integration
- [ ] Parse and apply rules logic
- [ ] Handle conditional requirements
- [ ] Implement option filtering/modification

### Phase 3: API Endpoint
- [ ] Create custom Directus endpoint
- [ ] Add query parameters for filtering
- [ ] Implement caching for performance
- [ ] Add comprehensive error handling

### Phase 4: Testing & Validation
- [ ] Unit tests for core logic
- [ ] Integration tests with real data
- [ ] Performance testing
- [ ] Documentation and examples

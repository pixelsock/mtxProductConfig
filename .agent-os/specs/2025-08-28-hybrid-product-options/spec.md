# Spec Requirements Document

> Spec: Hybrid Product Options System
> Created: 2025-08-28

## Overview

Implement a hybrid product options system that enables product-specific option overrides while maintaining backward compatibility with existing product-line based defaults. This allows for granular control of available options per product, improving filtering and search capabilities.

## User Stories

### Product Configuration with Specific Options

As a customer configuring a Deco mirror product, I want to see only the options that are actually available for my specific product model, so that I can make valid configuration choices without seeing irrelevant options.

When configuring product T01D, the system checks for product-specific frame thickness options first (via options_overrides), then falls back to product line defaults if no overrides exist. This ensures accurate option availability while maintaining backward compatibility for products without specific overrides.

### Admin Bulk Updates

As an admin managing product data, I want to bulk update product options in Directus, so that I can efficiently manage which options are available for specific products without modifying the entire product line.

Directus administrators can use bulk operations to add options_overrides to multiple products at once, gradually migrating from product-line defaults to product-specific configurations as needed.

## Spec Scope

1. **Options Override Support** - Extend product fetching to include options_overrides field for all products
2. **Hybrid Filtering Logic** - Implement logic that checks product-specific overrides first, then falls back to product-line defaults
3. **Backward Compatibility** - Maintain existing product-line filtering for products without overrides
4. **Collection Support** - Support all option collections (frame_thicknesses, sizes, mirror_styles, etc.) in the hybrid system
5. **Performance Optimization** - Implement efficient caching strategy for hybrid lookups

## Out of Scope

- Full migration of all existing product data (manual migration approach)
- Modification of Directus admin interface
- Changes to the rules engine or SKU generation logic
- Removal of product-line default options system

## Expected Deliverable

1. Products with options_overrides display only their specific options in the configuration UI
2. Products without overrides continue using product-line defaults as before
3. Deco products with frame_thickness overrides show correct frame options
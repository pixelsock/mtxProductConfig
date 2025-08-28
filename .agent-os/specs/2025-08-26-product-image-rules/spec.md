# Spec Requirements Document

> Spec: Product Image Rules System
> Created: 2025-08-26

## Overview

Implement a rules-based product image rendering system that dynamically selects and displays the correct product images based on configuration rules, product attributes, and user selections. The system will use SKU generation rules to determine which product variant to display and select the appropriate image orientation based on mounting options.

## User Stories

### Product Image Display

As a customer configuring a product, I want to see the correct product image that matches my exact configuration, so that I can visualize the actual product I'm ordering.

When I select different configuration options (frame thickness, mirror style, light direction, mounting orientation), the product image should automatically update to show the exact variant that matches my selections. The system should apply rules to generate the correct SKU, find the matching product, and display the appropriate image orientation.

### Rules-Based SKU Override

As a product manager, I want to define rules that override the default SKU generation based on specific configuration combinations, so that complex product relationships can be properly represented.

For example, when the Deco product line is selected with a thin frame, the system should generate SKU "T01" instead of the default "W". These rules should be maintainable in a rules collection and applied automatically during configuration.

### Image Orientation Selection

As a customer, I want to see the product in the correct orientation based on my mounting selection, so that I can visualize how the product will look when installed.

When I select portrait mounting, the system should display the vertical product image. When I select landscape mounting, the system should display the horizontal product image. If only one orientation is available, that should be shown regardless of the mounting selection.

## Spec Scope

1. **Rules Engine Implementation** - Build a rules processor that applies SKU override rules from the rules collection based on configuration selections
2. **SKU Generation Logic** - Create a system that generates product SKUs by combining base SKU codes with configuration-specific suffixes
3. **Product Matching Algorithm** - Implement logic to find the correct product based on generated SKU and available variants
4. **Image Selection System** - Build the logic to select vertical or horizontal images based on mounting orientation and availability
5. **Real-time Image Updates** - Ensure images update immediately as configuration options change

## Out of Scope

- Creating new product images or image editing functionality
- Bulk rule management UI
- Image fallback generation for missing products
- Custom image upload by customers
- 3D product visualization

## Expected Deliverable

1. Product images update correctly when any configuration option changes (frame thickness, mirror style, light direction, mounting)
2. Rules from the rules collection are applied to override default SKU generation
3. The correct product variant is selected based on the generated SKU and available options
4. Images display in the correct orientation (vertical/horizontal) based on mounting selection
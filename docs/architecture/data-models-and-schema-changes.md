# Data Models and Schema Changes

## New Data Models

### sku_formulas (Optional - Alternative: embed in product_lines)
**Purpose:** Store dynamic SKU generation logic as safe, evaluable expressions

**Integration:** References existing product_lines and provides formula evaluation for SKU building

**Key Attributes:**
- `id`: string - Formula identifier
- `product_line_id`: relation - Links to existing product_lines
- `formula_expression`: text - Safe DSL expression for SKU generation
- `mapping_overrides`: json - Special case overrides for formula exceptions
- `active`: boolean - Enable/disable formula

**Relationships:**
- **With Existing:** One-to-one or one-to-many with product_lines
- **With New:** Used by enhanced SKU generation service

**Image Handling - Current State Preserved:**
Your existing `products` collection with `vertical_image` and `horizontal_image` fields will continue to be used exactly as it is currently implemented. No image layering changes needed - the existing product image system is maintained.

## Schema Integration Strategy

**Database Changes Required:**
- **New Tables:** Optionally `sku_formulas` (if not embedded in product_lines)
- **Modified Tables:** `configuration_ui` enhanced with metadata fields (label, value_field, display_field, image_field, status_mode, section_sort)
- **New Indexes:** Composite indexes on configuration_ui.section_sort
- **Migration Strategy:** Additive schema changes only - no modifications to existing tables, all new fields optional with sensible defaults

**Backward Compatibility:**
- All existing collections remain unchanged in structure
- **Products image system preserved**: Current vertical_image/horizontal_image approach maintained exactly as-is
- Enhanced configuration_ui fields are optional with backward-compatible defaults
- Existing API endpoints continue to function without modification during transition

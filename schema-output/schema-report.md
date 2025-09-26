# Supabase GraphQL Schema Analysis

Generated: 2025-09-26T01:10:28.831Z

## Overview

- **Total Types**: 410
- **Collection Types**: 68
- **Product Collections**: 22

## Product Collections

### color_temperatures

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: color_temperaturesFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [color_temperaturesOrderBy!] - Sort order to apply to the collection

### configuration_attributes

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: configuration_attributesFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [configuration_attributesOrderBy!] - Sort order to apply to the collection

### configuration_dependencies

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: configuration_dependenciesFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [configuration_dependenciesOrderBy!] - Sort order to apply to the collection

### configuration_options

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: configuration_optionsFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [configuration_optionsOrderBy!] - Sort order to apply to the collection

### configuration_pricing

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: configuration_pricingFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [configuration_pricingOrderBy!] - Sort order to apply to the collection

### configuration_ui

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: configuration_uiFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [configuration_uiOrderBy!] - Sort order to apply to the collection

### drivers

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: driversFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [driversOrderBy!] - Sort order to apply to the collection

**Node Fields:**
- `nodeId`: ID! - Globally Unique Record Identifier
- `id`: Int!
- `name`: String
- `description`: String
- `specs`: JSON
- `active`: Boolean
- `sort`: Int
- `sku_code`: String
- `webflow_id`: String
- `sku_indexCollection`: sku_indexConnection

### frame_colors

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: frame_colorsFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [frame_colorsOrderBy!] - Sort order to apply to the collection

### frame_thicknesses

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: frame_thicknessesFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [frame_thicknessesOrderBy!] - Sort order to apply to the collection

### light_directions

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: light_directionsFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [light_directionsOrderBy!] - Sort order to apply to the collection

### light_outputs

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: light_outputsFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [light_outputsOrderBy!] - Sort order to apply to the collection

### mirror_styles

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: mirror_stylesFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [mirror_stylesOrderBy!] - Sort order to apply to the collection

### mounting_options

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: mounting_optionsFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [mounting_optionsOrderBy!] - Sort order to apply to the collection

### product_configurations

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: product_configurationsFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [product_configurationsOrderBy!] - Sort order to apply to the collection

### product_line_configurations

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: product_line_configurationsFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [product_line_configurationsOrderBy!] - Sort order to apply to the collection

### product_lines

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: product_linesFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [product_linesOrderBy!] - Sort order to apply to the collection

### product_lines_default_options

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: product_lines_default_optionsFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [product_lines_default_optionsOrderBy!] - Sort order to apply to the collection

### product_option_cache

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: product_option_cacheFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [product_option_cacheOrderBy!] - Sort order to apply to the collection

### products

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: productsFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [productsOrderBy!] - Sort order to apply to the collection

**Node Fields:**
- `nodeId`: ID! - Globally Unique Record Identifier
- `id`: Int!
- `name`: String
- `description`: String
- `active`: Boolean
- `sort`: Int
- `light_direction`: Int
- `revit_file`: UUID
- `spec_sheet`: UUID
- `mirror_style`: Int
- `webflow_id`: String
- `horizontal_image`: UUID
- `product_line`: Int
- `vertical_image`: UUID
- `frame_thickness`: JSON
- `sku_code`: String
- `directus_files`: directus_files
- `light_directions`: light_directions
- `mirror_styles`: mirror_styles
- `product_lines`: product_lines
- `directus_files`: directus_files
- `directus_files`: directus_files
- `directus_files`: directus_files
- `products_files_1Collection`: products_files_1Connection
- `products_options_overridesCollection`: products_options_overridesConnection
- `sku_indexCollection`: sku_indexConnection
- `product_configurationsCollection`: product_configurationsConnection
- `dynamic_sku_indexCollection`: dynamic_sku_indexConnection
- `product_option_cacheCollection`: product_option_cacheConnection

### products_files_1

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: products_files_1Filter - Filters to apply to the results set when querying from the collection
- `orderBy`: [products_files_1OrderBy!] - Sort order to apply to the collection

### products_options_overrides

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: products_options_overridesFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [products_options_overridesOrderBy!] - Sort order to apply to the collection

### sizes

**Query Arguments:**
- `first`: Int - Query the first `n` records in the collection
- `last`: Int - Query the last `n` records in the collection
- `before`: Cursor - Query values in the collection before the provided cursor
- `after`: Cursor - Query values in the collection after the provided cursor
- `offset`: Int - Skip n values from the after cursor. Alternative to cursor pagination. Backward pagination not supported.
- `filter`: sizesFilter - Filters to apply to the results set when querying from the collection
- `orderBy`: [sizesOrderBy!] - Sort order to apply to the collection

**Node Fields:**
- `nodeId`: ID! - Globally Unique Record Identifier
- `id`: Int!
- `name`: String
- `active`: Boolean
- `sort`: Int
- `sku_code`: String
- `width`: String
- `height`: String
- `webflow_id`: String
- `sku_indexCollection`: sku_indexConnection


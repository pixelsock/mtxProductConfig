# Product Mission

## Pitch

MTX Product Configurator helps contractors, designers, and consumers configure and quote custom mirrors and lighting with rule-driven availability, accurate SKU generation/search, and orientation-aware product imagery sourced directly from Directus.

## Users

### Primary Customers

- **Contractors**: Quickly spec and quote custom mirrors for commercial and residential projects
- **Interior Designers**: Precisely tailor options and present clear, professional proposals
- **End Consumers**: Confidently choose options with transparent, rule-valid configurations

### User Personas

**Commercial Contractor** (35–55)
- **Role:** Project Manager / Purchasing
- **Pain Points:** Manual quotes, configuration errors, unclear availability
- **Goals:** Fast, accurate specs; valid combinations; reliable pricing

**Interior Designer** (28–45)
- **Role:** Lead Designer / Consultant
- **Pain Points:** Complex option matrices; SKU ambiguity; asset sourcing
- **Goals:** Guided configuration; deterministic SKUs; shareable product images

**Homeowner** (30–65)
- **Role:** Direct Purchaser
- **Pain Points:** Too many choices; uncertainty about compatibility
- **Goals:** Clear steps; only valid options; easy quote export

## The Problem

### Configuration Complexity
Custom products span 13+ attributes. Static catalogs and manual cross-checking cause invalid combinations, SKU mistakes, and rework.

**Our Solution:** Rules-driven filtering from Directus ensures only compatible options appear based on current selections.

### Quoting Friction
Back-and-forth clarification and SKU mismatches slow sales and erode confidence.

**Our Solution:** Deterministic SKU generation and search-by-SKU enable fast quoting and reliable product lookup.

### Image Accuracy
Customers need to see the correct product orientation and supporting visuals without bespoke rendering pipelines.

**Our Solution:** Use product images from Directus (`vertical_image`, `horizontal_image`, and `additional_images`) with orientation logic derived from mounting selections.

## Differentiators

### Rule-Driven Availability
- **Directus Rules:** Evaluate Directus-style filters to apply constraints and overrides in real time.
- **Action Application:** Apply `than_that` actions to adjust state (including SKU overrides) as selections change.

### Robust SKU System
- **Generation:** Build SKUs from product line + style + light direction with rule-based overrides.
- **Parsing & Search:** Parse partial/full SKUs and infer product line; prefill configurations and locate matching products.

### Orientation-Aware Imagery
- **Directus Assets:** Prefer `vertical_image` or `horizontal_image` per mounting; fall back to `applicationImage`.
- **Additional Media:** Surface thumbnails from `additional_images` for richer context.

### Directus-Native Data
- **Source of Truth:** All options and availability come from Directus collections; no hard-coded logic.
- **Efficient Fetching:** SDK + GraphQL bulk queries, paginated REST, 5‑minute cache, and runtime validation.

## Key Features

### Core Configuration
- **Product Line Selection:** Deco, Thin, Tech; options filtered by product-line defaults.
- **Smart Filtering:** Availability derives from Directus rules and current selections.
- **SKU Generation:** Produce deterministic SKUs with rule-aware overrides.
- **Search by SKU:** Paste or type a SKU to prefill and find matching products.
- **Instant Quoting:** Export specs with customer details for follow-up.

### Rules Engine
- **Evaluate Conditions:** Parse `_and`/`_or` trees and field operators (`_eq`, `_in`, etc.) against current config.
- **Apply Actions:** Merge `than_that` actions to set fields and override `sku_code` when applicable.
- **Constraints:** Compute allow/deny sets per field to drive option availability.

### Product Images
- **Orientation Logic:** Select `vertical_image` or `horizontal_image` based on mounting; gracefully fall back.
- **Additional Images:** Pull related assets from `additional_images` (Directus files M2M) for thumbnails.
- **Direct URLs:** Construct asset URLs via Directus `/assets/{id}`; validate availability where needed.

### Data & Performance
- **Directus SDK:** Auth via static token; resilient to public mode when necessary.
- **Bulk Fetch:** GraphQL query for collections; REST pagination for large sets (e.g., `products`).
- **Caching & Validation:** 5‑minute cache window with runtime type checks and consistency reports.

## Out of Scope (Current)
- **SVG Layering:** We’ve paused SVG-based rendering; product imagery now comes from Directus assets as described above.
- **Server-Only Secrets:** All browser-exposed values use `VITE_*` patterns and avoid sensitive tokens.

## Success Criteria
- **Accuracy:** Only valid combinations are selectable per rules and product data.
- **Determinism:** SKU generation and parsing agree bidirectionally for supported formats.
- **Clarity:** Users see the correct orientation image and accessible additional media.
- **Speed:** Fast option filtering and product lookup with lightweight caching.

## Future Directions
- **Enhanced Pricing Logic:** Centralize price calculations via rules and server endpoints.
- **Saved Configurations:** History, templates, and comparisons for faster repeat quoting.
- **Deeper Integrations:** CRM/ERP sync and order submission once SKU/availability are finalized.

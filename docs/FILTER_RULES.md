Here’s a concise, staged plan to make the configurator fully data-driven from your Directus schema (based on the schema.json we just pulled and
your current code). The goal: admins can add option sets, options, rules, and UI layout in Directus with zero code changes.

What I Saw

- Core option collections exist: product_lines, frame_colors, frame_thicknesses, mirror_styles, mirror_controls, light_directions,
light_outputs, mounting_options, color_temperatures, drivers, accessories, products.
- UI driver exists: configuration_ui with fields: collection, ui_type, sort.
- Rules system exists: rules (fields: name, priority, if_this JSON, then_that JSON) plus helper tables for rule groups.
- Defaults/overrides exist: product_lines_default_options, products_options_overrides.
- Files/images relations collections present (products_files, etc.).

Plan focuses on centralizing “what’s an option set” + UI layout + rules + SKU into Directus-managed metadata and simplifying code to read and
render it generically.

Phase 1 — Directus Conventions

- OptionSet tagging: Add a lightweight convention to identify “option collections”.
    - Option A: Create option_sets collection with rows mapping a collection name to display metadata (label, order, value field, image field,
active/status semantics).
    - Option B: Use configuration_ui.collection to imply option sets and extend configuration_ui with new fields (recommended below).
- Status filtering: Standardize on status with published values and fallback to active when absent. Store this in OptionSet metadata so code
never hard-codes it.

Phase 2 — OptionSet Registry + Fetching

- Option registry: Build OptionRegistry that reads from configuration_ui (with the new fields below) to discover which collections are options
and how to fetch them.
    - Proposed configuration_ui fields to add (non-breaking):
    - `label` (string): Friendly name for the option set
    - `value_field` (string): Field to use as the value (e.g., `id` or `sku_code`)
    - `display_field` (string): Field to show in UI (e.g., `name`)
    - `image_field` (string): Field or relation pointing to a `directus_files_id`
    - `status_mode` (enum): `status|active|none`
    - `published_values` (json): e.g., ["published"]
    - `sort_field` (string): Optional sort field
- Generic fetch: Replace per-collection fetchers with getOptions(optionSetName[, filters]).
    - Centralizes: relations expansion, file IDs, status filtering, sorting, and pagination.
    - Keep existing functions as thin pass-throughs initially to avoid widespread app changes.

Phase 3 — Dynamic UI from configuration_ui

- UI renderer: Map ui_type to component types (e.g., multi, color-swatch, size-grid, grid-2) and drive component props from OptionRegistry
metadata.
- Grouping and layout: Extend configuration_ui to support grouping/sections:
    - Add fields: group (string), section_label (string), section_sort (int)
- Per-product or per-line overrides: If needed, support item in configuration_ui to present UI variations (you already have item field
present).

Phase 4 — Rules Engine Generalization

- Keep rules format: if_this as Directus filter JSON and then_that as actions.
- Field addressing scheme: Use canonical field addresses like optionSet.collection.field or a short alias defined in OptionRegistry so rules
remain stable if display names change.
- Actions: Support core actions generically:
    - Require/disable/hide options
    - Set default/force value
    - Mutually exclude/require groups
- Evaluation: Run rules on config change with conflict resolution by priority.
- Authoring guardrails: Add a “rules validator” script (you already have patterns) that checks referenced collections/fields/options exist.

Phase 5 — SKU Generation as Content

- SKU formulas: Move SKU logic to Directus with one of:
    - sku_formulas collection with:
    - `applies_to` (e.g., product_line)
    - `expression` (string or JSON AST for a safe expression runtime)
    - `segments` (array for prefixed/conditional concatenation)
- Or embed formula JSON per product_lines row.
- Implement a safe evaluator (no eval) with a small DSL:
    - e.g., concat, upper, map, pad, conditionals on config fields.
- Mapping tables for exceptions: Add sku_mappings for special-case overrides the formula can consult.

Phase 6 — Images and Layers via Metadata

- Image sources: Define image_field in OptionRegistry and standardize image picking in image-selector.ts.
- Layering: Add image_layers collection referencing option combinations → file IDs, z-order, blend mode, visibility condition (filter JSON).
- Render pipeline reads this table to render layers dynamically; admins add new layers or assets without code changes.

Phase 7 — Realtime + Cache Invalidation

- Subscribe to configuration_ui, rules, and all option collections via Directus Realtime (already scaffolded in scripts/watch-schema.ts).
- On change:
    - Invalidate OptionRegistry and data caches.
    - Re-run rules and re-render UI.
- Fallback polling for environments without websockets (already implemented).

Phase 8 — Cleanup + Hardening

- Remove/redirect per-collection service calls to generic getOptions.
- Consolidate duplicated validators (browser-api-validator.ts and api-validator.ts) into a single, schema-driven variant.
- Ensure strict status filtering across all collections from OptionRegistry metadata; remove ad-hoc checks.
- Normalize file relation handling (direct and *_files M2M).

Phase 9 — Documentation and Guardrails

- Admin guide: How to add a new option set, configure configuration_ui, create rules, define SKU formulas, and add image layers.
- Scripts:
    - npm run schema:snapshot (done)
    - npm run validate:rules (update to use final conventions)
    - npm run options:report to list current option sets + health checks.
- Optional: Prepublish hook to run quick validators.

Proposed first change request to Directus content model

- Extend configuration_ui with the fields listed in Phase 2 and 3. This remains backward compatible with your current getConfigurationUi().
- Optionally add a new option_sets collection if you want to keep configuration_ui strictly about UI layout; either approach is fine, but one
place is simpler.

Implementation order (low-risk to high-value)

- Implement OptionRegistry reader from configuration_ui + generic getOptions.
- Refactor UI rendering to read from OptionRegistry and configuration_ui.ui_type.
- Generalize rules engine with canonical field addressing and validate script.
- Move SKU generation to formulas + mapping tables.
- Introduce image layer metadata and renderer.
- Wire realtime to invalidate caches.
- Remove legacy code and update docs.
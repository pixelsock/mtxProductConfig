# Repository Guidelines

## NEVER
- NEVER use fallback logic for anything. 
## Project Structure & Module Organization
- `src/`: Application code
  - `components/`: React UI (Shadcn UI + Tailwind)
  - `services/`: Directus SDK, rules engine, product matching, SKU, images
  - `utils/` and `tools/`: small helpers and query validation
  - `test/`: dev-only runtime checks (no test runner configured)
- `scripts/`: Node/ bash utilities (schema, rules validation, types)
- `data/` and `deco-thin-svgs/`: curated option data and SVG assets
- `payload/`: admin/tools (not required to run the configurator)
- `docs/`: developer notes and workflow references

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server (hot reload)
- `npm run build`: Type-check with `tsc` and produce production build
- `npm run preview`: Serve the built app locally
- `npm run lint`: ESLint over `ts/tsx`
- Useful scripts:
  - `scripts/rules-phase2-validate.sh`: cURL test for Directus rules
  - `node scripts/introspect-schema.js`: schema sanity checks

Example: `VITE_DIRECTUS_URL=https://pim.dude.digital VITE_DIRECTUS_API_KEY=... npm run dev`

## Coding Style & Naming Conventions
- Language: TypeScript + React 18, ESNext modules
- Style: 2‑space indentation, Prettier-compatible; keep imports sorted logically
- Linting: ESLint (`npm run lint`), strict TS in `tsconfig.json`
- Naming: `PascalCase` React components, `camelCase` functions/vars, `kebab-case` file names except React components
- Do not hard‑code option logic; all availability must derive from Directus data + rules

## Testing Guidelines
- No formal test runner configured; use dev scripts and targeted checks:
  - `node test-rules-system.js`
  - `node test-configuration-matching.js`
  - `scripts/rules-phase2-validate.sh`
- Prefer small, reproducible cases against the live Directus API
- Add new checks under `src/test/` or `scripts/` following existing patterns

## Commit & Pull Request Guidelines
- Commits: concise, action‑oriented subjects; scope first when helpful
  - Examples: `rules: apply constraints on init`, `availability: compute light_direction per mirror_style`
- PRs must include:
  - Summary of changes and rationale
  - Screenshots/GIFs for UI changes
  - Steps to validate (commands, sample mirror styles)
  - Any Directus collections/fields affected

## Security & Configuration Tips
- Do not commit secrets. `VITE_*` values are exposed to the browser; use only non‑sensitive tokens there.
- Server‑only secrets (e.g., `DIRECTUS_TOKEN`) must remain outside client builds.
- Minimal env to run locally: `VITE_DIRECTUS_URL`, `VITE_DIRECTUS_API_KEY`.

## Directus Schema Summary (current)
- Core option sets: `mirror_styles`, `light_directions`, `frame_thicknesses`, `frame_colors`, `mounting_options`, `drivers`, `light_outputs`, `color_temperatures`, `accessories`, `sizes`.
  - Required fields: `id (integer)`, `name (string)`, `sku_code (string)`, `active (boolean)`, `sort (integer)`.
  - Extras by collection: `frame_colors.hex_code`, `light_directions.svg_code`, `mirror_styles.svg_code`, `sizes.width`, `sizes.height`.
- Products: `products`
  - Fields: `id`, `name`, `sku_code`, `product_line (m2o)`, `mirror_style (m2o)`, `light_direction (m2o)`, `frame_thickness (json)`, `vertical_image (file)`, `horizontal_image (file)`, `additional_images (files alias)`, `options_overrides (m2a alias)`, `active`, `sort`.
- Product Lines: `product_lines`
  - Fields: `id`, `name`, `sku_code`, `description`, `image (file)`, `active`, `sort`, `default_options (m2a alias via product_lines_default_options)`.
- Images
  - Source of truth: `products.vertical_image` and `products.horizontal_image` (file fields)
  - Thumbnails: `products.additional_images` (files alias)
  - Note: The `configuration_images` collection is not used.

- UI + SKU control:
  - `configuration_ui`: `id (uuid)`, `collection (string)`, `ui_type (string)`, `sort (int)`, `date_updated (timestamp)`. Optional UI fields are supported by the app when present (`label`, `value_field`, etc.) but not required.
  - `sku_code_order`: `id (uuid)`, `sku_code_item (string)`, `order (int)`.
- Rules: `rules`
  - Fields: `id (uuid)`, `name (string)`, `priority (int|null)`, `if_this (json)`, `then_that (json)`.
  - Notes: Validators accept `then_that` (preferred) and fallback to legacy `than_that` if encountered.

## Image Handling Notes
- Use `products.vertical_image` and `products.horizontal_image` for hero/layered rendering.
- Use `products.additional_images` for thumbnails and galleries.
- We do not use a `configuration_images` collection; remove or refactor any references when encountered.

## Rules Field Naming Change
- The application logic now standardizes on `then_that` for rule actions.
- Validators and runtime support legacy `than_that` for backward compatibility, but new data should use `then_that` only.

## Validation Utilities
- Node: `apiValidator.runFullValidation()` via `src/services/api-validator.ts` (uses curl under the hood)
- Browser console: `validateAPI()` from `src/services/browser-api-validator.ts`
- Both check:
  - Core collections and required fields
  - Rules structure (`if_this`, `then_that`)
  - Product line default options linking

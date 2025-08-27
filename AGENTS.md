# Repository Guidelines

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

mtx-product-configurator Brownfield Architecture Document

Introduction
This document captures the current state of the mtx-product-configurator codebase. It is grounded in the actual files, scripts, and dependencies in this repository and scoped to the enhancement described in docs/prd.md: make the configurator fully data-driven from a Directus schema. This is a reference for AI agents and developers to navigate the codebase, understand real patterns and constraints, and plan focused changes.

Document Scope
- Focus: Areas relevant to the PRD (OptionRegistry, generic getOptions, dynamic UI rendering, rules engine generalization, SKU generation, image layering, realtime, schema validation).
- Out of scope: Non-essential legacy utilities or unrelated scripts unless they affect the above.

Change Log
| Date       | Version | Description                         | Author |
| ---------- | ------- | ----------------------------------- | ------ |
| 2025-09-04 | 1.0     | Initial brownfield analysis (PRD)   | Codex  |

Quick Reference — Key Files and Entry Points
- Main Entry: `src/main.tsx`, `src/App.tsx`
- Config/Build: `.env(.example)`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`
- Directus/Domain Services: `src/services/directus.ts`, `src/services/directus-client.ts`, `src/services/option-registry.ts`, `src/services/config-ui.ts`, `src/services/rules-engine.ts`, `src/services/sku-generator.ts`, `src/services/image-selector.ts`, `src/services/product-matcher.ts`
- Scripts/Validation: `scripts/validate-configuration-ui.js`, `scripts/rules-phase2-validate.{ts,sh}`, `scripts/watch-schema.ts`, `scripts/validate-queries.js`, `scripts/schema-workflow.js`
- Docs: `docs/prd.md`, `docs/architecture.md` (enhancement blueprint), this file
- Static Test Harness: `src/test/*` (browser/in-console checks, not a runner)

High-Level Architecture
Technical Summary
- Frontend SPA built with React 18 + TypeScript + Vite. No backend in this repo beyond a minimal static server (`serve.js`) for local testing.
- Data layer integrates directly with Directus via REST SDK (`@directus/sdk`), with content-driven configuration for options, rules, images, and SKUs per PRD direction.

Actual Tech Stack (from package.json)
- Runtime/Build: Node.js (scripts), Vite 4, TypeScript 5
- UI: React 18, Radix UI primitives, TailwindCSS 3, Shadcn-style components (`src/components/ui`)
- Data/Validation: `@directus/sdk` 17, `zod`
- Utilities: `clsx`, `class-variance-authority`, `tailwind-merge`
- Notes: Project uses Directus SDK exclusively for all data operations.

Repository Structure Reality Check
- Type: Single-package repo (not a monorepo)
- Package Manager: npm
- Notable: `scripts/` contains Directus-focused tools for schema management and validation.

Source Tree and Module Organization
Project Structure (Actual)
project-root/
├── src/
│   ├── components/           # React UI (Shadcn/Radix + Tailwind)
│   ├── services/             # Directus SDK integration, rules, product matching, SKU, images
│   ├── utils/, tools/        # Helpers and query validation
│   ├── test/                 # Dev-only browser/console checks
│   ├── styles/               # Tailwind styles
│   └── App.tsx, main.tsx     # App entrypoints
├── scripts/                  # Node/TS utilities (schema, rules validation, types)
├── docs/                     # PRD, architecture notes, guides (this file)
└── config/build files        # Vite/TS/Tailwind configs

Key Modules and Their Purpose
- `src/services/directus-client.ts`: Domain model interfaces and Directus GraphQL-like queries for collections (e.g., ProductLine, MirrorStyle, LightDirection). Provides low-level query strings and types.
- `src/services/directus.ts`: Primary data access and caching via Directus SDK (REST). Validates data, performs bulk fetches, provides `initializeDirectusService`, item getters, and caching helpers.
- `src/services/option-registry.ts`: Core to PRD. Loads and caches option-set metadata; exposes `loadOptionRegistry`, `getOptions<T>()`, and invalidation. Drives generic option fetching and filtering.
- `src/services/config-ui.ts`: Reads `configuration_ui` to derive UI types and sorting, plus a row accessor and cache invalidation.
- `src/services/rules-engine.ts`: Evaluates rules from Directus. Contains condition evaluation, action application, constraint building (`buildRuleConstraints`), and SKU override extraction.
- `src/services/sku-generator.ts`: SKU parsing/validation/generation helpers; expected to evolve to content-driven formulas per PRD.
- `src/services/image-selector.ts`: Selects product images by config and rules; builds asset URLs; validates URLs; supports orientation rules and image naming.
- `src/services/product-matcher.ts`: Product search/matching by SKU and criteria; scoring utilities.

Data Models and APIs
- Data Source: Directus REST API (`@directus/sdk`) using `VITE_DIRECTUS_URL` and `VITE_DIRECTUS_API_KEY`.
- Domain Types: Defined in `src/services/directus-client.ts` and re-exported via `src/services/directus.ts` for compatibility.
- Option Sets: Discovered from `configuration_ui` via OptionRegistry; availability/filters driven by rules and content, not hard-coded.
- Rules: `rules` collection provides `if_this` filter JSON and `then_that` actions; evaluated in `rules-engine.ts`.
- Images: `ConfigurationImage` and `ConfigImageRule` modeled; selection logic in `image-selector.ts`.

Integration Points and External Dependencies
- Directus: REST SDK; schema snapshot via `scripts/watch-schema.ts` and `schema.json`.
- Images: Directus files/assets via constructed URLs.
- Realtime: Scripts support schema watching; app can add event subscriptions as needed (see PRD realtime plan).

Development and Deployment
- Commands: `npm run dev`, `build`, `preview`, `lint`, plus Directus tooling scripts under `scripts/`.
- Local server: `serve.js` (simple static server with CORS) for testing HTML pages if needed (e.g., `test.html`).
- Environment: Minimal vars — `VITE_DIRECTUS_URL`, `VITE_DIRECTUS_API_KEY`. Do not commit secrets; `VITE_*` are browser-exposed.

Testing Reality
- No formal test runner configured. Use dev-only checks in `src/test/` and scripts:
  - `scripts/rules-phase2-validate.sh` (cURL + inline TS validator)
  - `scripts/rules-phase2-validate.ts` (Directus + rules constraints)
  - `scripts/validate-configuration-ui.js` (ensures configuration_ui integrity)
  - Browser-console tests in `src/test/*.ts`

Technical Debt and Known Issues
- Project uses Directus SDK exclusively for all API operations. Schema validation and type generation handled through Directus-specific scripts.
- API key usage in client: `VITE_*` env values are exposed by design; follow security notes in repo docs.
- Mixed validation patterns: Some data validation lives in `directus.ts` with custom guards; ensure consistency as generic fetchers expand.

If PRD Provided — Enhancement Impact Areas
Based on docs/prd.md, these areas will be modified or extended:
- Option Registry and Generic Fetching
  - Consolidate option fetching through `getOptions<T>()` in `src/services/option-registry.ts`.
  - Expand status handling (active/status/none) and sorting per collection metadata.
  - Ensure `config-ui.ts` and registry align on UI type mapping and ordering.
- Dynamic UI Rendering
  - Frontend components under `src/components/ui` should consume registry metadata to render controls by `ui_type` and grouping.
  - Keep rendering generic (no hard-coded option lists).
- Rules Engine Generalization
  - Maintain `if_this`/`then_that` JSON compatibility.
  - Strengthen canonical addressing and constraint building (`buildRuleConstraints`) for availability and defaults.
  - Provide a rules validator against `schema.json` and live Directus.
- SKU Generation as Content
  - Evolve `src/services/sku-generator.ts` to read formulas/tables from Directus, with a safe evaluator and overrides.
- Image Layering
  - Extend `image-selector.ts` to support layering metadata (new collection(s) per PRD) and rules-driven selection.
- Realtime + Schema
  - Use `scripts/watch-schema.ts` and Directus Realtime/polling to keep `schema.json` current.

Appendix — Common Commands
```bash
# Dev and build
npm run dev            # Start Vite dev server
npm run build          # Type-check + production build
npm run preview        # Serve built app
npm run lint           # ESLint (ts/tsx)

# Directus validation helpers
npm run schema:watch:directus  # Watch Directus schema to schema.json
node scripts/validate-queries.js
bash scripts/rules-phase2-validate.sh
node scripts/rules-phase2-validate.ts
node scripts/validate-configuration-ui.js
```

Notes and Gotchas
- Always derive availability and UI from Directus data + rules; do not hard-code option logic.
- Keep imports organized and code style consistent (2-space, Prettier-compatible).
- When refreshing schema, commit `schema.json` snapshots relevant to rule/field changes.


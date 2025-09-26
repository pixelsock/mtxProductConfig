# MTX Product Configurator

## Overview

The MTX Product Configurator is an embeddable React application for configuring Matrix Engineering products. It reads product data, rule logic, and media assets directly from Supabase so that availability, pricing, and imagery stay in sync with the source of truth.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **State**: Zustand slices orchestrating configuration, UI, API, and quote flows
- **Backend**: Supabase (PostgreSQL, PostgREST, GraphQL, Storage)
- **Tooling**: TypeScript Node scripts (`scripts/`) and schema/contract specs under `specs/`

## Environment Configuration

Create a `.env.local` (or deployment-specific `.env`) with at least:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # server-side use only
VITE_SUPABASE_STORAGE_BUCKET=directus-uploads
VITE_ENABLE_DEBUG_LOGGING=true
```

The client uses `VITE_SUPABASE_STORAGE_BUCKET` when generating asset URLs; set it explicitly for every environment. Keep service role keys outside browser builds—they are only read by scripts and backend tasks.

## Development

```bash
# Install dependencies
npm install

# Start the Vite dev server
npm run dev

# Type-check and build
npm run build

# Preview the production build
npm run preview

# Lint sources
npm run lint
```

## Useful Scripts

- `npx tsx scripts/rules-phase2-validate.ts` &mdash; creates a temporary rule in Supabase, exercises the shared rules engine, and cleans up.
- `node scripts/introspect-schema.js` &mdash; fetches the Supabase GraphQL schema and writes analysis artifacts to `schema-output/`.
- `npm run generate-types` &mdash; regenerates typed Supabase client bindings (`src/types/database.ts`).

## Testing & Validation

Formal tests live under `src/test/` (Vitest). For targeted runtime checks use:

- `node test-rules-system.js`
- `node test-configuration-matching.js`
- `npx tsx scripts/rules-phase2-validate.ts`

Each script talks to Supabase directly, so ensure your `.env.local` mirrors the project you want to validate against.

## Supabase Integration Notes

- All availability logic is data-driven from Supabase tables (`rules`, `configuration_ui`, `product_lines`, etc.).
- Image helpers fall back to curated assets when storage objects are missing; set `VITE_SUPABASE_STORAGE_BUCKET` to the preferred bucket (defaults to `assets`).
- The shared Supabase client (`src/services/supabase.ts`) supports both browser (`import.meta.env`) and Node (`process.env`) runtimes so CLI scripts can reuse the same code.

## Deployment Checklist

1. Configure environment variables for the target runtime (see **Environment Configuration**).
2. Ensure Supabase Storage policies grant public read access for assets exposed to the browser.
3. Validate rules and schema via the CLI scripts above.
4. Build the application with `npm run build` and deploy the `dist/` bundle to your hosting target.

All legacy Directus tooling has been removed; Supabase is now the single integration surface for rules, products, and media.

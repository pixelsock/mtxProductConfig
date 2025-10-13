# MTX Product Configurator

## Overview

The MTX Product Configurator is an embeddable React application for configuring Matrix Engineering products. It reads product data, rule logic, and media assets directly from Supabase so that availability, pricing, and imagery stay in sync with the source of truth.

## Architecture

- **Frontend**: React 18 + TypeScript + Next.js 15
- **State**: Zustand slices orchestrating configuration, UI, API, and quote flows
- **Backend**: Supabase (PostgreSQL, PostgREST, GraphQL, Storage)
- **Runtime**: Cloudflare Workers (Edge runtime) on Webflow Cloud
- **Tooling**: TypeScript Node scripts (`scripts/`) and schema/contract specs under `specs/`

## Environment Configuration

Create a `.env.local` for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

For production deployment on Webflow Cloud, configure these same variables in the Webflow dashboard under Environment Variables.

**Important:** The Supabase client uses lazy initialization to support runtime environment variable injection in Edge runtime. See `src/services/supabase.ts` for implementation details.

## Development

```bash
# Install dependencies
npm install

# Start Next.js dev server (rapid iteration)
npm run dev
# → http://localhost:3000/config

# Test with Edge runtime (before deploying)
npm run preview
# → http://localhost:8788/config

# Build for production
npm run build

# Lint sources
npm run lint
```

### Development Workflows

**For daily development:** Use `npm run dev` for fast iteration with hot module replacement.

**Before deploying:** Use `npm run preview` to test with the actual Cloudflare Workers Edge runtime that runs in production on Webflow Cloud.

**📖 See [DEVELOPMENT-WORKFLOWS.md](./DEVELOPMENT-WORKFLOWS.md) for complete guide including:**
- When to use dev vs preview
- Environment variable differences
- Edge runtime compatibility testing
- Troubleshooting tips
- Deployment best practices

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
- The Supabase client (`src/services/supabase.ts`) uses lazy initialization to support runtime environment variable injection in Edge runtime.
- CLI scripts can access the same client for local development and testing.

## Deployment

### Webflow Cloud (Production)

This app deploys automatically to Webflow Cloud at `/config` when changes are pushed to the `main` branch.

**Deployment Checklist:**
1. Test locally with `npm run preview` (validates Edge runtime compatibility)
2. Configure environment variables in Webflow Cloud dashboard
3. Ensure Supabase Storage policies grant public read access
4. Push to `main` branch to trigger automatic deployment
5. Monitor build logs in Webflow dashboard

**Production URL:** `https://yoursite.webflow.io/config`

### Manual Deployment
```bash
# Build and deploy using Webflow CLI
npm run build
webflow cloud deploy
```

See [DEVELOPMENT-WORKFLOWS.md](./DEVELOPMENT-WORKFLOWS.md) for detailed deployment workflow and troubleshooting.

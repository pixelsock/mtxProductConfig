# Technical Stack

## Core Technologies

- Frontend: React 18 + TypeScript with Vite
- UI: shadcn/ui (Radix primitives), TailwindCSS, Lucide icons
- Data Backend: Directus (cloud instance)
- API Access: @directus/sdk with rest() and graphql() using static token auth
- State: Local React state (no global state library)
- Assets: Directus `/assets/{id}` for product imagery

## Build & Development

- Build Tool: Vite 4.x
- Dev Server: Vite (port 5173)
- Linting: ESLint 8.x with TypeScript
- Type Checking: TypeScript strict mode
- Scripts: `scripts/introspect-schema.js`, `scripts/generate-types.js`, `scripts/validate-queries.js`, `scripts/schema-workflow.js`

## API Architecture

- Primary API: Directus REST + GraphQL via SDK
- Authentication: Static token (`VITE_DIRECTUS_API_KEY`), optional email/password for non-static clients
- Access Pattern: Client-side SDK calls with caching; terminal-first validation via cURL/Node during development
- Data Contracts: Collections and rules defined in Directus; the app interprets them (no hard-coded matrices)

## Data Management

- Collections (core):
  - `product_lines`, `frame_colors`, `frame_thicknesses`, `mirror_controls`, `mirror_styles`
  - `mounting_options`, `light_directions`, `color_temperatures`, `light_outputs`, `drivers`
  - `sizes`, `accessories`, `products`, `rules`
- Product Images: `products.vertical_image`, `products.horizontal_image`, `products.additional_images`
- Caching: 5-minute in-memory cache in the service layer with runtime validation
- Validation: Runtime guards and consistency checks; schema/endpoint introspection via scripts and MCP tools

## Deployment

- Output: Static assets from `vite build`; served via any static host or Node `serve.js`
- Environment Variables:
  - `VITE_DIRECTUS_URL`
  - `VITE_DIRECTUS_API_KEY`
  - (Optional) `VITE_DIRECTUS_EMAIL`, `VITE_DIRECTUS_PASSWORD`

## Performance Targets

- Page Load: < 3 seconds
- API Response: < 500 ms
- Cache Freshness: 5 minutes (stale acceptable if Directus unavailable)
- Error Rate: < 1%

## Testing & Validation

- Terminal-First: Validate endpoints/schemas via terminal (cURL/Node); avoid adding test files
- No Fallback Data: All checks target live Directus; block features when unavailable
- Docs & Tools: Context7 for docs; Directus MCP tools for live schema/API inspection

## Documentation & Schema

- Documentation: Context7 (Directus + libraries)
- Schema Management: `introspect-schema.js`, `generate-types.js`, `validate-queries.js`, `schema-workflow.js`

## Future Considerations

- Search-by-SKU: Autosuggest with fuzzy matching, tokenization, and Directus-backed indexing
- Pricing Logic: Centralize dynamic pricing via rules/flows, validated via terminal
- Analytics: Usage metrics and error telemetry to improve ranking and suggestions

# Product Roadmap

Focus: Build an exceptional Search-by-SKU experience with intuitive autosuggestion, tight Directus integration, and rule-aware prefill.

## Phase 0: Baseline (Completed)

- [x] React + TypeScript foundation
- [x] Directus SDK integration (REST + GraphQL)
- [x] Product images via `vertical_image`, `horizontal_image`, `additional_images`
- [x] Rule evaluation and actions (no hard-coded matrices)
- [x] Deterministic SKU generation and parsing
- [x] 5-minute cache with runtime validation

## Phase 1: SKU Normalization & Parsing Enhancements

Goal: Accept partial and full SKUs; normalize inputs across product lines.

- [ ] Canonicalize SKU tokens (product line, style, direction)
- [ ] Robust partial parsing with tolerant separators and casing
- [ ] Infer product line from SKU prefix with longest-prefix match
- [ ] Round-trip parity: generated SKUs parse to same components
- [ ] Terminal validations against live Directus products

## Phase 2: Autosuggest Engine

Goal: Instant, helpful suggestions as the user types.

- [ ] Debounced input + async suggestions
- [ ] Token-aware suggestions (e.g., after base code, suggest styles; then directions)
- [ ] Fuzzy matching for minor typos; highlight matched segments
- [ ] Zero-state: show popular and recent SKUs
- [ ] Accessibility: keyboard navigation and ARIA roles

## Phase 3: Indexing & Relevance (Directus-Backed)

Goal: Fast, high-quality matches grounded in Directus data.

- [ ] Build searchable tokens from Directus `products` (name/SKU) and related attributes
- [ ] Optionally materialize/search fields or use a lightweight in-memory index synced from Directus
- [ ] Relevance scoring: exact > prefix > partial > fuzzy
- [ ] Boost active products; deprioritize inactive
- [ ] Terminal-first performance checks and schema validation

## Phase 4: Prefill & Deep Linking

Goal: Turn a found SKU into a usable configuration instantly.

- [ ] Parse suggestion → prefill configurator (rule-aware)
- [ ] Shareable URLs with SKU state (copy/paste)
- [ ] “Open by SKU” command palette entry
- [ ] Thumbnail previews in suggestions using product images

## Phase 5: Analytics & Quality Loops

Goal: Continuously improve suggestions and reduce null-results.

- [ ] Capture search terms, selection rates, null-result rates
- [ ] Identify common typos and add normalization rules (data-driven)
- [ ] Error telemetry for Directus/API failures; visible to developers

## Phase 6: Integrations & Scale

Goal: Make search a first-class entry point for teams.

- [ ] Quote creation directly from search results
- [ ] Export/share SKUs with context (images + attributes)
- [ ] Optional CRM linking (attach SKUs to opportunities)
- [ ] Multi-tenant readiness (namespacing if/when needed)

## Principles (Applies to All Phases)

- Directus-first: never use fallback data
- Terminal-first validation: cURL/Node and MCP tools over test files
- Data-driven: rules in Directus define availability/overrides
- Accessibility and performance are non-negotiable

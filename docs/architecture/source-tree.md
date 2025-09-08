# Source Tree Integration

## Existing Project Structure
```
project-root/
├── src/
│   ├── components/           # React UI (shadcn/ui + Tailwind)
│   │   ├── ui/              # 30+ shadcn/ui components
│   │   └── figma/           # ImageWithFallback component
│   ├── services/            # Directus SDK integration layer
│   │   ├── directus.ts      # Main service with validation & caching
│   │   └── directus-client.ts # Type interfaces and query strings
│   ├── utils/               # Helper functions and utilities
│   ├── test/                # Dev-only browser/console checks
│   ├── styles/              # Global styles and themes
│   └── App.tsx, main.tsx    # Application entry points
├── docs/                    # PRD, architecture, migration guides
└── scripts/                 # Node/TS utilities for schema/validation
```

## New File Organization
```
project-root/
├── src/
│   ├── services/                    # Existing service layer
│   │   ├── directus.ts              # Existing - main API service
│   │   ├── directus-client.ts       # Existing - types and queries
│   │   ├── option-registry.ts       # NEW - OptionRegistry service
│   │   ├── config-ui.ts            # NEW - configuration UI metadata
│   │   ├── rules-engine.ts         # NEW - enhanced rules evaluation
│   │   └── sku-generator.ts        # NEW - formula-driven SKU generation
│   ├── components/
│   │   ├── ui/                     # Existing shadcn/ui components
│   │   │   ├── sku-display.tsx     # Existing - enhanced for rules
│   │   │   ├── dynamic-options-container.tsx  # NEW - metadata-driven UI
│   │   │   └── dynamic-options.tsx # NEW - generic option renderer
│   │   └── figma/                  # Existing - ImageWithFallback preserved
│   ├── utils/
│   │   ├── sku-builder.ts          # Existing - enhanced with formula support
│   │   └── sku-url.ts              # Existing - maintained as-is
│   └── test/                       # Existing test utilities maintained
└── scripts/                        # Existing validation scripts
    ├── validate-configuration-ui.js # Existing - enhanced for new metadata
    └── rules-validator.ts          # NEW - validate rules against schema
```

## Integration Guidelines

**File Naming:** Consistent with existing kebab-case patterns (option-registry.ts, config-ui.ts) following your current service naming conventions

**Folder Organization:** New services added to existing services/ directory, new UI components follow established ui/ pattern, maintaining clear separation between generic (ui/) and domain-specific (figma/) components

**Import/Export Patterns:** New services will follow existing export patterns from directus.ts, maintaining centralized service exports and consistent module boundaries established in your current architecture

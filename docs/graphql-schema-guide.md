# GraphQL Schema Introspection and Validation Guide

## Overview

This guide establishes a comprehensive GraphQL schema introspection and validation rule for the Supabase backend integration. It ensures robust integration between the product configurator frontend and the Supabase GraphQL backend through systematic schema management, query validation, and type safety.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Schema Introspection](#schema-introspection)
3. [Type Generation](#type-generation)
4. [Query Validation](#query-validation)
5. [Development Workflow](#development-workflow)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Architecture Overview

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL Schema System                    │
├─────────────────────────────────────────────────────────────┤
│  Schema Introspection  │  Type Generation  │  Validation   │
│  ┌─────────────────┐   │  ┌─────────────┐   │  ┌─────────┐   │
│  │ Live Schema     │   │  │ TypeScript  │   │  │ Query   │   │
│  │ Analysis        │───┼─▶│ Interfaces  │   │  │ Linting │   │
│  │                 │   │  │             │   │  │         │   │
│  └─────────────────┘   │  └─────────────┘   │  └─────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Development Workflow                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Watch Mode  │  │ CI/CD       │  │ Developer Tools     │  │
│  │ Auto-regen  │  │ Integration │  │ VS Code IntelliSense│  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Schema Introspection**: Fetches live schema from Supabase GraphQL endpoint
2. **Type Generation**: Creates TypeScript interfaces from schema data
3. **Query Validation**: Validates existing and new queries against schema
4. **Development Integration**: Provides tools for ongoing development

## Schema Introspection

### Purpose

- Fetch complete GraphQL schema from Supabase
- Analyze collection types and field structures
- Identify relationships and dependencies
- Generate human-readable schema reports

### Usage

```bash
# Run schema introspection
npm run introspect-schema

# Output files:
# - schema-output/schema.json (raw GraphQL schema)
# - schema-output/schema-report.md (human-readable report)
# - schema-output/collections.json (collection metadata)
```

### Schema Structure

The Supabase GraphQL schema follows these patterns:

#### Collection Pattern
```graphql
{
  [collection_name]Collection(filter: FilterType, orderBy: [OrderByType!]) {
    edges {
      node {
        # Actual data fields
        id
        name
        # ... other fields
      }
    }
  }
}
```

#### Product Collections Identified
- `accessories` - Product accessories
- `color_temperatures` - Color temperature options
- `configuration_images` - Product images with rules
- `drivers` - Driver types
- `frame_colors` - Color options with hex codes
- `frame_thicknesses` - Thickness options
- `light_directions` - Lighting directions
- `light_outputs` - Light output levels
- `mirror_controls` - Control types
- `mirror_styles` - Mirror style configurations
- `mounting_options` - Mounting configurations
- `product_lines` - Product line definitions
- `product_lines_default_options` - Default option relationships
- `products` - Product catalog
- `products_options_overrides` - Product-specific overrides
- `sizes` - Size dimensions

## Type Generation

### Purpose

- Generate TypeScript interfaces from introspected schema
- Provide compile-time type safety
- Enable IntelliSense support in development
- Maintain consistency with backend schema

### Usage

```bash
# Generate TypeScript types
npm run generate-types

# Output file:
# - src/types/supabase-schema.ts
```

### Generated Types

#### Common Types
```typescript
// GraphQL response wrappers
export interface GraphQLEdge<T> {
  node: T;
  cursor: string;
}

export interface GraphQLConnection<T> {
  edges: GraphQLEdge<T>[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

// Collection response types
export type FrameColorsCollection = GraphQLCollectionResponse<FrameColors>;
```

#### Collection-Specific Types
```typescript
// Example: Frame Colors
export interface FrameColors {
  nodeId: string;
  id: number;
  name: string;
  hex_code?: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
}
```

### Type Mapping

| GraphQL Type | TypeScript Type | Notes |
|--------------|-----------------|-------|
| `String` | `string` | Standard string |
| `Int` | `number` | Integer values |
| `Float` | `number` | Floating point |
| `Boolean` | `boolean` | True/false |
| `ID` | `string` | Unique identifier |
| `BigInt` | `string` | Large integers as strings |
| `DateTime` | `string` | ISO date strings |
| `JSON` | `Record<string, any>` | JSON objects |

## Query Validation

### Purpose

- Validate GraphQL queries before execution
- Check field existence against schema
- Ensure proper query structure
- Provide helpful error messages and suggestions

### Usage

```bash
# Validate existing queries
npm run validate-queries
```

### Validation Rules

#### 1. Collection Existence
```typescript
// ✅ Valid - known collection
frame_colorsCollection { ... }

// ❌ Invalid - unknown collection
unknown_collectionCollection { ... }
```

#### 2. Field Validation
```typescript
// ✅ Valid - existing fields
frame_colorsCollection {
  edges {
    node {
      id
      name
      hex_code
    }
  }
}

// ❌ Invalid - non-existent field
frame_colorsCollection {
  edges {
    node {
      invalid_field  // Error: field doesn't exist
    }
  }
}
```

#### 3. Query Structure
```typescript
// ✅ Valid - proper Supabase structure
frame_colorsCollection {
  edges {
    node {
      id
      name
    }
  }
}

// ❌ Invalid - missing edges/node structure
frame_colorsCollection {
  id  // Error: requires edges { node { ... } }
  name
}
```

#### 4. Best Practice Warnings
- Missing `active: { eq: true }` filter
- No pagination specified
- Overly broad field selections
- Missing recommended fields

## Development Workflow

### Complete Workflow

```bash
# Run all steps: introspect → generate-types → validate
npm run schema:all
```

### Watch Mode

```bash
# Auto-regenerate on file changes
npm run schema:watch
```

### Individual Steps

```bash
# Schema introspection only
npm run introspect-schema

# Type generation only
npm run generate-types

# Query validation only
npm run validate-queries
```

### Workflow Integration

#### Pre-commit Hook (Recommended)
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run validate-queries"
    }
  }
}
```

#### CI/CD Integration
```yaml
# .github/workflows/schema-validation.yml
name: Schema Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run schema:all
```

## Best Practices

### 1. Query Design

#### Always Use Filters
```graphql
# ✅ Good - filter for active records
frame_colorsCollection(filter: { active: { eq: true } }) {
  edges {
    node {
      id
      name
      hex_code
    }
  }
}
```

#### Specify Required Fields Only
```graphql
# ✅ Good - only needed fields
frame_colorsCollection {
  edges {
    node {
      id
      name
      sku_code
    }
  }
}

# ❌ Avoid - unnecessary fields
frame_colorsCollection {
  edges {
    node {
      id
      name
      sku_code
      webflow_id      # Not needed
      sort           # Not needed
      description    # Not needed
    }
  }
}
```

#### Use Pagination
```graphql
# ✅ Good - with pagination
frame_colorsCollection(first: 50, filter: { active: { eq: true } }) {
  edges {
    node {
      id
      name
    }
  }
}
```

### 2. Type Safety

#### Import Generated Types
```typescript
import { FrameColors, FrameColorsCollection } from '@/types/supabase-schema';

// Use typed responses
const response: FrameColorsCollection = await executeGraphQL(query);
```

#### Type Guards
```typescript
function isValidFrameColor(item: any): item is FrameColors {
  return item && 
         typeof item.id === 'number' && 
         typeof item.name === 'string' &&
         typeof item.active === 'boolean';
}
```

### 3. Error Handling

#### Validate Before Execution
```typescript
import { queryValidator } from '@/tools/query-validator';

const validation = queryValidator.validateQuery(query);
if (!validation.isValid) {
  console.error('Query validation failed:', validation.errors);
  return;
}

const result = await executeGraphQL(query);
```

#### Handle GraphQL Errors
```typescript
async function executeGraphQL<T>(query: string): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': key },
    body: JSON.stringify({ query })
  });

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }
  
  return result.data;
}
```

### 4. Performance Optimization

#### Batch Queries
```graphql
# ✅ Good - single request for multiple collections
query GetAllOptions {
  frame_colorsCollection(filter: { active: { eq: true } }) { ... }
  sizesCollection(filter: { active: { eq: true } }) { ... }
  driversCollection(filter: { active: { eq: true } }) { ... }
}
```

#### Use Caching
```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}
```

## Troubleshooting

### Common Issues

#### 1. Schema Introspection Fails

**Problem**: `❌ Schema introspection failed: 401 Unauthorized`

**Solution**:
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verify .env file exists and has correct values
cat .env | grep SUPABASE
```

#### 2. Type Generation Errors

**Problem**: `⚠️ No fields found for collection_name`

**Solution**:
- Check if collection exists in Supabase
- Verify collection permissions
- Run schema introspection first: `npm run introspect-schema`

#### 3. Query Validation Warnings

**Problem**: `⚠️ Missing recommended fields in 'collection': active`

**Solution**:
```graphql
# Add active filter to queries
collectionCollection(filter: { active: { eq: true } }) {
  edges {
    node {
      id
      name
      active  # Include active field
    }
  }
}
```

#### 4. TypeScript Compilation Errors

**Problem**: `Type 'unknown' is not assignable to type 'FrameColors'`

**Solution**:
```typescript
// Use type assertions with validation
const data = result.data as FrameColorsCollection;

// Or use type guards
if (isValidFrameColor(item)) {
  // TypeScript now knows item is FrameColors
  console.log(item.hex_code);
}
```

### Debug Mode

Enable debug logging:
```bash
DEBUG=schema:* npm run schema:all
```

### Schema Validation

Verify schema integrity:
```bash
# Check schema file exists and is valid
ls -la schema-output/
cat schema-output/schema-report.md | head -20
```

## Advanced Topics

### Custom Type Mappings

For complex types not automatically mapped:

```typescript
// src/types/custom-mappings.ts
export interface ConfigurationImageRules {
  [key: string]: {
    frame_thicknesses?: number[];
    mounting_options?: number[];
    light_directions?: number[];
  };
}

// Override generated type
export interface ConfigurationImages extends Omit<GeneratedConfigurationImages, 'image_rules'> {
  image_rules?: ConfigurationImageRules;
}
```

### Schema Evolution

Handle schema changes gracefully:

```typescript
// Version-aware type checking
export function isLegacyFrameColor(item: any): boolean {
  return item && !item.hex_code && item.color_value;
}

export function normalizeFrameColor(item: any): FrameColors {
  if (isLegacyFrameColor(item)) {
    return {
      ...item,
      hex_code: item.color_value
    };
  }
  return item;
}
```

### Performance Monitoring

Track query performance:

```typescript
export async function executeGraphQLWithMetrics<T>(
  query: string,
  variables?: any
): Promise<{ data: T; metrics: { duration: number; size: number } }> {
  const start = performance.now();

  const result = await executeGraphQL<T>(query, variables);

  const duration = performance.now() - start;
  const size = JSON.stringify(result).length;

  console.log(`Query executed in ${duration.toFixed(2)}ms, response size: ${size} bytes`);

  return {
    data: result,
    metrics: { duration, size }
  };
}
```

## File Structure

```
project/
├── docs/
│   ├── graphql-schema-guide.md      # This guide
│   └── graphql-analysis.md          # Current implementation analysis
├── scripts/
│   ├── introspect-schema.js         # Schema introspection
│   ├── generate-types.js            # Type generation
│   ├── validate-queries.js          # Query validation
│   └── schema-workflow.js           # Complete workflow
├── src/
│   ├── types/
│   │   └── supabase-schema.ts       # Generated types
│   ├── tools/
│   │   ├── schema-introspection.ts  # Introspection utilities
│   │   └── query-validator.ts       # Validation utilities
│   └── services/
│       └── supabase-graphql.ts      # GraphQL service layer
└── schema-output/
    ├── schema.json                  # Raw schema data
    ├── schema-report.md             # Human-readable report
    ├── collections.json             # Collection metadata
    └── workflow-report.json         # Workflow execution report
```

## Contributing

### Adding New Collections

1. Update product collections list in scripts
2. Run schema introspection: `npm run introspect-schema`
3. Generate new types: `npm run generate-types`
4. Update validation rules if needed
5. Test with: `npm run validate-queries`

### Extending Validation Rules

1. Edit `src/tools/query-validator.ts`
2. Add new validation methods
3. Update test cases
4. Run validation: `npm run validate-queries`

### Schema Changes

When Supabase schema changes:
1. Run complete workflow: `npm run schema:all`
2. Review generated types for breaking changes
3. Update application code as needed
4. Commit updated schema files

## Conclusion

This GraphQL schema introspection and validation system provides:

- **Type Safety**: Compile-time validation of GraphQL queries
- **Schema Consistency**: Automatic synchronization with Supabase backend
- **Developer Experience**: IntelliSense, validation, and helpful error messages
- **Maintainability**: Automated workflows and clear documentation
- **Performance**: Optimized queries and caching strategies

The system prevents schema mismatches, reduces unnecessary data fetching, and ensures robust integration between the frontend and Supabase GraphQL backend.
```

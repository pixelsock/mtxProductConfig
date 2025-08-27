# GraphQL Schema Analysis for Supabase Integration

## Current Implementation Overview

The project currently uses Supabase's GraphQL API to fetch product configuration data. The implementation is located in `src/services/supabase-graphql.ts` and follows a consistent pattern for data retrieval.

## GraphQL Endpoint Configuration

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const GRAPHQL_ENDPOINT = `${SUPABASE_URL}/graphql/v1`;
```

**Current Environment:**
- Supabase URL: `https://akwhptzlqgtlcpzvcnjl.supabase.co`
- GraphQL Endpoint: `https://akwhptzlqgtlcpzvcnjl.supabase.co/graphql/v1`

## Current Query Patterns

### 1. Collection Query Pattern
All queries follow Supabase's GraphQL collection pattern:

```graphql
{
  [collection_name]Collection(filter: { active: { eq: true } }) {
    edges {
      node {
        id
        name
        sku_code
        # additional fields...
      }
    }
  }
}
```

### 2. Active Collections Currently Queried

| Collection | Fields | Purpose |
|------------|--------|---------|
| `product_linesCollection` | id, name, sku_code | Product line definitions |
| `frame_colorsCollection` | id, name, hex_code, sku_code | Color options |
| `frame_thicknessesCollection` | id, name, sku_code | Thickness options |
| `mounting_optionsCollection` | id, name, sku_code | Mounting configurations |
| `light_directionsCollection` | id, name, sku_code | Lighting directions |
| `mirror_stylesCollection` | id, name, sku_code | Mirror style options |
| `mirror_controlsCollection` | id, name, sku_code | Control types |
| `light_outputsCollection` | id, name, sku_code | Light output levels |
| `color_temperaturesCollection` | id, name, sku_code | Color temperature options |
| `driversCollection` | id, name, sku_code | Driver types |
| `sizesCollection` | id, name, width, height, sku_code | Size dimensions |
| `accessoriesCollection` | id, name, sku_code | Product accessories |
| `configuration_imagesCollection` | id, name, image, z_index, image_rules | Product images |

### 3. Relationship Queries

#### Product Line Default Options
```graphql
query GetProductLineWithDefaults($productLineId: Int!) {
  product_lines_default_optionsCollection(filter: { product_lines_id: { eq: $productLineId } }) {
    edges {
      node {
        id
        collection
        item
        product_lines_id
      }
    }
  }
}
```

## Data Type Patterns

### Common Fields Across Collections
- `id`: String/Integer (primary key)
- `name`: String (display name)
- `sku_code`: String (SKU identifier)
- `active`: Boolean (availability filter)

### Collection-Specific Fields
- **frame_colors**: `hex_code` (color value)
- **sizes**: `width`, `height` (numeric dimensions)
- **configuration_images**: `image` (file ID), `z_index` (layer order), `image_rules` (JSON rules)

### Relationship Fields
- **product_lines_default_options**: `collection`, `item`, `product_lines_id` (foreign key relationships)

## Current Issues and Limitations

### 1. Type Safety
- All GraphQL responses use `any` type
- No compile-time validation of query structure
- Field existence not validated at build time

### 2. Query Validation
- No schema validation before query execution
- Runtime errors for invalid fields or collections
- No IntelliSense support for GraphQL queries

### 3. Error Handling
- Basic error logging without schema context
- No specific handling for schema mismatches
- Fallback to empty arrays on any error

### 4. Performance Considerations
- Batch query optimization implemented for `getAllOptionsOptimized()`
- Cache system disabled (CACHE_DURATION = 0)
- No query complexity analysis

## Schema Introspection Requirements

### 1. Type Definitions Needed
- Complete TypeScript interfaces for all collections
- Relationship type definitions
- Filter and query parameter types
- Response wrapper types (edges/node pattern)

### 2. Validation Requirements
- Query field validation against schema
- Filter parameter validation
- Relationship integrity checks
- Required field validation

### 3. Development Tools Needed
- Schema introspection utility
- Query builder with type safety
- Automated type generation
- Query validation middleware

## Next Steps

1. **Schema Introspection**: Build tool to fetch complete schema from Supabase GraphQL endpoint
2. **Type Generation**: Generate TypeScript definitions from introspected schema
3. **Query Validation**: Implement pre-execution query validation
4. **Development Workflow**: Create tools for ongoing schema management
5. **Documentation**: Comprehensive schema and query pattern documentation

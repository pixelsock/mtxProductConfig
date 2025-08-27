# GraphQL Schema Quick Reference

## Commands

### Schema Management
```bash
# Complete workflow (recommended)
npm run schema:all

# Individual steps
npm run introspect-schema    # Fetch schema from Supabase
npm run generate-types       # Generate TypeScript types
npm run validate-queries     # Validate existing queries

# Development
npm run schema:watch         # Auto-regenerate on changes
npm run schema-workflow help # Show all available commands
```

### File Locations
```
schema-output/
├── schema.json              # Raw GraphQL schema
├── schema-report.md         # Human-readable analysis
├── collections.json         # Collection metadata
└── workflow-report.json     # Last workflow execution

src/types/
└── supabase-schema.ts       # Generated TypeScript types
```

## Query Patterns

### Basic Collection Query
```graphql
query GetFrameColors {
  frame_colorsCollection(filter: { active: { eq: true } }) {
    edges {
      node {
        id
        name
        hex_code
        sku_code
      }
    }
  }
}
```

### Batch Query (Multiple Collections)
```graphql
query GetAllOptions {
  frame_colorsCollection(filter: { active: { eq: true } }) {
    edges {
      node {
        id
        name
        hex_code
        sku_code
      }
    }
  }
  sizesCollection(filter: { active: { eq: true } }) {
    edges {
      node {
        id
        name
        width
        height
        sku_code
      }
    }
  }
}
```

### With Pagination
```graphql
query GetFrameColorsPaginated {
  frame_colorsCollection(
    first: 20
    filter: { active: { eq: true } }
    orderBy: [{ sort: ASC }]
  ) {
    edges {
      node {
        id
        name
        hex_code
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Relationship Query
```graphql
query GetProductLineWithDefaults($productLineId: Int!) {
  product_lines_default_optionsCollection(
    filter: { product_lines_id: { eq: $productLineId } }
  ) {
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

## TypeScript Usage

### Import Types
```typescript
import {
  FrameColors,
  FrameColorsCollection,
  ConfigurationImages,
  GraphQLCollectionResponse
} from '@/types/supabase-schema';
```

### Typed Query Execution
```typescript
async function getFrameColors(): Promise<FrameColors[]> {
  const query = `
    query GetFrameColors {
      frame_colorsCollection(filter: { active: { eq: true } }) {
        edges {
          node {
            id
            name
            hex_code
            sku_code
          }
        }
      }
    }
  `;
  
  const response: { frame_colorsCollection: FrameColorsCollection } = 
    await executeGraphQL(query);
  
  return response.frame_colorsCollection.edges.map(edge => edge.node);
}
```

### Type Guards
```typescript
function isValidFrameColor(item: any): item is FrameColors {
  return item && 
         typeof item.id === 'number' && 
         typeof item.name === 'string' &&
         typeof item.active === 'boolean';
}

// Usage
const items = await getFrameColors();
const validItems = items.filter(isValidFrameColor);
```

## Validation

### Query Validation
```typescript
import { queryValidator } from '@/tools/query-validator';

const query = `...`;
const result = queryValidator.validateQuery(query);

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
  console.warn('Warnings:', result.warnings);
  console.info('Suggestions:', result.suggestions);
}
```

### Generate Query Template
```typescript
// Generate a valid query template for a collection
const template = queryValidator.generateQueryTemplate('frame_colors', [
  'id', 'name', 'hex_code', 'sku_code'
]);
console.log(template);
```

## Product Collections

### Available Collections
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

### Common Fields
Most collections include:
- `id: number` - Primary key
- `name: string` - Display name
- `active: boolean` - Availability status
- `sort?: number` - Sort order
- `sku_code?: string` - SKU identifier
- `webflow_id?: string` - Webflow integration ID

### Collection-Specific Fields

#### frame_colors
- `hex_code?: string` - Color hex value

#### sizes  
- `width?: number` - Width dimension
- `height?: number` - Height dimension

#### configuration_images
- `image?: string` - Image file ID
- `z_index?: number` - Layer order
- `image_rules?: Record<string, any>` - Display rules

#### product_lines_default_options
- `product_lines_id?: number` - Product line reference
- `collection?: string` - Target collection name
- `item?: string` - Item identifier

## Best Practices

### ✅ Do
- Always filter by `active: { eq: true }` for user-facing data
- Use pagination with `first: N` for large collections
- Specify only needed fields in queries
- Import and use generated TypeScript types
- Validate queries before execution
- Use batch queries for multiple collections

### ❌ Don't
- Select all fields when only some are needed
- Forget to handle GraphQL errors
- Skip type validation for API responses
- Use hardcoded field names without schema validation
- Ignore validation warnings

## Error Handling

### Common Errors
```typescript
// GraphQL execution errors
if (result.errors) {
  throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
}

// Network errors
if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

// Type validation errors
if (!isValidFrameColor(item)) {
  console.warn('Invalid frame color data:', item);
  return null;
}
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=schema:* npm run schema:all

# Check schema files
ls -la schema-output/
cat schema-output/schema-report.md | head -20
```

## Environment Setup

### Required Variables
```env
# .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Verification
```bash
# Check environment
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
npm run introspect-schema
```

## Workflow Integration

### Pre-commit Hook
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run validate-queries"
    }
  }
}
```

### CI/CD Pipeline
```yaml
# .github/workflows/schema-validation.yml
- name: Validate GraphQL Schema
  run: |
    npm install
    npm run schema:all
```

### Development Workflow
1. Make schema changes in Supabase
2. Run `npm run schema:all` to update types
3. Update application code to use new types
4. Validate with `npm run validate-queries`
5. Commit updated schema files

## Support

### Getting Help
- Check the [complete guide](./graphql-schema-guide.md)
- Run `npm run schema-workflow help`
- Review validation warnings and suggestions
- Check schema output files for details

### Common Solutions
- **Schema introspection fails**: Check environment variables
- **Type errors**: Regenerate types with `npm run generate-types`
- **Query validation fails**: Use `queryValidator.generateQueryTemplate()`
- **Missing collections**: Verify Supabase permissions and schema

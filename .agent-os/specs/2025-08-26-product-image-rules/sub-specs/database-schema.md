# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-26-product-image-rules/spec.md

## Existing Schema (No Changes Required)

### Rules Collection (Already Exists)
The rules collection is already configured in Directus with the following structure:

```typescript
interface Rule {
  id: string; // UUID
  name: string; // Rule name (e.g., "Deco Sku Code Thin Frame")
  priority: number | null; // Rule evaluation order
  if_this: object; // Conditions using Directus filter syntax
  than_that: object; // Actions/overrides to apply
}
```

### Products Collection (Already Configured)
The products collection already contains the necessary image fields:

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  active: boolean;
  product_line: number; // Foreign key to product_lines
  mirror_style: number; // Foreign key to mirror_styles  
  light_direction: number; // Foreign key to light_directions
  horizontal_image: string; // UUID reference to directus_files
  vertical_image: string; // UUID reference to directus_files
  applicationImage: string; // UUID reference to directus_files
  options_overrides: any[];
  // ... other fields
}
```

## Field Specifications

### Rules Collection Fields (Existing)
- **id**: UUID primary key
- **name**: Human-readable rule name (e.g., "Deco Sku Code Thin Frame")
- **priority**: Integer for rule ordering (null values allowed)
- **if_this**: Directus filter object defining when rule applies
  ```json
  {
    "_and": [
      {
        "_and": [
          {"product_line": {"_eq": 19}},
          {"frame_thickness": {"_eq": 2}}
        ]
      }
    ]
  }
  ```
- **than_that**: Actions/overrides object (e.g., SKU override)
  ```json
  {
    "product_line": {
      "sku_code": {"_eq": "T"}
    }
  }
  ```

### Products Collection Fields (Existing)
- **vertical_image**: UUID reference to directus_files for portrait orientation
- **horizontal_image**: UUID reference to directus_files for landscape orientation
- **product_line**: Foreign key to product_lines collection
- **mirror_style**: Foreign key to mirror_styles collection
- **light_direction**: Foreign key to light_directions collection

## Current Rules in System

### Example Rules from API
```json
// Deco Thin Frame Rule
{
  "id": "480eddbe-dab0-476f-b08a-e9a67594cdb4",
  "name": "Deco Sku Code Thin Frame",
  "priority": null,
  "if_this": {
    "_and": [
      {
        "_and": [
          {"product_line": {"_eq": 19}},
          {"frame_thickness": {"_eq": 2}}
        ]
      }
    ]
  },
  "than_that": {
    "product_line": {
      "sku_code": {"_eq": "T"}
    }
  }
}

// Deco Wide Frame Rule  
{
  "id": "ffd42638-c47a-40aa-a8a9-b88888275bfc",
  "name": "Deco Sku Code Wide",
  "priority": null,
  "if_this": {
    "_and": [
      {
        "_and": [
          {"product": {"product_line": {"_eq": 19}}},
          {"frame_thickness": {"_eq": 1}}
        ]
      }
    ]
  },
  "than_that": {
    "product_line": {
      "sku_code": {"_eq": "W"}
    }
  }
}

// Light Output High Rule
{
  "id": "6ff18fc8-ab01-402c-8017-1b0cdfebf48c",
  "name": "Light Output High",
  "priority": null,
  "if_this": {
    "_and": [
      {
        "_or": [
          {"driver": {"_eq": 4}},
          {"driver": {"_eq": 5}},
          {"driver": {"_eq": 1}}
        ]
      }
    ]
  },
  "than_that": {
    "light_output": {"_eq": 2}
  }
}

```

## API Access

### Fetching Rules
```typescript
// GET https://pim.dude.digital/items/rules
// Returns all rules for processing
const rules = await directusClient.request(readItems('rules'));
```

### Fetching Products with Images
```typescript
// GET https://pim.dude.digital/items/products?fields=*,horizontal_image.*,vertical_image.*
// Returns products with expanded image data
const products = await directusClient.request(
  readItems('products', {
    fields: ['*', 'horizontal_image.*', 'vertical_image.*']
  })
);
```

## Implementation Notes

### Rules Processing
1. Rules use Directus filter syntax (`_eq`, `_and`, `_or`) for conditions
2. The `if_this` field contains the conditions to evaluate
3. The `than_that` field contains the actions/overrides to apply
4. Priority field can be null - handle sorting appropriately

### Image URL Construction
```typescript
// Construct Directus asset URLs for images
const imageUrl = `https://pim.dude.digital/assets/${imageId}`;
```

### Data Relationships
- Product line ID 19 corresponds to "Deco" product line
- Frame thickness ID 1 = Wide, ID 2 = Thin
- Products already have vertical/horizontal images populated
- Use foreign key relationships to match configuration selections
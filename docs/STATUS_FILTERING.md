# Status-Based Content Filtering Implementation

## Overview

This document describes the implementation of status-based filtering to ensure only "published" content appears in the product configurator. The system provides a flexible approach that supports both `status` fields and `active` fields with automatic fallback.

## Implementation Strategy

### 1. **Flexible Field Detection**
The system attempts to use status fields first, then falls back to active fields:

```typescript
// Priority order:
1. status: { eq: "published" }  // Preferred
2. active: { eq: true }         // Fallback
3. No filter                    // Last resort (configuration images only)
```

### 2. **Affected Collections**

All product-related collections now include status filtering:

- **Product Lines** (`product_linesCollection`)
- **Frame Colors** (`frame_colorsCollection`) 
- **Frame Thicknesses** (`frame_thicknessesCollection`)
- **Mounting Options** (`mounting_optionsCollection`)
- **Light Directions** (`light_directionsCollection`)
- **Mirror Styles** (`mirror_stylesCollection`)
- **Mirror Controls** (`mirror_controlsCollection`)
- **Light Outputs** (`light_outputsCollection`)
- **Color Temperatures** (`color_temperaturesCollection`)
- **Drivers** (`driversCollection`)
- **Sizes** (`sizesCollection`)
- **Accessories** (`accessoriesCollection`)
- **Configuration Images** (`configuration_imagesCollection`)

## Code Changes

### 1. **GraphQL Query Updates**

Each function now includes dual query logic:

```typescript
// Example: Frame Colors
let query = `
  query GetPublishedFrameColors {
    frame_colorsCollection(filter: { status: { eq: "published" } }) {
      edges {
        node {
          id
          name
          hex_code
          sku_code
          status
        }
      }
    }
  }
`;

try {
  data = await executeGraphQL<any>(query);
  console.log('✅ Frame colors fetched using status field');
} catch (statusError) {
  console.log('📝 Status field not found, using active field');
  // Fallback query with active field...
}
```

### 2. **Batch Query Optimization**

The `getAllOptionsOptimized()` function includes comprehensive status filtering for all collections in a single request, with automatic fallback to active field filtering.

### 3. **Logging and Debugging**

Enhanced logging provides visibility into which filtering method is being used:

- `✅ Successfully fetched using status field filtering`
- `📝 Status field not found, falling back to active field filtering`
- `📊 Fetched X published/active items`

## Database Schema Requirements

### Current State
Based on schema analysis, the system currently uses:
- **Active Field**: `active` (boolean) - Present in most collections
- **Status Field**: `status` (string) - Currently only in `quotes` collection

### Future Enhancement
To fully implement status-based filtering, add `status` fields to product collections:

```sql
-- Example for frame_colors table
ALTER TABLE frame_colors ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
UPDATE frame_colors SET status = 'published' WHERE active = true;

-- Possible status values:
-- 'draft', 'published', 'archived', 'pending'
```

## Fallback Behavior

### 1. **Graceful Degradation**
- If `status` field doesn't exist → Use `active` field
- If `active` field doesn't exist → Use no filter (configuration images only)
- If query fails entirely → Return empty array with error logging

### 2. **Error Handling**
```typescript
try {
  // Try status field
} catch (statusError) {
  try {
    // Try active field
  } catch (activeError) {
    // Log error and return empty array
    console.error('Error fetching data:', activeError);
    return [];
  }
}
```

## Testing and Validation

### 1. **Console Logging**
Monitor browser console for filtering method confirmation:
```
✅ Frame colors fetched using status field
📊 Fetched 5 published/active frame colors
```

### 2. **Data Verification**
Verify that only appropriate content appears in:
- Product line selector dropdown
- Frame color options
- All configuration option dropdowns
- Product configurator interface

### 3. **Fallback Testing**
Test scenarios:
- Database with `status` fields → Should use status filtering
- Database with only `active` fields → Should use active filtering
- Database with neither → Should handle gracefully

## Benefits

### 1. **Content Control**
- Prevents draft/unpublished content from appearing in user interface
- Maintains clean, professional product configurator
- Supports content workflow (draft → published → archived)

### 2. **Backward Compatibility**
- Works with existing `active` field system
- No breaking changes to current functionality
- Smooth migration path for future status field implementation

### 3. **Future-Proof**
- Ready for status field implementation
- Supports multiple status values ('draft', 'published', 'archived', etc.)
- Extensible for additional filtering requirements

## Migration Path

### Phase 1: Current Implementation ✅
- Implement dual query system with fallback
- Test with existing `active` fields
- Verify no regression in functionality

### Phase 2: Database Schema Update (Future)
- Add `status` fields to product collections
- Migrate existing `active` values to `status` values
- Update admin interface to manage status

### Phase 3: Status Field Adoption (Future)
- Remove `active` field dependencies
- Implement full status workflow
- Add additional status values as needed

## Monitoring

### Key Metrics
- Number of published items per collection
- Filtering method being used (status vs active)
- Query performance impact
- Error rates for fallback scenarios

### Debug Tools
- Enhanced console logging
- Status field detection
- Collection introspection functions
- Query validation and testing

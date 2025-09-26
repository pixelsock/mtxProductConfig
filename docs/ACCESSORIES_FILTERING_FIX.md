> **Supabase Context (2025-09):** Validation and queries described here map to Supabase tables (`accessories`, `product_lines_default_options`).

# Accessories Filtering Issue Fix

## Problem Summary

The accessories filtering in the product configurator had two critical issues:

1. **"Data Only" Status Handling**: Items with `status = "Data Only"` were appearing in the UI when they should be excluded
2. **Hardcoded Accessories Filter**: Only "Nightlight" and "Anti-Fog" accessories were showing, excluding "Touch Sensor"

## Root Cause Analysis

### Issue 1: "Data Only" Status
- Database records with `status = "Data Only"` should be excluded from UI but remain accessible via API
- The status filtering logic only checked for `status = "published"` but didn't exclude other statuses
- Items with "Data Only" status were passing through to the configurator interface

### Issue 2: Hardcoded Accessories Filter
Located in `src/App.tsx` line 200-202:
```typescript
// BEFORE (problematic code)
const accessoryOptions = (filteredOptions.accessories || []).filter((acc: any) =>
  acc.name.includes('Nightlight') || acc.name.includes('Anti-Fog')
);
```

This hardcoded filter excluded "Touch Sensor" and other valid accessories.

## Solution Implementation

### 1. Enhanced Status Filtering

**Added comprehensive status exclusion logic:**

```typescript
// Define statuses that should be excluded from the UI
const EXCLUDED_STATUSES = ['draft', 'archived', 'Data Only', 'data only', 'inactive'];
const PUBLISHED_STATUSES = ['published', 'active'];

// Helper function to check if an item should be included in UI
function shouldIncludeInUI(item: any): boolean {
  // If item has status field, check if it's published
  if (item.status !== undefined && item.status !== null) {
    return PUBLISHED_STATUSES.includes(item.status.toLowerCase());
  }
  
  // If no status field, fall back to active field
  if (item.active !== undefined && item.active !== null) {
    return item.active === true;
  }
  
  // If neither field exists, include by default (for backward compatibility)
  return true;
}
```

**Applied filtering to all collections:**
- Frame colors, thicknesses, mounting options, etc.
- **Accessories** (specifically addresses the "Data Only" issue)
- Configuration images

### 2. Fixed Hardcoded Accessories Filter

**Updated the accessories filtering logic:**

```typescript
// AFTER (fixed code)
const accessoryOptions = (filteredOptions.accessories || []).filter((acc: any) => {
  const name = acc.name.toLowerCase();
  return name.includes('anti-fog') || 
         name.includes('touch sensor') || 
         name.includes('nightlight') ||
         name.includes('sensor'); // Catch variations like "Touch Sensor"
});
```

**Added comprehensive logging:**
```typescript
console.log(`🔧 Accessories filtering debug:`);
console.log(`  📊 Total accessories from filtered options: ${filteredOptions.accessories?.length || 0}`);
console.log(`  📊 Accessories after UI filtering: ${accessoryOptions.length}`);
filteredOptions.accessories?.forEach((acc: any, index: number) => {
  const included = accessoryOptions.some((filtered: any) => filtered.id === acc.id);
  console.log(`    ${index + 1}. ${acc.name} (ID: ${acc.id}) - ${included ? '✅ INCLUDED' : '❌ EXCLUDED'}`);
});
```

## Testing and Validation

### Debug Functions Available

Three new debug functions are available in the browser console:

1. **`window.investigateAccessories()`**
   - Checks all accessories in database with their status values
   - Verifies Deco product line default options for accessories
   - Tests current filtering logic
   - Validates specific expected accessories (Anti-Fog, Touch Sensor)

2. **`window.testDataOnlyFiltering()`**
   - Tests the `shouldIncludeInUI()` function with various status combinations
   - Verifies "Data Only" items are properly excluded
   - Shows actual accessories filtering results

3. **`window.testStatusFiltering()`**
   - Comprehensive test of all status filtering across collections
   - Shows total items fetched and filtered for each collection

### Expected Results

**Before Fix:**
- ❌ Only "Anti-Fog" accessory visible in Deco configurator
- ❌ "Touch Sensor" missing despite being published
- ❌ "Data Only" items potentially visible in UI

**After Fix:**
- ✅ Both "Anti-Fog" and "Touch Sensor" visible in Deco configurator
- ✅ "Data Only" items excluded from UI but available via API
- ✅ Comprehensive logging shows filtering decisions
- ✅ Backward compatibility maintained for items without status fields

## Database Schema Considerations

### Current Status Values
Based on investigation, the database may contain:
- `status = "published"` → ✅ Include in UI
- `status = "Data Only"` → ❌ Exclude from UI (but keep in API)
- `status = "draft"` → ❌ Exclude from UI
- `status = "archived"` → ❌ Exclude from UI
- `active = true/false` → Fallback when no status field

### API vs UI Filtering
- **API calls**: Return all items (including "Data Only") for system functionality
- **UI filtering**: Apply `shouldIncludeInUI()` to exclude non-published items
- **Configurator**: Only show published/active items to end users

## Files Modified

1. **`src/services/supabase-graphql.ts`**
   - Added `EXCLUDED_STATUSES` and `PUBLISHED_STATUSES` constants
   - Implemented `shouldIncludeInUI()` helper function
   - Applied UI filtering to `getAllOptionsOptimized()` results
   - Added `investigateAccessories()` and `testDataOnlyFiltering()` debug functions

2. **`src/App.tsx`**
   - Fixed hardcoded accessories filter to include "Touch Sensor"
   - Added comprehensive accessories filtering debug logging
   - Made debug functions available globally via window object

3. **`docs/ACCESSORIES_FILTERING_FIX.md`**
   - Comprehensive documentation of the issue and solution

## Monitoring and Maintenance

### Key Metrics to Monitor
- Number of accessories visible in Deco configurator (should include Anti-Fog and Touch Sensor)
- Console logs showing filtering decisions
- No "Data Only" items appearing in UI dropdowns

### Future Considerations
- Consider moving accessories filter logic to database level (product line defaults)
- Implement admin interface to manage which accessories appear for each product line
- Add automated tests to prevent regression of accessories filtering

## Rollback Plan

If issues arise, the changes can be reverted by:
1. Reverting the hardcoded filter in `App.tsx` to original state
2. Removing the `shouldIncludeInUI()` filtering from `getAllOptionsOptimized()`
3. The system will fall back to previous behavior (showing "Data Only" items but missing Touch Sensor)

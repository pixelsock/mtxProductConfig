# Filtering Logic Analysis

## Current Implementation Problem

The filtering logic in `src/store/slices/apiSlice.ts` (lines 288-400) has a fundamental timing issue:

### Problematic Sequence

1. **Line 288**: `getFilteredOptions(currentSelection, productLine.id)` 
   - Calculates filtering based on pre-rule configuration state
   - Uses `currentSelection` which may be incomplete/different after rules

2. **Lines 295-342**: Rules processing
   - Rules are applied and may set new values
   - `updateConfiguration()` is called to update store with rule-set values
   - Configuration state changes, but filtering result is now stale

3. **Lines 355-396**: Disabled options calculation  
   - Uses the OLD `filteringResult` from step 1
   - Merges with rule-disabled options
   - Final result reflects pre-rule filtering + rule disabled options

4. **Line 400**: `setDisabledOptions(disabledOptions)`
   - Stores the mixed result that doesn't reflect current configuration

### Root Cause

**The filtering system never recalculates after rules modify the configuration state.**

### Impact

- Configuration initialization shows wrong availability
- Rule-triggered updates have incorrect disabled states  
- UI shows availability for the wrong mirror style/light direction
- Dynamic filtering is out of sync with actual configuration

### Solution Required

Implement two-phase filtering:
1. **Phase 1**: Initial filtering with pre-rule configuration
2. **Phase 2**: Re-run filtering after rules have updated the configuration state

This ensures disabled options always reflect the current effective configuration.
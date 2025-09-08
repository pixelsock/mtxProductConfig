# Legacy Function Elimination Tracking

**MISSION CRITICAL:** Complete removal of hard-coded data functions is essential for true CMS-driven control.

## Functions Requiring Elimination (Current Count: 13+)

**Status: ACTIVE - Must Be Removed**
- `getActiveFrameColors()` - Replace with `getOptions('frame_colors')`
- `getActiveFrameThicknesses()` - Replace with `getOptions('frame_thicknesses')`
- `getActiveMountingOptions()` - Replace with `getOptions('mounting_options')`
- `getActiveLightDirections()` - Replace with `getOptions('light_directions')`
- `getActiveMirrorStyles()` - Replace with `getOptions('mirror_styles')`
- `getActiveMirrorControls()` - Replace with `getOptions('mirror_controls')`
- `getActiveLightOutputs()` - Replace with `getOptions('light_outputs')`
- `getActiveColorTemperatures()` - Replace with `getOptions('color_temperatures')`
- `getActiveDrivers()` - Replace with `getOptions('drivers')`
- `getActiveSizes()` - Replace with `getOptions('sizes')`
- `getProductLines()` - Replace with `getOptions('product_lines')`
- Individual accessory fetchers - Replace with filtered `getOptions('accessories')`

## Elimination Process
1. **Phase 1**: Implement OptionRegistry and getOptions() generic function
2. **Phase 2**: Update components to use getOptions() calls
3. **Phase 3**: **CRITICAL CLEANUP** - Remove all hard-coded functions from directus.ts
4. **Phase 4**: Validate no fallback paths exist to hard-coded data

## Documentation Requirements
- **Removal Log**: Track each function as it's eliminated with date/commit
- **Component Updates**: Document which components switched from old to new pattern
- **Validation Checklist**: Ensure no hidden references to eliminated functions
- **Future-Proofing Verification**: Confirm 100% CMS dependency achieved

## Success Criteria
- ✅ Zero hard-coded collection fetchers in codebase
- ✅ All option data flows through configuration_ui metadata
- ✅ Complete administrative control via Directus CMS
- ✅ No fallback mechanisms to static data

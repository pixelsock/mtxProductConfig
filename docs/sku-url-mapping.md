# SKU ↔ URL Mapping Specification

This document defines the canonical mapping between SKU codes and URL parameters in the product configurator.

## Overview

The configurator uses a simplified URL scheme where the entire product configuration is encoded as a single SKU string in the `?search=` parameter:

```
https://example.com/configurator?search=ECLIPSE3L24-24X36-300-3K-FEM-P-PBB
```

This SKU string contains all configuration information and can be parsed back to restore the complete configurator state.

## SKU Structure

### Full SKU Format
```
{core}-{size}-{light_output}-{color_temperature}-{driver}-{mounting_option}-{frame_color}-{accessories}
```

### Core Format
```
{product_line}{mirror_style}{light_direction}
```

### Segment Definitions

| Segment | Description | Example Values | Notes |
|---------|-------------|---------------|--------|
| `core` | Product line + mirror style + light direction | `ECLIPSE3L24` | Always present |
| `size` | Dimensions or size code | `24X36`, `33.533`, `2436` | Multiple formats supported |
| `light_output` | Light output level | `300`, `450`, `600` | Optional |
| `color_temperature` | Color temperature | `3K`, `4K`, `5K` | Optional |
| `driver` | Driver type | `FEM`, `DALI`, `0-10V` | Optional |
| `mounting_option` | Mounting method | `P`, `R`, `F` | Optional |
| `frame_color` | Frame color code | `PBB`, `MBB`, `WH` | Optional |
| `accessories` | Accessories list | `NL+AF`, `AN`, `NA` | Optional, supports composites |

## Query Parameter Mapping

When parsing SKUs into query parameters (used internally), the following mapping applies:

| Query Key | SKU Segment | Description |
|-----------|-------------|-------------|
| `pl` | product_line | Product line code |
| `ms` | mirror_style | Mirror style code |
| `ld` | light_direction | Light direction code |
| `sz` | size | Size code or dimensions |
| `lo` | light_output | Light output code |
| `ct` | color_temperature | Color temperature code |
| `dr` | driver | Driver code |
| `mo` | mounting_option | Mounting option code |
| `fc` | frame_color | Frame color code |
| `ac` | accessories | Accessories code(s) |

## Size Encoding Rules

### Supported Size Formats

1. **Preset Size Codes**: Direct mapping to configured sizes
   - Example: `STD24` → 24×36 standard size

2. **Explicit Dimensions with 'x'**: Width×Height with decimals
   - Format: `{width}x{height}` or `{width}X{height}`
   - Example: `24.5x36`, `33.25X48`

3. **No-Separator Format**: Width with optional decimals + height integer
   - Format: `{width}{height}` where width can have decimals
   - Example: `33.533` → width: 33.5, height: 33
   - Example: `2436` → width: 24, height: 36

4. **Legacy Compact**: 4-digit format (2 digits each for width/height)
   - Format: `WWHH`
   - Example: `2436` → width: 24, height: 36

## Accessory Encoding

### Individual Accessories
Multiple accessories are joined with `+`:
```
NL+AF  // Nightlight + Anti-fog
```

### Composite Accessories
Special codes represent common combinations:

| Code | Expansion | Description |
|------|-----------|-------------|
| `AN` | `NL+AF` | All accessories (Nightlight + Anti-fog) |
| `NA` | `null` | No accessories (explicit none) |

## Parsing Rules

### Case Sensitivity
- All SKU parsing is **case-insensitive**
- Internal storage uses uppercase
- URL output uses uppercase

### Segment Validation
- Each segment must match exactly to a known option to be set
- Partial matches are allowed for core parsing but not committed unless exact
- Unknown segments are ignored rather than causing errors

### Product Line Inference
When parsing a SKU without knowing the product line:

1. **Exact Product Match**: Match SKU core to `products.sku_code`
2. **Product Line Prefix**: Match core prefix to `product_lines.sku_code`
3. **Longest Match**: When multiple product lines match, use the longest prefix

## Error Handling

### Invalid SKUs
- Return partial matches where possible
- Invalid segments are ignored, not errored
- Malformed size formats fall back to previous valid size

### Missing Data
- Missing options collections default to empty arrays
- Missing product line falls back to current context
- Unknown codes are filtered out silently

## Rules Engine Integration

### Override Priority
1. **Rule Overrides**: `computeRuleOverrides()` output takes precedence
2. **Product SKU Override**: Specific product codes override general rules  
3. **Configuration Selection**: User selections are baseline

### Supported Overrides
All SKU segments can be overridden by rules:
- `productSkuOverride`: Complete core replacement
- `mirrorStyleSkuOverride`: Mirror style segment only
- `lightDirectionSkuOverride`: Light direction segment only
- `sizeSkuOverride`: Size segment override
- `accessoriesOverride`: Accessories segment override
- And all other segment-specific overrides

## Implementation Files

### Core Functions
- `src/utils/sku-url.ts`: URL ↔ SKU conversion
- `src/utils/sku-builder.ts`: SKU generation
- `src/App.tsx`: URL synchronization logic

### Key Functions
- `encodeSkuToQuery()`: Config → Query params
- `decodeQueryToSelection()`: Query params → Config
- `parsePartialSkuToQuery()`: SKU string → Query params
- `buildFullSku()`: Config → SKU string
- `buildSearchParam()`: Config → URL search param

## Examples

### Complete Configuration
```javascript
// Configuration
config = {
  productLineId: 1,
  mirrorStyle: "3", // Eclipse
  lighting: "2",    // L24  
  width: "24",
  height: "36",
  lightOutput: "1", // 300
  colorTemperature: "1", // 3K
  driver: "1",      // FEM
  mounting: "1",    // P
  frameColor: "1",  // PBB
  accessories: ["1", "2"] // NL+AF
}

// Generated SKU
"ECLIPSE3L24-24X36-300-3K-FEM-P-PBB-NL+AF"

// URL
"?search=ECLIPSE3L24-24X36-300-3K-FEM-P-PBB-NL%2BAF"
```

### Partial Configuration
```javascript
// Minimal configuration
config = {
  productLineId: 1,
  mirrorStyle: "3",
  lighting: "2"
}

// Generated SKU
"ECLIPSE3L24"

// URL  
"?search=ECLIPSE3L24"
```

### With Rule Overrides
```javascript
// Configuration
config = { /* ... */ }

// Rule overrides
overrides = {
  productSkuOverride: "CUSTOM001",
  accessoriesOverride: "AN"
}

// Generated SKU
"CUSTOM001-24X36-300-3K-FEM-P-PBB-AN"
```

## Migration and Compatibility

### Legacy Support
- Old query parameter formats (`?ms=3&ld=2&...`) still parsed during initial load
- Automatically migrated to `?search=` format after first configuration change

### Future Enhancements
- Reserved segment position for hanging technique
- Extensible override system for new SKU segments
- Custom encoding rules per product line if needed

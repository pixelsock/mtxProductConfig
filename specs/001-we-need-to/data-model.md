# Data Model: Product Options Visibility

## Key Entities

### ProductLine
**Purpose**: Defines a product category with associated default configuration options  
**Fields**:
- `id`: Unique identifier
- `name`: Display name (e.g., "Polished")
- `sku_code`: Product line code (e.g., "P")
- `default_options`: Array of collection/item references
- `active`: Boolean flag for visibility

**Relationships**:
- `default_options` → Collection items (frame_colors, accessories, etc.)
- Referenced by `products` via sku_code matching

**Validation Rules**:
- `default_options` array must contain valid collection/item pairs
- Each referenced item must exist and be active
- `sku_code` must be unique

### DefaultOptions (Array Elements)
**Purpose**: References to specific configuration options available for a product line  
**Structure**:
```typescript
{
  collection: string, // e.g., "frame_colors", "accessories"
  item: string | number // ID of the specific option
}
```

**Validation Rules**:
- Collection must exist in system
- Item ID must exist in referenced collection
- Referenced item must have `active: true`

### ConfigurationOptions
**Purpose**: Individual selectable items in various collections  
**Collections**: 
- `frame_colors` (hex_code, name)
- `frame_thicknesses` (name, sku_code)
- `mirror_controls` (name, sku_code)
- `accessories` (name, sku_code)
- `light_directions` (name, sku_code)
- `color_temperatures` (name, sku_code)
- `mirror_styles` (name, variants)
- `mounting_options` (name, sku_code)
- `light_outputs` (name, sku_code)
- `drivers` (name, sku_code)
- `sizes` (width, height, name)

**Common Fields**:
- `id`: Unique identifier
- `name`: Display name
- `active`: Boolean visibility flag
- `sku_code` or `hex_code`: Value for SKU building

### CodeOrder
**Purpose**: Defines the sequence for SKU building  
**Fields**:
- `id`: Unique identifier
- `collection`: Collection name
- `order`: Numeric sort order
- `active`: Boolean flag

### ConfigurationUI
**Purpose**: Defines display order in configurator interface  
**Fields**:
- `id`: Unique identifier  
- `collection`: Collection name
- `display_order`: Numeric sort order
- `active`: Boolean flag

## State Transitions

### Option Loading Flow
1. **Initial State**: No product line selected
2. **Product Line Selection**: User selects product line (e.g., Polished)
3. **Default Options Loading**: System fetches default_options for selected product line
4. **Option Resolution**: Each default_options entry is resolved to actual collection items
5. **Display State**: Options appear in current configurator section

### Current Issue State
1. ✅ **Option Sets Loading**: Options load correctly in option sets display
2. ❌ **Current Configurator Loading**: Options do not appear in current configurator section
3. **Divergent State**: Same data shows in different components inconsistently

## Data Flow Requirements

### Expected Flow
```
Directus API → Service Layer → React State → UI Components
     ↓              ↓             ↓           ↓
default_options → processing → ProductConfig → CurrentConfigurator
```

### Current Broken Flow
```
Directus API → Service Layer → React State → UI Components
     ↓              ↓             ↓           ↓
default_options → processing → ProductConfig → ❌ Missing in CurrentConfigurator
                                    ↓ 
                                OptionSets ← ✅ Working
```

## Validation Requirements

### API Level
- default_options array contains valid references
- Referenced collections exist and are accessible
- Referenced items have `active: true`
- Proper nested query expansion for relationships

### Frontend Level  
- ProductConfig state includes resolved default_options
- Current configurator section receives option data
- Display order follows configuration_ui collection
- SKU building follows code_order collection

### Integration Level
- Consistent data between option sets and current configurator
- Accessories appear for all product lines
- Polished product line shows complete option set
- Error handling for missing or invalid references
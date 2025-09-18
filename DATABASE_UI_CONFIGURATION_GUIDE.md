# Database UI Configuration Guide

## Overview

The configurator now uses a **component mapping system** that connects database field types to your React UI components. This allows you to define UI components in React and reference them from the `configuration_ui` table in Supabase.

## Available UI Component Types

Set these values in the `configuration_ui.ui_type` field:

### Button-Based Components

**`button_grid`** - Single selection button grid
- **Best for**: Frame colors, mirror styles, mounting options, light directions
- **Layout**: 4-column grid of selectable buttons
- **Features**: Shows name, description, hex colors, prices

**`button_grid_multi`** - Multiple selection button grid
- **Best for**: Accessories, multiple options
- **Layout**: 4-column grid with multi-select capability
- **Features**: Toggle selection, shows prices with "+" prefix

**`preset_buttons`** - Preset size buttons
- **Best for**: Standard size selections
- **Layout**: 3-column grid optimized for dimensions
- **Features**: Shows dimensions (width × height)

### Input Components

**`size_input`** - Custom width/height inputs
- **Best for**: Custom size entry
- **Layout**: Side-by-side width/height number inputs
- **Features**: Inch measurements, validation

**`toggle_switch`** - On/off toggle
- **Best for**: Binary options (enable/disable features)
- **Layout**: Inline switch with label
- **Features**: Simple on/off state

### Specialized Components

**`color_picker`** - Color selection grid
- **Best for**: Frame colors, accent colors
- **Layout**: 6-column grid optimized for colors
- **Features**: Color swatches, hex codes, names

**`image_selector`** - Image thumbnail selector
- **Best for**: Mirror styles, product variants
- **Layout**: 3-column grid with image previews
- **Features**: Thumbnails with labels

### Traditional Components

**`dropdown_select`** - Dropdown menu
- **Best for**: Long lists of options
- **Layout**: Compact dropdown
- **Status**: Ready for implementation

**`radio_group`** - Radio button group
- **Best for**: Single selection from few options
- **Layout**: Vertical list
- **Status**: Ready for implementation

## Database Configuration Examples

### Frame Colors Configuration
```sql
INSERT INTO configuration_ui (id, collection, ui_type, sort)
VALUES ('frame_colors', 'frame_colors', 'color_picker', 20);
```

### Mirror Controls Configuration
```sql
INSERT INTO configuration_ui (id, collection, ui_type, sort)
VALUES ('mirror_controls', 'mirror_controls', 'button_grid', 10);
```

### Accessories Configuration
```sql
INSERT INTO configuration_ui (id, collection, ui_type, sort)
VALUES ('accessories', 'accessories', 'button_grid_multi', 80);
```

### Custom Size Configuration
```sql
INSERT INTO configuration_ui (id, collection, ui_type, sort)
VALUES ('custom_size', 'sizes', 'size_input', 60);
```

### Standard Sizes Configuration
```sql
INSERT INTO configuration_ui (id, collection, ui_type, sort)
VALUES ('preset_sizes', 'sizes', 'preset_buttons', 50);
```

## Field Mapping Logic

The system works as follows:

1. **Load UI Config**: Read `configuration_ui` table to get field definitions
2. **Map UI Type**: Use `ui_type` field to look up React component
3. **Load Options**: Query the specified `collection` table for available options
4. **Render Component**: Create the appropriate React component with data
5. **Handle Interactions**: Process user selections and update configuration

## Component Properties

Each UI component type supports different properties:

### Button Grid Properties
- `variant`: Button style (`outline`, `default`)
- `selectable`: `'single'` or `'multiple'`
- `gridColumns`: Number of columns (2-4)

### Layout Properties
- `layout`: `'grid'`, `'list'`, `'inline'`, `'stacked'`
- `gridColumns`: For grid layouts
- `showLabels`: Display option labels
- `showPrices`: Display pricing information

## Validation Properties
- `required`: Field is mandatory
- `minSelection`: Minimum number of selections (multi-select)
- `maxSelection`: Maximum number of selections (multi-select)

## Database Schema Requirements

Your `configuration_ui` table should have:
```sql
CREATE TABLE configuration_ui (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL,           -- Table name to query for options
  ui_type TEXT NOT NULL,             -- UI component type (see list above)
  sort INTEGER DEFAULT 0             -- Display order
);
```

## Integration with Rules Engine

UI components work with the rules engine:
- **Disable Options**: Rules can disable specific option IDs
- **Hide Options**: Rules can hide options from display
- **Set Values**: Rules can automatically set field values
- **Clear Values**: Rules can clear field selections

## Next Steps

1. **Update Database**: Add/modify rows in `configuration_ui` table with appropriate `ui_type` values
2. **Test Components**: Use the test page to verify UI components render correctly
3. **Add Rules**: Configure business logic in the `rules` table
4. **Customize Styling**: Modify component mappings in `ui-component-mapper.ts` if needed

## Example Complete Configuration

```sql
-- Mirror Controls (single selection buttons)
INSERT INTO configuration_ui VALUES ('mirror_controls', 'mirror_controls', 'button_grid', 10);

-- Frame Colors (color picker)
INSERT INTO configuration_ui VALUES ('frame_colors', 'frame_colors', 'color_picker', 20);

-- Frame Thickness (radio buttons)
INSERT INTO configuration_ui VALUES ('frame_thickness', 'frame_thicknesses', 'button_grid', 30);

-- Mirror Styles (image selector)
INSERT INTO configuration_ui VALUES ('mirror_style', 'mirror_styles', 'image_selector', 40);

-- Standard Sizes (preset buttons)
INSERT INTO configuration_ui VALUES ('preset_sizes', 'sizes', 'preset_buttons', 50);

-- Custom Size (input fields)
INSERT INTO configuration_ui VALUES ('custom_size', 'sizes', 'size_input', 60);

-- Mounting (single selection buttons)
INSERT INTO configuration_ui VALUES ('mounting', 'mounting_options', 'button_grid', 70);

-- Accessories (multi-select buttons)
INSERT INTO configuration_ui VALUES ('accessories', 'accessories', 'button_grid_multi', 80);

-- Light Output (single selection buttons)
INSERT INTO configuration_ui VALUES ('light_output', 'light_outputs', 'button_grid', 90);

-- Driver (dropdown for many options)
INSERT INTO configuration_ui VALUES ('driver', 'drivers', 'dropdown_select', 100);
```

This gives you complete control over the UI from the database! 🎉
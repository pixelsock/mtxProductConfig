/**
 * UI Component Mapper
 *
 * Maps database field types to React UI components.
 * This allows you to define UI components in React and reference them
 * from the configuration_ui table in Supabase.
 */

import React from 'react';

// Import your existing UI components
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

export interface ComponentMappingConfig {
  component: string; // The React component name to use
  props?: Record<string, any>; // Default props for the component
  layout?: 'grid' | 'list' | 'inline' | 'stacked'; // Layout style
  gridColumns?: number; // For grid layouts
  validation?: {
    required?: boolean;
    minSelection?: number;
    maxSelection?: number;
  };
}

// Define available UI component mappings
export const UI_COMPONENT_MAPPINGS: Record<string, ComponentMappingConfig> = {
  // Button grid - for single selection (frame colors, mirror styles, etc.)
  'button_grid': {
    component: 'ButtonGrid',
    layout: 'grid',
    gridColumns: 4,
    props: {
      variant: 'outline',
      selectable: 'single'
    }
  },

  // Button grid for multiple selection (accessories)
  'button_grid_multi': {
    component: 'ButtonGrid',
    layout: 'grid',
    gridColumns: 4,
    props: {
      variant: 'outline',
      selectable: 'multiple'
    }
  },

  // Toggle switch (on/off options)
  'toggle_switch': {
    component: 'ToggleSwitch',
    layout: 'inline',
    props: {}
  },

  // Custom size inputs (width/height)
  'size_input': {
    component: 'SizeInputs',
    layout: 'stacked',
    props: {
      units: 'inches'
    }
  },

  // Dropdown select
  'dropdown_select': {
    component: 'DropdownSelect',
    layout: 'inline',
    props: {}
  },

  // Radio button group
  'radio_group': {
    component: 'RadioGroup',
    layout: 'list',
    props: {}
  },

  // Preset size buttons (standard sizes)
  'preset_buttons': {
    component: 'PresetButtons',
    layout: 'grid',
    gridColumns: 3,
    props: {
      showDimensions: true
    }
  },

  // Color picker with hex display
  'color_picker': {
    component: 'ColorPicker',
    layout: 'grid',
    gridColumns: 6,
    props: {
      showHex: true,
      showName: true
    }
  },

  // Image selector with thumbnails
  'image_selector': {
    component: 'ImageSelector',
    layout: 'grid',
    gridColumns: 3,
    props: {
      showLabels: true
    }
  }
};

// Component renderer interface
export interface UIComponentProps {
  field: {
    id: string;
    collection: string;
    ui_type: string; // This maps to UI_COMPONENT_MAPPINGS keys
    label: string;
    required: boolean;
    options: OptionItem[];
  };
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  disabledOptions?: (string | number)[];
}

export interface OptionItem {
  id: number | string;
  name: string;
  sku_code?: string;
  description?: string;
  hex_code?: string;
  price?: number;
  width?: string;
  height?: string;
  hide_in_configurator?: boolean;
}

/**
 * Get component configuration for a UI type
 */
export function getComponentMapping(uiType: string): ComponentMappingConfig | null {
  return UI_COMPONENT_MAPPINGS[uiType] || null;
}

/**
 * Get all available UI component types
 */
export function getAvailableUITypes(): string[] {
  return Object.keys(UI_COMPONENT_MAPPINGS);
}

/**
 * Render a UI component based on field configuration
 */
export function renderUIComponent(props: UIComponentProps): React.ReactElement {
  const mapping = getComponentMapping(props.field.ui_type);

  if (!mapping) {
    return React.createElement('div', {
      className: 'text-red-500 p-4 border border-red-300 rounded'
    }, `Unsupported UI type: ${props.field.ui_type}`);
  }

  switch (mapping.component) {
    case 'ButtonGrid':
      return React.createElement(ButtonGridComponent, { ...props, mapping });

    case 'ToggleSwitch':
      return React.createElement(ToggleSwitchComponent, { ...props, mapping });

    case 'SizeInputs':
      return React.createElement(SizeInputsComponent, { ...props, mapping });

    case 'ColorPicker':
      return React.createElement(ColorPickerComponent, { ...props, mapping });

    case 'PresetButtons':
      return React.createElement(PresetButtonsComponent, { ...props, mapping });

    case 'ImageSelector':
      return React.createElement(ImageSelectorComponent, { ...props, mapping });

    case 'DropdownSelect':
      return React.createElement(DropdownSelectComponent, { ...props, mapping });

    case 'RadioGroup':
      return React.createElement(RadioGroupComponent, { ...props, mapping });

    default:
      return React.createElement('div', {
        className: 'text-yellow-500 p-4 border border-yellow-300 rounded'
      }, `Component not implemented: ${mapping.component}`);
  }
}

// Component implementations
function ButtonGridComponent({ field, value, onChange, disabled, disabledOptions, mapping }: UIComponentProps & { mapping: ComponentMappingConfig }) {
  const isMultiSelect = mapping.props?.selectable === 'multiple';
  const gridCols = mapping.gridColumns || 4;

  return React.createElement('div', {
    className: `grid grid-cols-2 md:grid-cols-${Math.min(gridCols, 4)} gap-3`
  },
    field.options
      .filter(option => !option.hide_in_configurator)
      .map(option => {
        const isSelected = isMultiSelect
          ? Array.isArray(value) && value.includes(option.id.toString())
          : value?.toString() === option.id.toString();
        const isDisabled = disabled || disabledOptions?.some(disabledId =>
          disabledId.toString() === option.id.toString()
        );

        const handleClick = () => {
          if (isDisabled) return;

          if (isMultiSelect) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = isSelected
              ? currentValues.filter((v: string) => v !== option.id.toString())
              : [...currentValues, option.id.toString()];
            onChange(newValues);
          } else {
            onChange(option.id);
          }
        };

        // Enhanced visual states
        let buttonClass = 'h-auto p-4 justify-start transition-all duration-200 ';
        let contentClass = 'text-left w-full ';

        if (isSelected) {
          buttonClass += 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105 ';
          contentClass += 'text-white ';
        } else if (isDisabled) {
          buttonClass += 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200 ';
          contentClass += 'text-gray-400 ';
        } else {
          buttonClass += 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 ';
          contentClass += 'text-gray-900 ';
        }

        return React.createElement(Button, {
          key: option.id,
          variant: isSelected ? "default" : "outline",
          className: buttonClass,
          onClick: handleClick,
          disabled: isDisabled
        },
          React.createElement('div', { className: contentClass },
            // Status indicator badge
            React.createElement('div', {
              className: 'flex items-center justify-between mb-1'
            },
              React.createElement('div', {
                className: `font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`
              }, option.name),
              isSelected && React.createElement('div', {
                className: 'w-2 h-2 bg-white rounded-full'
              }),
              isDisabled && React.createElement('div', {
                className: 'text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded'
              }, 'N/A')
            ),
            option.description && React.createElement('div', {
              className: `text-sm mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-600'}`
            }, option.description),
            option.hex_code && React.createElement('div', {
              className: 'flex items-center mt-2'
            },
              React.createElement('div', {
                className: 'w-4 h-4 rounded border border-gray-300 mr-2',
                style: { backgroundColor: option.hex_code }
              }),
              React.createElement('span', {
                className: `text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`
              }, option.hex_code)
            ),
            option.price && React.createElement('div', {
              className: `text-sm mt-1 ${isSelected ? 'text-green-200' : 'text-green-600'}`
            }, `${isMultiSelect ? '+' : ''}$${option.price}`)
          )
        );
      })
  );
}

function ToggleSwitchComponent({ field, value, onChange, disabled }: UIComponentProps) {
  const firstOption = field.options[0];
  if (!firstOption) return null;

  return React.createElement('div', { className: 'flex items-center space-x-3' },
    React.createElement(Switch, {
      id: `${field.id}-toggle`,
      checked: value === firstOption.id.toString(),
      onCheckedChange: (checked) => onChange(checked ? firstOption.id.toString() : ''),
      disabled
    }),
    React.createElement(Label, {
      htmlFor: `${field.id}-toggle`,
      className: 'text-gray-700'
    },
      firstOption.name,
      firstOption.description && React.createElement('span', {
        className: 'text-gray-500 ml-2'
      }, `(${firstOption.description})`)
    )
  );
}

function SizeInputsComponent({ field, value, onChange, disabled }: UIComponentProps) {
  return React.createElement('div', { className: 'space-y-4' },
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
      React.createElement('div', {},
        React.createElement(Label, { className: 'text-gray-700' }, 'Width (inches)'),
        React.createElement(Input, {
          type: 'number',
          value: value?.width || '',
          onChange: (e) => onChange({ ...value, width: e.target.value }),
          placeholder: 'Enter width',
          disabled
        })
      ),
      React.createElement('div', {},
        React.createElement(Label, { className: 'text-gray-700' }, 'Height (inches)'),
        React.createElement(Input, {
          type: 'number',
          value: value?.height || '',
          onChange: (e) => onChange({ ...value, height: e.target.value }),
          placeholder: 'Enter height',
          disabled
        })
      )
    )
  );
}

function ColorPickerComponent(props: UIComponentProps) {
  // Same as ButtonGridComponent but optimized for colors
  return ButtonGridComponent({ ...props, mapping: UI_COMPONENT_MAPPINGS.color_picker });
}

function PresetButtonsComponent({ field, value, onChange, disabled, disabledOptions }: UIComponentProps) {
  return React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 gap-3' },
    field.options
      .filter(option => !option.hide_in_configurator)
      .map(option => {
        const isSelected = value?.toString() === option.id.toString();
        const isDisabled = disabled || disabledOptions?.some(disabledId =>
          disabledId.toString() === option.id.toString()
        );

        return React.createElement(Button, {
          key: option.id,
          variant: isSelected ? "default" : "outline",
          className: `h-auto p-3 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`,
          onClick: () => !isDisabled && onChange(option.id),
          disabled: isDisabled
        },
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'font-semibold' }, option.name),
            (option.width && option.height) && React.createElement('div', {
              className: 'text-xs text-gray-500 mt-1'
            }, `${option.width}" × ${option.height}"`)
          )
        );
      })
  );
}

function ImageSelectorComponent({ field, value, onChange, disabled, disabledOptions }: UIComponentProps) {
  // Image selector implementation would go here
  return React.createElement('div', { className: 'text-gray-500' },
    'Image selector component - to be implemented'
  );
}

function DropdownSelectComponent({ field, value, onChange, disabled }: UIComponentProps) {
  // Dropdown implementation would go here
  return React.createElement('div', { className: 'text-gray-500' },
    'Dropdown select component - to be implemented'
  );
}

function RadioGroupComponent({ field, value, onChange, disabled }: UIComponentProps) {
  // Radio group implementation would go here
  return React.createElement('div', { className: 'text-gray-500' },
    'Radio group component - to be implemented'
  );
}
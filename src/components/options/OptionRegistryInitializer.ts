import { OptionTypeRegistry } from './OptionTypeRegistry';
import { CheckboxGroupSelector } from './CheckboxGroupSelector';
import { SelectDropdown } from './SelectDropdown';
import { RadioGroupSelector } from './RadioGroupSelector';
import { ButtonGroupSelector } from './ButtonGroupSelector';
import { ColorGridSelector } from './ColorGridSelector';
import { SliderInput } from './SliderInput';
import { TextInput } from './TextInput';
import { ImageSelector } from './ImageSelector';

/**
 * Initialize and configure the Option Type Registry with all available components
 * This maps configuration_ui.ui_type values to actual React components
 */
export const initializeOptionRegistry = (): OptionTypeRegistry => {
  const registry = new OptionTypeRegistry();

  // Checkbox Group Components
  registry.register('checkbox_group', CheckboxGroupSelector, {
    orientation: 'vertical',
    multiple: true
  });

  registry.register('checkbox_list', CheckboxGroupSelector, {
    orientation: 'vertical',
    multiple: true
  });

  registry.register('checkbox_inline', CheckboxGroupSelector, {
    orientation: 'horizontal',
    multiple: true
  });

  // Select Dropdown Components
  registry.register('select', SelectDropdown, {
    searchable: false,
    clearable: false
  });

  registry.register('select_searchable', SelectDropdown, {
    searchable: true,
    clearable: true
  });

  registry.register('dropdown', SelectDropdown, {
    searchable: false,
    clearable: false
  });

  registry.register('combobox', SelectDropdown, {
    searchable: true,
    clearable: true
  });

  // Radio Group Components
  registry.register('radio_group', RadioGroupSelector, {
    orientation: 'vertical',
    spacing: 'normal'
  });

  registry.register('radio_list', RadioGroupSelector, {
    orientation: 'vertical',
    spacing: 'normal'
  });

  registry.register('radio_inline', RadioGroupSelector, {
    orientation: 'horizontal',
    spacing: 'compact'
  });

  registry.register('radio_buttons', RadioGroupSelector, {
    orientation: 'vertical',
    spacing: 'loose'
  });

  // Button Group Components
  registry.register('button_group', ButtonGroupSelector, {
    variant: 'outline',
    orientation: 'horizontal',
    size: 'default'
  });

  registry.register('button_toggle', ButtonGroupSelector, {
    variant: 'filled',
    orientation: 'horizontal',
    size: 'default'
  });

  registry.register('button_pills', ButtonGroupSelector, {
    variant: 'outline',
    orientation: 'horizontal',
    size: 'small'
  });

  registry.register('button_stack', ButtonGroupSelector, {
    variant: 'outline',
    orientation: 'vertical',
    size: 'default'
  });

  // Color Selection Components
  registry.register('color_grid', ColorGridSelector, {
    variant: 'grid',
    showHex: true,
    columns: 4,
    size: 'medium'
  });

  registry.register('color_palette', ColorGridSelector, {
    variant: 'grid',
    showHex: false,
    columns: 6,
    size: 'large'
  });

  registry.register('color_list', ColorGridSelector, {
    variant: 'list',
    showHex: true,
    columns: 1,
    size: 'medium'
  });

  registry.register('color_swatch', ColorGridSelector, {
    variant: 'grid',
    showHex: false,
    columns: 8,
    size: 'small'
  });

  // Slider Components
  registry.register('slider', SliderInput, {
    showValue: true,
    showTicks: false,
    orientation: 'horizontal'
  });

  registry.register('range', SliderInput, {
    showValue: true,
    showTicks: true,
    orientation: 'horizontal'
  });

  registry.register('slider_vertical', SliderInput, {
    showValue: true,
    showTicks: false,
    orientation: 'vertical'
  });

  registry.register('number_slider', SliderInput, {
    showValue: true,
    showTicks: true,
    orientation: 'horizontal'
  });

  // Text Input Components
  registry.register('text', TextInput, {
    inputType: 'text',
    multiline: false
  });

  registry.register('text_input', TextInput, {
    inputType: 'text',
    multiline: false
  });

  registry.register('textarea', TextInput, {
    inputType: 'text',
    multiline: true
  });

  registry.register('email', TextInput, {
    inputType: 'email',
    multiline: false,
    autoComplete: 'email'
  });

  registry.register('url', TextInput, {
    inputType: 'url',
    multiline: false
  });

  registry.register('tel', TextInput, {
    inputType: 'tel',
    multiline: false,
    autoComplete: 'tel'
  });

  registry.register('password', TextInput, {
    inputType: 'password',
    multiline: false,
    autoComplete: 'current-password'
  });

  registry.register('number', TextInput, {
    inputType: 'number',
    multiline: false
  });

  // Image Selection Components
  registry.register('image_grid', ImageSelector, {
    variant: 'grid',
    showLabels: true,
    showDescriptions: false,
    columns: 3,
    imageSize: 'medium',
    allowPreview: true
  });

  registry.register('image_gallery', ImageSelector, {
    variant: 'grid',
    showLabels: true,
    showDescriptions: true,
    columns: 4,
    imageSize: 'large',
    allowPreview: true
  });

  registry.register('image_list', ImageSelector, {
    variant: 'list',
    showLabels: true,
    showDescriptions: true,
    columns: 1,
    imageSize: 'medium',
    allowPreview: true
  });

  registry.register('image_thumbnails', ImageSelector, {
    variant: 'grid',
    showLabels: false,
    showDescriptions: false,
    columns: 6,
    imageSize: 'small',
    allowPreview: true
  });

  registry.register('image_picker', ImageSelector, {
    variant: 'grid',
    showLabels: true,
    showDescriptions: false,
    columns: 3,
    imageSize: 'medium',
    allowPreview: false
  });

  return registry;
};

/**
 * Get the list of all registered ui_type values
 * Useful for validation and debugging
 */
export const getRegisteredUITypes = (): string[] => {
  const registry = initializeOptionRegistry();
  return registry.getRegisteredTypes();
};

/**
 * Validate that a ui_type is supported by the registry
 */
export const isUITypeSupported = (uiType: string): boolean => {
  const supportedTypes = getRegisteredUITypes();
  return supportedTypes.includes(uiType);
};

/**
 * Get component suggestions based on collection type or field name
 * Provides intelligent defaults for common scenarios
 */
export const getUITypeSuggestions = (collectionName: string, fieldName?: string): string[] => {
  const suggestions: string[] = [];

  // Collection-based suggestions
  switch (collectionName.toLowerCase()) {
    case 'frame_colors':
    case 'colors':
      suggestions.push('color_grid', 'color_palette', 'color_list');
      break;
      
    case 'sizes':
      suggestions.push('select', 'button_group', 'slider');
      break;
      
    case 'categories':
    case 'types':
      suggestions.push('select', 'radio_group', 'button_group');
      break;
      
    case 'accessories':
      suggestions.push('checkbox_group', 'checkbox_list');
      break;
      
    case 'images':
    case 'photos':
      suggestions.push('image_grid', 'image_gallery', 'image_list');
      break;
  }

  // Field name based suggestions
  if (fieldName) {
    const field = fieldName.toLowerCase();
    
    if (field.includes('color')) {
      suggestions.push('color_grid', 'color_palette');
    } else if (field.includes('size') || field.includes('dimension')) {
      suggestions.push('slider', 'select', 'number_slider');
    } else if (field.includes('image') || field.includes('photo')) {
      suggestions.push('image_grid', 'image_gallery');
    } else if (field.includes('description') || field.includes('notes')) {
      suggestions.push('textarea', 'text_input');
    } else if (field.includes('email')) {
      suggestions.push('email');
    } else if (field.includes('url') || field.includes('website')) {
      suggestions.push('url');
    } else if (field.includes('phone') || field.includes('tel')) {
      suggestions.push('tel');
    }
  }

  // Remove duplicates and return
  return [...new Set(suggestions)];
};
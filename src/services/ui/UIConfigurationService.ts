import { EventEmittingService } from '../core/BaseService';
import { getConfigurationUi } from '../config-ui';
import type {
  ConfigurationUIItem,
  UIConfiguration,
  ServiceResult,
  ProductLine,
  OptionSet
} from '../types/ServiceTypes';

export interface UIComponentConfig {
  collection: string;
  ui_type: string;
  component: string;
  props: Record<string, any>;
  sort: number;
  label?: string;
  required: boolean;
  default_value?: string;
  visible: boolean;
  group?: string;
}

export interface UILayoutConfig {
  layout: 'grid' | 'tabs' | 'accordion' | 'single-column';
  columns?: number;
  grouping?: 'category' | 'collection' | 'none';
  responsive?: boolean;
  spacing?: 'compact' | 'normal' | 'loose';
}

export interface UIThemeConfig {
  variant: 'default' | 'minimal' | 'cards' | 'compact';
  colorScheme?: 'light' | 'dark' | 'auto';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  animations?: boolean;
}

export interface DynamicUIConfig {
  components: UIComponentConfig[];
  layout: UILayoutConfig;
  theme: UIThemeConfig;
  validation: Record<string, any>;
}

export class UIConfigurationService extends EventEmittingService {
  private configurationUI: ConfigurationUIItem[] = [];
  private componentRegistry = new Map<string, any>();
  private isInitialized = false;

  constructor() {
    super();
    this.log('UIConfigurationService initialized');
    this.initializeDefaultComponents();
  }

  // Initialization
  public async initialize(): Promise<ServiceResult<ConfigurationUIItem[]>> {
    if (this.isInitialized) {
      return { success: true, data: this.configurationUI };
    }

    return this.withCaching('configuration-ui', async () => {
      try {
        this.log('Loading UI configuration from API');
        
        // Load configuration UI settings
        const { byCollection: uiMap, sortByCollection } = await getConfigurationUi();
        
        // Transform the UI map into ConfigurationUIItem format
        const configItems: ConfigurationUIItem[] = [];
        
        Object.entries(uiMap).forEach(([collection, uiType]) => {
          if (typeof uiType === 'string') {
            const sort = (sortByCollection as Record<string, number>)[collection] || 999;
            configItems.push({
              id: configItems.length + 1,
              collection,
              ui_type: uiType,
              sort,
              required: this.isRequiredCollection(collection),
              label: this.getCollectionLabel(collection)
            });
          }
        });

        this.configurationUI = configItems.sort((a, b) => a.sort - b.sort);
        this.isInitialized = true;
        
        this.log(`Loaded UI configuration for ${configItems.length} collections`);
        this.emit('ui-configuration-loaded', { configItems });
        
        return { success: true, data: this.configurationUI };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load UI configuration';
        this.error('Failed to initialize UI configuration', error);
        return { success: false, error: errorMessage };
      }
    });
  }

  // Dynamic UI generation
  public async generateUIConfig(
    productLine: ProductLine,
    availableOptions: Record<string, OptionSet>
  ): Promise<ServiceResult<DynamicUIConfig>> {
    if (!this.isInitialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return { success: false, error: initResult.error };
      }
    }

    try {
      const components = await this.buildComponentConfigs(productLine, availableOptions);
      const layout = this.determineOptimalLayout(components);
      const theme = this.getDefaultTheme();
      const validation = this.buildValidationConfig(components, availableOptions);

      const uiConfig: DynamicUIConfig = {
        components,
        layout,
        theme,
        validation
      };

      this.emit('ui-config-generated', { productLine, uiConfig });

      return { success: true, data: uiConfig };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate UI configuration';
      this.error('Failed to generate UI configuration', error);
      return { success: false, error: errorMessage };
    }
  }

  private async buildComponentConfigs(
    productLine: ProductLine,
    availableOptions: Record<string, OptionSet>
  ): Promise<UIComponentConfig[]> {
    const components: UIComponentConfig[] = [];

    // Process each UI configuration item
    for (const uiItem of this.configurationUI) {
      const optionSet = availableOptions[uiItem.collection];
      
      // Only include collections that have options available for this product line
      if (!optionSet || optionSet.options.length === 0) {
        continue;
      }

      // Check if this collection is in the product line's default options
      const isInDefaults = productLine.default_options?.some(
        opt => opt.collection === uiItem.collection
      ) || false;

      if (!isInDefaults) {
        continue;
      }

      const component: UIComponentConfig = {
        collection: uiItem.collection,
        ui_type: uiItem.ui_type,
        component: this.getComponentName(uiItem.ui_type),
        props: this.buildComponentProps(uiItem, optionSet),
        sort: uiItem.sort,
        label: uiItem.label || this.getCollectionLabel(uiItem.collection),
        required: uiItem.required,
        default_value: uiItem.default_value,
        visible: true,
        group: this.getCollectionGroup(uiItem.collection)
      };

      components.push(component);
    }

    return components.sort((a, b) => a.sort - b.sort);
  }

  private buildComponentProps(uiItem: ConfigurationUIItem, optionSet: OptionSet): Record<string, any> {
    const baseProps = {
      collection: uiItem.collection,
      options: optionSet.options,
      required: uiItem.required,
      label: uiItem.label || this.getCollectionLabel(uiItem.collection),
      name: this.getFieldName(uiItem.collection)
    };

    // Add UI type specific props
    switch (uiItem.ui_type) {
      case 'color-grid':
        return {
          ...baseProps,
          variant: 'grid',
          showHex: true,
          columns: 4,
          size: 'medium'
        };
      
      case 'button-group':
        return {
          ...baseProps,
          variant: 'outline',
          size: 'default',
          orientation: optionSet.options.length > 3 ? 'vertical' : 'horizontal'
        };
      
      case 'radio-group':
        return {
          ...baseProps,
          orientation: 'vertical',
          spacing: 'normal'
        };
      
      case 'select':
        return {
          ...baseProps,
          placeholder: `Select ${baseProps.label}...`,
          searchable: optionSet.options.length > 10
        };
      
      case 'checkbox-group':
        return {
          ...baseProps,
          orientation: 'vertical',
          multiple: true,
          max: optionSet.collection === 'accessories' ? 5 : undefined
        };
      
      case 'slider':
        return {
          ...baseProps,
          min: this.getMinValue(optionSet),
          max: this.getMaxValue(optionSet),
          step: this.getStepValue(optionSet),
          showValue: true
        };
      
      case 'input':
        return {
          ...baseProps,
          type: this.getInputType(uiItem.collection),
          placeholder: `Enter ${baseProps.label}...`,
          validation: this.getInputValidation(uiItem.collection)
        };
      
      default:
        return baseProps;
    }
  }

  private determineOptimalLayout(components: UIComponentConfig[]): UILayoutConfig {
    const componentCount = components.length;
    
    // Determine layout based on component count and types
    if (componentCount <= 4) {
      return {
        layout: 'single-column',
        columns: 1,
        grouping: 'none',
        responsive: true,
        spacing: 'normal'
      };
    } else if (componentCount <= 8) {
      return {
        layout: 'grid',
        columns: 2,
        grouping: 'category',
        responsive: true,
        spacing: 'normal'
      };
    } else {
      return {
        layout: 'tabs',
        grouping: 'category',
        responsive: true,
        spacing: 'compact'
      };
    }
  }

  private getDefaultTheme(): UIThemeConfig {
    return {
      variant: 'default',
      colorScheme: 'light',
      borderRadius: 'medium',
      animations: true
    };
  }

  private buildValidationConfig(
    components: UIComponentConfig[],
    availableOptions: Record<string, OptionSet>
  ): Record<string, any> {
    const validation: Record<string, any> = {};

    components.forEach(component => {
      const rules: any[] = [];

      if (component.required) {
        rules.push({ type: 'required', message: `${component.label} is required` });
      }

      // Add type-specific validation
      switch (component.collection) {
        case 'sizes':
          if (component.ui_type === 'input') {
            rules.push(
              { type: 'number', message: 'Size must be a number' },
              { type: 'min', value: 6, message: 'Minimum size is 6 inches' },
              { type: 'max', value: 120, message: 'Maximum size is 120 inches' }
            );
          }
          break;
        
        case 'accessories':
          rules.push({
            type: 'max-items',
            value: 5,
            message: 'Maximum 5 accessories allowed'
          });
          break;
      }

      if (rules.length > 0) {
        validation[component.collection] = rules;
      }
    });

    return validation;
  }

  // Component Registry
  private initializeDefaultComponents(): void {
    // Register default component mappings
    this.componentRegistry.set('color-grid', 'ColorGridSelector');
    this.componentRegistry.set('button-group', 'ButtonGroupSelector');
    this.componentRegistry.set('radio-group', 'RadioGroupSelector');
    this.componentRegistry.set('select', 'SelectDropdown');
    this.componentRegistry.set('checkbox-group', 'CheckboxGroupSelector');
    this.componentRegistry.set('slider', 'SliderInput');
    this.componentRegistry.set('input', 'TextInput');
    this.componentRegistry.set('toggle', 'ToggleSwitch');
    this.componentRegistry.set('image-select', 'ImageSelector');
  }

  public registerComponent(uiType: string, component: any): void {
    this.componentRegistry.set(uiType, component);
    this.log(`Registered component for UI type: ${uiType}`);
  }

  public getComponent(uiType: string): any {
    return this.componentRegistry.get(uiType);
  }

  private getComponentName(uiType: string): string {
    return this.componentRegistry.get(uiType) || 'DefaultSelector';
  }

  // Utility methods
  private isRequiredCollection(collection: string): boolean {
    const requiredCollections = [
      'frame_colors',
      'frame_thicknesses', 
      'mounting_options',
      'sizes'
    ];
    return requiredCollections.includes(collection);
  }

  private getCollectionLabel(collection: string): string {
    const labelMap: Record<string, string> = {
      'frame_colors': 'Frame Color',
      'frame_thicknesses': 'Frame Thickness',
      'mirror_styles': 'Mirror Style',
      'mounting_options': 'Mounting',
      'light_directions': 'Lighting',
      'color_temperatures': 'Color Temperature',
      'light_outputs': 'Light Output',
      'drivers': 'Driver',
      'sizes': 'Size',
      'accessories': 'Accessories'
    };
    
    return labelMap[collection] || collection.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getCollectionGroup(collection: string): string {
    const groupMap: Record<string, string> = {
      'frame_colors': 'Frame',
      'frame_thicknesses': 'Frame',
      'mirror_styles': 'Mirror',
      'mounting_options': 'Installation',
      'sizes': 'Dimensions',
      'light_directions': 'Lighting',
      'color_temperatures': 'Lighting',
      'light_outputs': 'Lighting',
      'drivers': 'Lighting',
      'accessories': 'Add-ons'
    };
    
    return groupMap[collection] || 'Other';
  }

  private getFieldName(collection: string): string {
    const fieldMap: Record<string, string> = {
      'frame_colors': 'frameColor',
      'frame_thicknesses': 'frameThickness',
      'mirror_styles': 'mirrorStyle',
      'mounting_options': 'mounting',
      'light_directions': 'lighting',
      'color_temperatures': 'colorTemperature',
      'light_outputs': 'lightOutput',
      'drivers': 'driver',
      'sizes': 'size',
      'accessories': 'accessories'
    };
    
    return fieldMap[collection] || collection;
  }

  private getMinValue(optionSet: OptionSet): number {
    const values = optionSet.options.map(opt => parseFloat(opt.value || '0')).filter(v => !isNaN(v));
    return values.length > 0 ? Math.min(...values) : 0;
  }

  private getMaxValue(optionSet: OptionSet): number {
    const values = optionSet.options.map(opt => parseFloat(opt.value || '100')).filter(v => !isNaN(v));
    return values.length > 0 ? Math.max(...values) : 100;
  }

  private getStepValue(optionSet: OptionSet): number {
    // Simple step calculation - could be made more sophisticated
    const range = this.getMaxValue(optionSet) - this.getMinValue(optionSet);
    return Math.max(1, Math.round(range / 20));
  }

  private getInputType(collection: string): string {
    if (collection.includes('size') || collection.includes('width') || collection.includes('height')) {
      return 'number';
    }
    return 'text';
  }

  private getInputValidation(collection: string): Record<string, any> {
    if (collection.includes('size') || collection.includes('width') || collection.includes('height')) {
      return {
        min: 6,
        max: 120,
        step: 0.5
      };
    }
    return {};
  }

  // Public API
  public getUIConfiguration(): ConfigurationUIItem[] {
    return [...this.configurationUI];
  }

  public async reloadUIConfiguration(): Promise<ServiceResult<ConfigurationUIItem[]>> {
    this.clearCache('configuration-ui');
    this.isInitialized = false;
    return this.initialize();
  }

  public getAvailableUITypes(): string[] {
    return Array.from(this.componentRegistry.keys());
  }

  public validateUIType(uiType: string): boolean {
    return this.componentRegistry.has(uiType);
  }
}
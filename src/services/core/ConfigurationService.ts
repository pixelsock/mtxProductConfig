import { EventEmittingService } from './BaseService';
import type {
  ProductConfiguration,
  ConfigurationState,
  ValidationResult,
  ConfigurationChangeEvent,
  ServiceResult,
  ProductLine,
  OptionSet
} from '../types/ServiceTypes';

export class ConfigurationService extends EventEmittingService {
  private state: ConfigurationState = {
    configuration: this.getDefaultConfiguration(),
    availableOptions: {},
    constraints: {},
    errors: [],
    isLoading: false
  };

  private stateListeners = new Set<(state: ConfigurationState) => void>();

  constructor() {
    super();
    this.log('ConfigurationService initialized');
  }

  // State management
  public getState(): ConfigurationState {
    return { ...this.state };
  }

  public subscribe(listener: (state: ConfigurationState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private setState(updates: Partial<ConfigurationState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    this.emit('state-change', { oldState, newState: this.state });
    this.stateListeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        this.error('Error in state listener', error);
      }
    });
  }

  // Configuration management
  public async initializeConfiguration(
    productLine: ProductLine,
    availableOptions: Record<string, OptionSet>
  ): Promise<ServiceResult<ProductConfiguration>> {
    this.setState({ isLoading: true, errors: [] });

    try {
      const configuration = this.createInitialConfiguration(productLine, availableOptions);
      this.setState({
        configuration,
        isLoading: false
      });

      this.emit('configuration-initialized', { productLine, configuration });
      
      return { success: true, data: configuration };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize configuration';
      this.setState({ 
        isLoading: false, 
        errors: [errorMessage] 
      });
      
      this.error('Failed to initialize configuration', error);
      return { success: false, error: errorMessage };
    }
  }

  public async updateConfiguration(
    field: keyof ProductConfiguration,
    value: any
  ): Promise<ServiceResult<ProductConfiguration>> {
    const oldConfiguration = { ...this.state.configuration };
    const newConfiguration = {
      ...oldConfiguration,
      [field]: value
    };

    // Validate the change
    const validation = await this.validateConfigurationChange(field, value, newConfiguration);
    if (!validation.valid) {
      this.setState({ errors: validation.errors });
      return { success: false, error: validation.errors.join(', ') };
    }

    // Apply the change
    this.setState({
      configuration: newConfiguration,
      errors: validation.warnings
    });

    const changeEvent: ConfigurationChangeEvent = {
      field,
      oldValue: oldConfiguration[field],
      newValue: value,
      configuration: newConfiguration
    };

    this.emit('configuration-changed', changeEvent);
    
    return { success: true, data: newConfiguration };
  }

  public async resetConfiguration(
    productLine?: ProductLine,
    availableOptions?: Record<string, OptionSet>
  ): Promise<ServiceResult<ProductConfiguration>> {
    if (productLine && availableOptions) {
      return this.initializeConfiguration(productLine, availableOptions);
    } else {
      const defaultConfig = this.getDefaultConfiguration();
      this.setState({
        configuration: defaultConfig,
        errors: []
      });

      this.emit('configuration-reset', { configuration: defaultConfig });
      return { success: true, data: defaultConfig };
    }
  }

  // Configuration creation and defaults
  private createInitialConfiguration(
    productLine: ProductLine,
    availableOptions: Record<string, OptionSet>
  ): ProductConfiguration {
    const config = this.getDefaultConfiguration();
    config.productLineId = productLine.id;
    config.productLineName = productLine.name;

    // Set defaults from available options
    Object.entries(availableOptions).forEach(([collection, optionSet]) => {
      if (optionSet.options.length > 0) {
        const defaultOption = optionSet.options[0];
        this.setConfigurationFieldFromCollection(config, collection, defaultOption.id.toString());
      }
    });

    // Apply product line specific defaults if any
    if (productLine.default_options) {
      productLine.default_options.forEach(defaultOption => {
        const optionSet = availableOptions[defaultOption.collection];
        if (optionSet) {
          const option = optionSet.options.find(opt => opt.id === defaultOption.option_id);
          if (option) {
            this.setConfigurationFieldFromCollection(config, defaultOption.collection, option.id.toString());
          }
        }
      });
    }

    return config;
  }

  private setConfigurationFieldFromCollection(
    config: ProductConfiguration,
    collection: string,
    value: string
  ): void {
    // Map collection names to configuration fields
    const fieldMapping: Record<string, keyof ProductConfiguration> = {
      'mirror_controls': 'mirrorControls',
      'frame_colors': 'frameColor',
      'frame_thicknesses': 'frameThickness',
      'mirror_styles': 'mirrorStyle',
      'mounting_options': 'mounting',
      'light_directions': 'lighting',
      'color_temperatures': 'colorTemperature',
      'light_outputs': 'lightOutput',
      'drivers': 'driver',
      'sizes': 'width' // Handle sizes specially
    };

    const field = fieldMapping[collection];
    if (field) {
      if (collection === 'sizes' && field === 'width') {
        // Handle size options specially - would need the actual size data
        // This would be handled by the ProductLineService
      } else if (field === 'accessories') {
        // Handle multiple selection
        const accessories = config.accessories || [];
        if (!accessories.includes(value)) {
          accessories.push(value);
          config.accessories = accessories;
        }
      } else {
        config[field] = value as any;
      }
    }
  }

  private getDefaultConfiguration(): ProductConfiguration {
    return {
      id: `config-${Date.now()}`,
      productLineId: 0,
      productLineName: '',
      mirrorControls: '',
      frameColor: '',
      frameThickness: '',
      mirrorStyle: '',
      width: '24',
      height: '36',
      mounting: '',
      lighting: '',
      colorTemperature: '',
      lightOutput: '',
      driver: '',
      accessories: [],
      quantity: 1,
    };
  }

  // Validation
  private async validateConfigurationChange(
    field: keyof ProductConfiguration,
    value: any,
    newConfiguration: ProductConfiguration
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic type validation
    switch (field) {
      case 'quantity':
        if (typeof value !== 'number' || value < 1 || value > 100) {
          errors.push('Quantity must be between 1 and 100');
        }
        break;
      case 'width':
      case 'height':
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
          errors.push(`${field} must be a positive number`);
        }
        break;
      case 'accessories':
        if (!Array.isArray(value)) {
          errors.push('Accessories must be an array');
        }
        break;
    }

    // Required field validation
    const requiredFields: Array<keyof ProductConfiguration> = [
      'productLineId', 'frameColor', 'frameThickness', 'mounting', 'width', 'height'
    ];
    
    for (const requiredField of requiredFields) {
      const fieldValue = newConfiguration[requiredField];
      if (fieldValue === '' || fieldValue === 0 || fieldValue == null) {
        errors.push(`${requiredField} is required`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  // Utility methods
  public getCurrentConfiguration(): ProductConfiguration {
    return { ...this.state.configuration };
  }

  public isLoading(): boolean {
    return this.state.isLoading;
  }

  public getErrors(): string[] {
    return [...this.state.errors];
  }

  public hasErrors(): boolean {
    return this.state.errors.length > 0;
  }

  public setLoading(loading: boolean): void {
    this.setState({ isLoading: loading });
  }

  public setAvailableOptions(options: Record<string, any[]>): void {
    this.setState({ availableOptions: options });
  }

  public setConstraints(constraints: Record<string, any>): void {
    this.setState({ constraints });
  }

  public addError(error: string): void {
    this.setState({ errors: [...this.state.errors, error] });
  }

  public clearErrors(): void {
    this.setState({ errors: [] });
  }
}
// Configuration types
export interface ProductConfiguration {
  id: string;
  productLineId: number;
  productLineName: string;
  mirrorControls: string;
  frameColor: string;
  frameThickness: string;
  mirrorStyle: string;
  width: string;
  height: string;
  mounting: string;
  lighting: string;
  colorTemperature: string;
  lightOutput: string;
  driver: string;
  accessories: string[];
  quantity: number;
}

// API Collection types
export interface ProductLine {
  id: number;
  name: string;
  sku_code: string;
  description?: string;
  active: boolean;
  default_options?: DefaultOption[];
}

export interface DefaultOption {
  id: number;
  collection: string;
  option_id: number;
  required: boolean;
  sort?: number;
}

export interface Product {
  id: number;
  name: string;
  sku_code?: string;
  product_line: number;
  vertical_image?: string;
  horizontal_image?: string;
  additional_images?: any[];
  active: boolean;
  mirror_style?: number;
  light_direction?: number;
  option_overrides?: OptionOverride[];
}

export interface OptionOverride {
  id: number;
  collection: string;
  option_id: number;
  override_value?: string;
  override_sku_code?: string;
}

export interface ConfigurationUIItem {
  id: number;
  collection: string;
  ui_type: string;
  sort: number;
  label?: string;
  required: boolean;
  default_value?: string;
}

export interface SkuCodeOrderItem {
  id: number;
  collection: string;
  position: number;
  include_in_sku: boolean;
  separator?: string;
  prefix?: string;
  suffix?: string;
}

export interface Rule {
  id: number;
  name: string;
  collection_field: string;
  condition_type: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  condition_value: any;
  then_collection: string;
  then_field: string;
  then_action: 'set_value' | 'add_option' | 'remove_option' | 'disable_option' | 'enable_option';
  then_value: any;
  active: boolean;
  priority: number;
}

// Service operation types
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConfigurationState {
  configuration: ProductConfiguration;
  availableOptions: Record<string, any[]>;
  constraints: Record<string, any>;
  errors: string[];
  isLoading: boolean;
}

export interface UIConfiguration {
  collections: ConfigurationUIItem[];
  layout: 'grid' | 'tabs' | 'accordion';
  columns?: number;
  grouping?: 'category' | 'type' | 'none';
}

// Option types
export interface ProductOption {
  id: number;
  name: string;
  sku_code: string;
  description?: string;
  hex_code?: string;
  width?: number;
  height?: number;
  value?: string;
  sort?: number;
  active: boolean;
}

export interface OptionSet {
  collection: string;
  options: ProductOption[];
  ui_type: string;
  required: boolean;
  multiple?: boolean;
}

// Event types
export interface ConfigurationChangeEvent {
  field: keyof ProductConfiguration;
  oldValue: any;
  newValue: any;
  configuration: ProductConfiguration;
}

export interface RuleApplicationEvent {
  rules: Rule[];
  context: any;
  results: any;
}

export interface ProductLineChangeEvent {
  oldProductLine?: ProductLine;
  newProductLine: ProductLine;
}

// Image selection types
export interface ImageSelection {
  primaryImage?: string;
  thumbnails: string[];
  source: 'vertical' | 'horizontal' | 'additional' | 'fallback';
  orientation: 'portrait' | 'landscape';
}

export interface ImageSelectionCriteria {
  product?: Product;
  mountingOption?: any;
  ruleOverrides?: any;
  configuration?: ProductConfiguration;
}

// Rule override types
export interface RuleOverrides {
  [key: string]: any;
}
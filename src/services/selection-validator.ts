import { ProductConfig, ProductLine } from '../store/types';
import { fetchProductOptions } from './product-options';

export interface ValidationResult {
  isValid: boolean;
  invalidSelections: InvalidSelection[];
  adjustedConfig: ProductConfig | null;
}

export interface InvalidSelection {
  field: keyof ProductConfig;
  collection: string;
  currentValue: string;
  suggestedValue: string | null;
  reason: 'disabled' | 'unavailable';
}

// Map config fields to collections (dynamic, based on data structure)
const FIELD_TO_COLLECTION_MAP: Record<string, string> = {
  mirrorStyle: 'mirror_styles',
  frameColor: 'frame_colors',
  frameThickness: 'frame_thicknesses',
  lighting: 'light_directions',
  mounting: 'mounting_options',
  driver: 'drivers',
  colorTemperature: 'color_temperatures',
  lightOutput: 'light_outputs',
};

// Map config fields to product options keys
const FIELD_TO_OPTIONS_KEY: Record<string, string> = {
  mirrorStyle: 'mirrorStyles',
  frameColor: 'frameColors',
  frameThickness: 'frameThickness',
  lighting: 'lightingOptions',
  mounting: 'mountingOptions',
  driver: 'drivers',
  colorTemperature: 'colorTemperatures',
  lightOutput: 'lightOutputs',
};

export async function validateCurrentSelections(
  config: ProductConfig,
  productLine: ProductLine,
  disabledOptionIds: Record<string, number[]>,
): Promise<ValidationResult> {
  const invalidSelections: InvalidSelection[] = [];
  const adjustedConfig: ProductConfig = { ...config };
  let hasAdjustments = false;

  // Load product options dynamically
  const productOptions = await fetchProductOptions(productLine.id);

  // Check each field that maps to a collection
  for (const [field, collection] of Object.entries(FIELD_TO_COLLECTION_MAP)) {
    const currentValue = config[field as keyof ProductConfig];

    if (!currentValue) continue; // Skip unset fields

    const disabledIds = disabledOptionIds[collection] || [];
    const ruleSetKey = `${collection}_rule_set`;
    const ruleSetIds = disabledOptionIds[ruleSetKey] || [];

    // Check if current selection is disabled
    const currentId = parseInt(currentValue as string);
    let isDisabled = false;

    // If there's a rule-set value, only that value is allowed
    if (ruleSetIds.length > 0) {
      isDisabled = !ruleSetIds.includes(currentId);
    } else {
      // Otherwise check if it's in the disabled list
      isDisabled = disabledIds.includes(currentId);
    }

    if (isDisabled) {
      // Find first available option dynamically
      const optionsKey = FIELD_TO_OPTIONS_KEY[field];
      const suggestedValue = await getFirstAvailableOption(
        collection,
        optionsKey,
        productOptions,
        disabledOptionIds
      );

      invalidSelections.push({
        field: field as keyof ProductConfig,
        collection,
        currentValue: currentValue as string,
        suggestedValue,
        reason: 'disabled',
      });

      if (suggestedValue) {
        (adjustedConfig as any)[field] = suggestedValue;
        hasAdjustments = true;

        if (import.meta.env.DEV) {
          console.log(`🔄 Auto-adjusting ${field}: ${currentValue} → ${suggestedValue} (disabled)`);
        }
      }
    }
  }

  return {
    isValid: invalidSelections.length === 0,
    invalidSelections,
    adjustedConfig: hasAdjustments ? adjustedConfig : null,
  };
}

export function isFieldSelectionValid(
  field: keyof ProductConfig,
  value: string,
  _config: ProductConfig,
  _productLine: ProductLine,
  disabledOptionIds: Record<string, number[]>,
): boolean {
  const collection = FIELD_TO_COLLECTION_MAP[field];
  if (!collection) return true; // Field doesn't map to a collection

  const disabledIds = disabledOptionIds[collection] || [];
  const ruleSetKey = `${collection}_rule_set`;
  const ruleSetIds = disabledOptionIds[ruleSetKey] || [];

  const valueId = parseInt(value);

  // If there's a rule-set value, only that value is valid
  if (ruleSetIds.length > 0) {
    return ruleSetIds.includes(valueId);
  }

  // Otherwise check if it's not disabled
  return !disabledIds.includes(valueId);
}

async function getFirstAvailableOption(
  collection: string,
  optionsKey: string,
  productOptions: any,
  disabledOptionIds: Record<string, number[]>,
): Promise<string | null> {
  const options = productOptions[optionsKey];
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  const disabledIds = disabledOptionIds[collection] || [];
  const ruleSetKey = `${collection}_rule_set`;
  const ruleSetIds = disabledOptionIds[ruleSetKey] || [];

  // If there's a rule-set value, return that
  if (ruleSetIds.length > 0) {
    return ruleSetIds[0].toString();
  }

  // Otherwise find first non-disabled option
  const availableOption = options.find((opt: any) => !disabledIds.includes(opt.id));
  return availableOption ? availableOption.id.toString() : null;
}

export async function createAdjustmentSuggestions(
  config: ProductConfig,
  productLine: ProductLine,
  disabledOptionIds: Record<string, number[]>,
): Promise<Record<keyof ProductConfig, string | null>> {
  const suggestions: Record<string, string | null> = {};
  const productOptions = await fetchProductOptions(productLine.id);

  for (const [field, collection] of Object.entries(FIELD_TO_COLLECTION_MAP)) {
    const currentValue = config[field as keyof ProductConfig];
    if (!currentValue) continue;

    const isValid = isFieldSelectionValid(
      field as keyof ProductConfig,
      currentValue as string,
      config,
      productLine,
      disabledOptionIds
    );

    if (!isValid) {
      const optionsKey = FIELD_TO_OPTIONS_KEY[field];
      suggestions[field] = await getFirstAvailableOption(
        collection,
        optionsKey,
        productOptions,
        disabledOptionIds
      );
    }
  }

  return suggestions as Record<keyof ProductConfig, string | null>;
}


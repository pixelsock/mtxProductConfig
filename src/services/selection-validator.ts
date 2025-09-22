/**
 * Selection Validator Service
 *
 * Detects when current selections become disabled by dynamic filtering
 * and provides automatic adjustment to maintain valid configuration state.
 */

import { ProductConfig, ProductLine } from '../store/types';
import { initializeFiltering } from './dynamic-filtering';
import { getFilteredOptions, isOptionDisabled } from './dynamic-filtering';

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

/**
 * Map configuration fields to their corresponding database collections
 */
const FIELD_TO_COLLECTION_MAP: Record<keyof ProductConfig, string> = {
  mirrorStyle: 'mirror_styles',
  frameColor: 'frame_colors',
  frameThickness: 'frame_thicknesses',
  mounting: 'mounting_options',
  lighting: 'light_directions',
  colorTemperature: 'color_temperatures',
  lightOutput: 'light_outputs',
  driver: 'drivers',
  // Skip non-option fields
  id: '',
  productLineId: '',
  productLineName: '',
  mirrorControls: '', // deprecated
  width: '',
  height: '',
  accessories: '',
  quantity: ''
};

/**
 * Fields that should be validated for dynamic filtering
 */
const VALIDATABLE_FIELDS: (keyof ProductConfig)[] = [
  'mirrorStyle',
  'frameColor',
  'frameThickness',
  'mounting',
  'lighting',
  'colorTemperature',
  'lightOutput',
  'driver'
];

/**
 * Validate current configuration against dynamic filtering rules
 */
export async function validateCurrentSelections(
  config: ProductConfig,
  productLine: ProductLine,
  disabledOptionIds: Record<string, number[]>
): Promise<ValidationResult> {
  // Ensure filtering is initialized
  await initializeFiltering();

  const invalidSelections: InvalidSelection[] = [];
  let adjustedConfig: ProductConfig | null = null;

  // Build current selection object for dynamic filtering
  // IMPORTANT: Only include mirror_styles to match the main filtering logic
  // We should NOT include light_directions because we're checking if it needs adjustment
  const currentSelection: Record<string, any> = {};
  if (config.mirrorStyle) {
    currentSelection.mirror_styles = config.mirrorStyle;
  }

  // Get filtered options based on current selections
  const filteredOptions = getFilteredOptions(currentSelection, productLine.id);

  // Check each validatable field
  for (const field of VALIDATABLE_FIELDS) {
    const collection = FIELD_TO_COLLECTION_MAP[field];
    if (!collection) continue;

    const currentValue = config[field];
    if (!currentValue || typeof currentValue !== 'string') continue;

    // Check if current value is disabled by dynamic filtering
    const disabledIds = disabledOptionIds[collection] || [];
    const isCurrentValueDisabled = disabledIds.includes(parseInt(currentValue));

    // Also check against filtered options
    const availableOptions = filteredOptions.available[collection] || [];
    const isCurrentValueAvailable = availableOptions.includes(currentValue);

    if (isCurrentValueDisabled || !isCurrentValueAvailable) {
      // Find first available option as suggestion
      const firstAvailable = availableOptions.length > 0 ? availableOptions[0] : null;

      invalidSelections.push({
        field,
        collection,
        currentValue,
        suggestedValue: firstAvailable,
        reason: isCurrentValueDisabled ? 'disabled' : 'unavailable'
      });
    }
  }

  // If we have invalid selections, create adjusted config
  if (invalidSelections.length > 0) {
    adjustedConfig = { ...config };

    for (const invalid of invalidSelections) {
      if (invalid.suggestedValue) {
        (adjustedConfig as any)[invalid.field] = invalid.suggestedValue;
      }
    }
  }

  return {
    isValid: invalidSelections.length === 0,
    invalidSelections,
    adjustedConfig
  };
}

/**
 * Check if a specific field selection is valid
 */
export function isFieldSelectionValid(
  field: keyof ProductConfig,
  value: string,
  config: ProductConfig,
  productLine: ProductLine,
  disabledOptionIds: Record<string, number[]>
): boolean {
  const collection = FIELD_TO_COLLECTION_MAP[field];
  if (!collection) return true;

  const disabledIds = disabledOptionIds[collection] || [];
  return !disabledIds.includes(parseInt(value));
}

/**
 * Get the first available option for a collection
 */
export async function getFirstAvailableOption(
  collection: string,
  config: ProductConfig,
  productLine: ProductLine
): Promise<string | null> {
  await initializeFiltering();
  // Build current selection for filtering
  // IMPORTANT: Only include mirror_styles to match the main filtering logic
  const currentSelection: Record<string, any> = {};
  if (config.mirrorStyle) {
    currentSelection.mirror_styles = config.mirrorStyle;
  }

  const filteredOptions = getFilteredOptions(currentSelection, productLine.id);
  const availableOptions = filteredOptions.available[collection] || [];

  return availableOptions.length > 0 ? availableOptions[0] : null;
}

/**
 * Create adjustment suggestions for a configuration
 */
export async function createAdjustmentSuggestions(
  config: ProductConfig,
  productLine: ProductLine,
  disabledOptionIds: Record<string, number[]>
): Promise<Record<keyof ProductConfig, string | null>> {
  await initializeFiltering();
  const suggestions: Partial<Record<keyof ProductConfig, string | null>> = {};

  for (const field of VALIDATABLE_FIELDS) {
    const collection = FIELD_TO_COLLECTION_MAP[field];
    if (!collection) continue;

    const currentValue = config[field];
    if (!currentValue || typeof currentValue !== 'string') continue;

    const disabledIds = disabledOptionIds[collection] || [];
    const isDisabled = disabledIds.includes(parseInt(currentValue));

    if (isDisabled) {
      suggestions[field] = await getFirstAvailableOption(collection, config, productLine);
    }
  }

  return suggestions as Record<keyof ProductConfig, string | null>;
}

/**
 * Prevent adjustment cascades by tracking what's currently being adjusted
 */
let adjustmentInProgress = false;
let adjustmentTimeout: NodeJS.Timeout | null = null;

/**
 * Set adjustment in progress flag with timeout safety
 */
export function setAdjustmentInProgress(inProgress: boolean): void {
  adjustmentInProgress = inProgress;

  // Safety timeout to prevent getting stuck in adjustment state
  if (adjustmentTimeout) {
    clearTimeout(adjustmentTimeout);
  }

  if (inProgress) {
    adjustmentTimeout = setTimeout(() => {
      console.warn('⚠️ Selection adjustment timeout - forcing reset');
      adjustmentInProgress = false;
    }, 2000); // 2 second safety timeout
  }
}

/**
 * Check if adjustment is currently in progress
 */
export function isAdjustmentInProgress(): boolean {
  return adjustmentInProgress;
}

/**
 * Reset adjustment state (for cleanup/testing)
 */
export function resetAdjustmentState(): void {
  adjustmentInProgress = false;
  if (adjustmentTimeout) {
    clearTimeout(adjustmentTimeout);
    adjustmentTimeout = null;
  }
}
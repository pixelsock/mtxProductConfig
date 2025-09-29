/**
 * Centralized Option State Hook - Golden Rule Implementation
 * 
 * This hook provides a unified way to determine the state of any option
 * based purely on API data, eliminating hard-coded UI logic.
 * 
 * GOLDEN RULE: No hard-coded values - all state derived from API data
 */

import { useMemo } from 'react';
import { useAPIState } from '../store';

export interface OptionState {
  isDisabled: boolean;
  isSelected: boolean;
  isAvailable: boolean;
}

export interface OptionStateManager {
  getOptionState: (collection: string, optionId: number) => OptionState;
  getCollectionState: (collection: string) => {
    availableIds: number[];
    disabledIds: number[];
    hasDisabled: boolean;
    totalCount: number;
  };
}

/**
 * Hook that provides centralized option state management
 * All state decisions are driven by API data, never hard-coded
 */
export function useOptionState(currentSelection: Record<string, string>): OptionStateManager {
  const { disabledOptionIds, productOptions } = useAPIState();

  return useMemo(() => {
    // Map collection names to their corresponding disabledOptionIds keys
    const collectionMappings: Record<string, string> = {
      'mirrorControls': 'mirror_controls',
      'frameColors': 'frame_colors',
      'frameThickness': 'frame_thicknesses',
      'mirrorStyles': 'mirror_styles',
      'lightingOptions': 'light_directions',
      'mountingOptions': 'mounting_options',
      'hangingTechniques': 'hanging_techniques',
      'sizes': 'sizes',
      'accessoryOptions': 'accessories',
      'colorTemperatures': 'color_temperatures',
      'lightOutputs': 'light_outputs',
      'drivers': 'drivers'
    };

    // Map current selection fields to their corresponding collection names
    const selectionMappings: Record<string, string> = {
      'mirrorControls': 'mirrorControls',
      'frameColor': 'frameColors',
      'frameThickness': 'frameThickness',
      'mirrorStyle': 'mirrorStyles',
      'lighting': 'lightingOptions',
      'mounting': 'mountingOptions',
      'hangingTechnique': 'hangingTechniques',
      'colorTemperature': 'colorTemperatures',
      'lightOutput': 'lightOutputs',
      'driver': 'drivers'
      // Note: sizes and accessories have special handling
    };

    const getOptionState = (collection: string, optionId: number): OptionState => {
      // Get the disabled option IDs for this collection from API
      const disabledKey = collectionMappings[collection];
      const disabledIds = disabledKey ? disabledOptionIds[disabledKey] || [] : [];

      // Check if a rule set a specific value (which disables all alternatives)
      const ruleSetKey = `${disabledKey}_rule_set`;
      const ruleSetIds = disabledKey ? disabledOptionIds[ruleSetKey] || [] : [];

      // Determine if this option is disabled based on API data
      let isDisabled = false;

      if (ruleSetIds.length > 0) {
        // If a rule set a value, disable everything except that value
        isDisabled = !ruleSetIds.includes(optionId);
      } else {
        // Otherwise check if it's in the direct disabled list
        isDisabled = disabledIds.includes(optionId);
      }
      
      // Determine if this option is currently selected
      let isSelected = false;
      
      // Find the selection field that corresponds to this collection
      const selectionField = Object.entries(selectionMappings).find(
        ([_, collectionName]) => collectionName === collection
      )?.[0];
      
      if (selectionField && currentSelection[selectionField]) {
        isSelected = currentSelection[selectionField] === optionId.toString();
      }
      
      // Special handling for multi-select collections (accessories)
      if (collection === 'accessoryOptions' && currentSelection.accessories) {
        const selectedAccessories = Array.isArray(currentSelection.accessories) 
          ? currentSelection.accessories 
          : [currentSelection.accessories];
        isSelected = selectedAccessories.includes(optionId.toString());
      }
      
      // Special handling for sizes (uses width/height comparison)
      if (collection === 'sizes' && productOptions) {
        const sizeOption = productOptions.sizes.find(s => s.id === optionId);
        if (sizeOption && currentSelection.width && currentSelection.height) {
          isSelected = sizeOption.width?.toString() === currentSelection.width && 
                      sizeOption.height?.toString() === currentSelection.height;
        }
      }
      
      return {
        isDisabled,
        isSelected,
        isAvailable: !isDisabled
      };
    };

    const getCollectionState = (collection: string) => {
      const disabledKey = collectionMappings[collection];
      const disabledIds = disabledKey ? disabledOptionIds[disabledKey] || [] : [];

      // Check if a rule set a specific value
      const ruleSetKey = `${disabledKey}_rule_set`;
      const ruleSetIds = disabledKey ? disabledOptionIds[ruleSetKey] || [] : [];

      // Get total count from productOptions
      let totalCount = 0;
      if (productOptions && productOptions[collection as keyof typeof productOptions]) {
        const options = productOptions[collection as keyof typeof productOptions] as any[];
        totalCount = options.length;
      }

      // Get all option IDs for this collection
      const allIds: number[] = [];
      if (productOptions && productOptions[collection as keyof typeof productOptions]) {
        const options = productOptions[collection as keyof typeof productOptions] as any[];
        allIds.push(...options.map(option => option.id));
      }

      // Calculate available IDs based on rule-set or disabled list
      let availableIds: number[];
      if (ruleSetIds.length > 0) {
        // If rule set a value, only that value is available
        availableIds = ruleSetIds;
      } else {
        // Otherwise exclude disabled IDs
        availableIds = allIds.filter(id => !disabledIds.includes(id));
      }

      return {
        availableIds,
        disabledIds,
        hasDisabled: availableIds.length < totalCount,
        totalCount
      };
    };

    return {
      getOptionState,
      getCollectionState
    };
  }, [disabledOptionIds, currentSelection, productOptions]);
}

/**
 * Convenience hook for getting option state for a specific collection
 */
export function useCollectionOptionState(
  collection: string, 
  currentSelection: Record<string, string>
) {
  const optionManager = useOptionState(currentSelection);
  
  return useMemo(() => {
    const collectionState = optionManager.getCollectionState(collection);
    
    return {
      ...collectionState,
      getOptionState: (optionId: number) => optionManager.getOptionState(collection, optionId)
    };
  }, [optionManager, collection]);
}
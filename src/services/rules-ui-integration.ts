/**
 * Rules UI Integration Service
 *
 * This service applies rules to the UI state to disable alternatives
 * without affecting the core filtering logic.
 *
 * According to WARP.md:
 * - Rules do not filter/hide options from the UI
 * - Rules set values and disable alternatives
 * - Rules make other options in the same table visible but disabled
 */

import { evaluateRuleConditions } from "./rules-engine";
import { getRules } from "./supabase";

export interface RuleDisabledOptions {
  [collection: string]: number[];
}

export interface RuleApplicationResult {
  disabledOptions: RuleDisabledOptions;
  setValues: Record<string, number>; // Values that rules want to set
}

/**
 * Apply rules to get disabled options AND values to set for UI
 * Rules with _eq both SET values and disable alternatives
 */
export async function applyRulesToGetDisabledOptions(
  currentConfig: Record<string, any>,
  productLineId: number,
): Promise<RuleDisabledOptions> {
  const result = await applyRulesComplete(currentConfig, productLineId);
  return result.disabledOptions;
}

/**
 * Complete rule application - gets both disabled options and values to set
 */
export async function applyRulesComplete(
  currentConfig: Record<string, any>,
  productLineId: number,
): Promise<RuleApplicationResult> {
  try {
    const rules = await getRules();
    const disabledOptions: RuleDisabledOptions = {};
    const setValues: Record<string, number> = {}; // Track values that rules want to set

    // Build rule evaluation context
    const ruleContext = {
      product_line: productLineId,
      mirror_style: currentConfig.mirrorStyle
        ? parseInt(currentConfig.mirrorStyle)
        : undefined,
      light_direction: currentConfig.lighting
        ? parseInt(currentConfig.lighting)
        : undefined,
      frame_thickness: currentConfig.frameThickness
        ? parseInt(currentConfig.frameThickness)
        : undefined,
      mounting: currentConfig.mounting
        ? parseInt(currentConfig.mounting)
        : undefined,
      hanging_techniques: currentConfig.hangingTechnique
        ? parseInt(currentConfig.hangingTechnique)
        : undefined,
      driver: currentConfig.driver ? parseInt(currentConfig.driver) : undefined,
      frame_color: currentConfig.frameColor
        ? parseInt(currentConfig.frameColor)
        : undefined,
      color_temperature: currentConfig.colorTemperature
        ? parseInt(currentConfig.colorTemperature)
        : undefined,
      light_output: currentConfig.lightOutput
        ? parseInt(currentConfig.lightOutput)
        : undefined,
      accessories: Array.isArray(currentConfig.accessories)
        ? currentConfig.accessories.map((a: any) => parseInt(a))
        : undefined,
    };

    if (import.meta.env.DEV) {
      console.log("⚙️ Evaluating rules for UI disabled options:", ruleContext);
      console.log(`⚙️ Found ${rules.length} rules to evaluate`);
    }

    // Process rules to find which options should be disabled
    for (const rule of rules) {
      if (import.meta.env.DEV) {
        console.log(`⚙️ Checking rule: "${rule.name}"`);
        console.log(`  Conditions:`, rule.if_this);
      }

      if (evaluateRuleConditions(rule, ruleContext)) {
        if (import.meta.env.DEV) {
          console.log(
            `✅ Rule "${rule.name}" MATCHED - extracting disabled options`,
          );
          console.log(`  Actions:`, rule.then_that);
        }

        const actions = rule.then_that;
        if (actions && typeof actions === "object") {
          // Extract both disabled options and set values from rule actions
          extractRuleActionsResults(actions, disabledOptions, setValues);
        }
      } else {
        if (import.meta.env.DEV) {
          console.log(`❌ Rule "${rule.name}" did not match`);
        }
      }
    }

    if (import.meta.env.DEV) {
      if (Object.keys(disabledOptions).length > 0) {
        console.log("⚙️ Rules disabled options:", disabledOptions);
      }
      if (Object.keys(setValues).length > 0) {
        console.log("⚙️ Rules set values:", setValues);
      }
    }

    return { disabledOptions, setValues };
  } catch (error) {
    console.error("Failed to apply rules for disabled options:", error);
    return { disabledOptions: {}, setValues: {} };
  }
}

/**
 * Extract both disabled options and set values from rule actions
 * When a rule sets a value (_eq), it both SETS that value and disables alternatives
 */
function extractRuleActionsResults(
  actions: any,
  disabledOptions: RuleDisabledOptions,
  setValues: Record<string, number>,
  path: string[] = [],
): void {
  if (!actions || typeof actions !== "object") return;

  // Handle _and arrays
  if (actions._and && Array.isArray(actions._and)) {
    for (const item of actions._and) {
      extractRuleActionsResults(item, disabledOptions, setValues, path);
    }
    return;
  }

  // Handle _or arrays (less common in rules)
  if (actions._or && Array.isArray(actions._or)) {
    for (const item of actions._or) {
      extractRuleActionsResults(item, disabledOptions, setValues, path);
    }
    return;
  }

  // Handle field assignments
  for (const [key, value] of Object.entries(actions)) {
    if (key.startsWith("_")) continue; // Skip operators

    if (value && typeof value === "object") {
      // Handle both _eq (sets value) and _neq (excludes value) operators
      const collectionMapping: Record<string, string> = {
        mirror_style: "mirror_styles",
        light_direction: "light_directions",
        frame_thickness: "frame_thicknesses",
        mounting_option: "mounting_options", // Note: mounting_option in rules maps to mounting_options
        mounting: "mounting_options",
        frame_color: "frame_colors",
        color_temperature: "color_temperatures",
        light_output: "light_outputs",
        driver: "drivers",
        accessory: "accessories",
      };

      const collection = collectionMapping[key];
      if (collection) {
        if ((value as any)._eq !== undefined) {
          // Rule sets a specific value - both SET the value AND disable alternatives
          const setValue = (value as any)._eq;

          if (import.meta.env.DEV) {
            console.log(
              `⚙️ Rule sets ${key} = ${setValue}, will set value and disable alternatives in ${collection}`,
            );
          }

          // Store the value that should be SET
          const configFieldMapping: Record<string, string> = {
            mirror_style: "mirrorStyle",
            light_direction: "lighting",
            frame_thickness: "frameThickness",
            mounting_option: "mounting",
            mounting: "mounting",
            hanging_techniques: "hangingTechnique",
            frame_color: "frameColor",
            color_temperature: "colorTemperature",
            light_output: "lightOutput",
            driver: "driver",
          };

          const configField = configFieldMapping[key];
          if (configField) {
            setValues[configField] = setValue;
          }

          if (!disabledOptions[collection]) {
            disabledOptions[collection] = [];
          }

          // Store the rule-set value so we can disable alternatives
          disabledOptions[`${collection}_rule_set`] = [setValue];
        } else if ((value as any)._neq !== undefined) {
          // Rule excludes a specific value - disable just that value
          const excludeValue = (value as any)._neq;

          if (import.meta.env.DEV) {
            console.log(
              `⚙️ Rule excludes ${key} = ${excludeValue}, will disable this option in ${collection}`,
            );
          }

          if (!disabledOptions[collection]) {
            disabledOptions[collection] = [];
          }

          // Add the excluded value to direct disabled list
          disabledOptions[collection].push(excludeValue);
        } else if ((value as any)._nin !== undefined) {
          // Rule excludes multiple values - disable all values in the array
          const excludeValues = (value as any)._nin;

          if (import.meta.env.DEV) {
            console.log(
              `⚙️ Rule excludes ${key} NOT IN [${excludeValues.join(", ")}], will disable these options in ${collection}`,
            );
          }

          if (!disabledOptions[collection]) {
            disabledOptions[collection] = [];
          }

          // Add all excluded values to direct disabled list
          if (Array.isArray(excludeValues)) {
            disabledOptions[collection].push(...excludeValues);
          }
        }
      }
    } else if (value && typeof value === "object") {
      // Recurse into nested objects
      extractRuleActionsResults(value, disabledOptions, setValues, [
        ...path,
        key,
      ]);
    }
  }
}

/**
 * Check if a specific option should be disabled by rules
 */
export function isOptionDisabledByRules(
  collection: string,
  optionId: number,
  ruleDisabledOptions: RuleDisabledOptions,
): boolean {
  // Check if this collection has a rule-set value
  const ruleSetKey = `${collection}_rule_set`;
  if (ruleDisabledOptions[ruleSetKey]) {
    const setValue = ruleDisabledOptions[ruleSetKey][0];
    return optionId !== setValue; // Disable everything except the set value
  }

  // Check direct disabled list
  return (ruleDisabledOptions[collection] || []).includes(optionId);
}

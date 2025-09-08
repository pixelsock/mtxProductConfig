/**
 * Rules Engine Analysis Script for Story 0.1
 */

import { processRules, evaluateRuleConditions, getSKUOverride, buildRuleConstraints } from '../services/rules-engine';

// Mock rules data for testing
const mockRules = [
  {
    id: 1,
    name: 'Wide Frame Deco Rule',
    priority: 1,
    if_this: {
      product_line: { _eq: 1 },
      frame_thickness: { _eq: 1 }
    },
    than_that: {
      product_line: {
        sku_code: { _eq: 'DECO-W' }
      }
    }
  }
];

export async function runRulesAnalysis() {
  console.log('🔍 Starting Rules Engine Analysis for Story 0.1');
  
  const config = {
    product_line: 1,
    frame_thickness: 1,
    mirror_style: 1,
    light_direction: 1,
    mirror_control: 1,
    frame_color: 1,
    mounting: 1,
    driver: 1,
    light_output: 1,
    color_temperature: 1,
    accessories: []
  };

  console.log('Testing rule evaluation...');
  for (const rule of mockRules) {
    const matches = evaluateRuleConditions(rule, config);
    console.log(`Rule "${rule.name}": ${matches ? 'MATCHES' : 'NO MATCH'}`);
  }

  console.log('✅ Rules Engine Analysis Complete');
}

if (typeof window !== 'undefined') {
  (window as any).runRulesAnalysis = runRulesAnalysis;
}
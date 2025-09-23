/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyRulesComplete, isOptionDisabledByRules } from '../../services/rules-ui-integration';

// Mock the supabase module
vi.mock('../../services/supabase', () => ({
  getRules: vi.fn(),
}));

// Mock the rules engine
vi.mock('../../services/rules-engine', () => ({
  evaluateRuleConditions: vi.fn(),
}));

import { getRules } from '../../services/supabase';
import { evaluateRuleConditions } from '../../services/rules-engine';

describe('Rule Operators Integration', () => {
  const mockGetRules = getRules as any;
  const mockEvaluateRuleConditions = evaluateRuleConditions as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('_neq operator (not equal - exclude single value)', () => {
    it('should disable specific option when _neq rule matches', async () => {
      // Mock the "adjustable color temp" rule from Supabase
      // driver NOT IN [5,4,2] → color_temperature ≠ 6 (disable Adjustable)
      const mockRules = [
        {
          id: 'test-neq-rule',
          name: 'adjustable color temp',
          priority: null,
          if_this: { driver: { _nin: [5, 4, 2] } },
          then_that: { color_temperature: { _neq: 6 } }
        }
      ];

      mockGetRules.mockResolvedValue(mockRules);
      mockEvaluateRuleConditions.mockReturnValue(true); // Rule matches

      const config = {
        driver: '1', // Driver 1 is NOT in [5,4,2], so rule should match
        colorTemperature: '',
        mirrorStyle: '',
        lighting: ''
      };

      const result = await applyRulesComplete(config, 1);

      // Should disable color_temperature option 6 (Adjustable)
      expect(result.disabledOptions.color_temperatures).toContain(6);

      // Should NOT set any values (this is exclusion only)
      expect(Object.keys(result.setValues)).toHaveLength(0);
    });

    it('should not affect options when _neq rule does not match', async () => {
      const mockRules = [
        {
          id: 'test-neq-rule',
          name: 'adjustable color temp',
          priority: null,
          if_this: { driver: { _nin: [5, 4, 2] } },
          then_that: { color_temperature: { _neq: 6 } }
        }
      ];

      mockGetRules.mockResolvedValue(mockRules);
      mockEvaluateRuleConditions.mockReturnValue(false); // Rule does NOT match

      const config = {
        driver: '4', // Driver 4 IS in [5,4,2], so rule should not match
        colorTemperature: '',
        mirrorStyle: '',
        lighting: ''
      };

      const result = await applyRulesComplete(config, 1);

      // Should NOT disable any color temperature options
      expect(result.disabledOptions.color_temperatures || []).toHaveLength(0);
      expect(Object.keys(result.setValues)).toHaveLength(0);
    });
  });

  describe('_nin operator (not in array - exclude multiple values)', () => {
    it('should disable multiple options when _nin rule matches', async () => {
      // Test rule: if specific condition → exclude multiple drivers
      const mockRules = [
        {
          id: 'test-nin-rule',
          name: 'exclude multiple drivers',
          priority: null,
          if_this: { mirror_style: { _eq: 12 } }, // Circle mirror
          then_that: { driver: { _nin: [1, 3, 5] } } // Exclude multiple drivers
        }
      ];

      mockGetRules.mockResolvedValue(mockRules);
      mockEvaluateRuleConditions.mockReturnValue(true); // Rule matches

      const config = {
        mirrorStyle: '12', // Circle mirror style
        driver: '',
        colorTemperature: '',
        lighting: ''
      };

      const result = await applyRulesComplete(config, 1);

      // Should disable drivers 1, 3, and 5
      expect(result.disabledOptions.drivers).toContain(1);
      expect(result.disabledOptions.drivers).toContain(3);
      expect(result.disabledOptions.drivers).toContain(5);
      expect(result.disabledOptions.drivers).toHaveLength(3);

      // Should NOT set any values (this is exclusion only)
      expect(Object.keys(result.setValues)).toHaveLength(0);
    });

    it('should not affect options when _nin rule does not match', async () => {
      const mockRules = [
        {
          id: 'test-nin-rule',
          name: 'exclude multiple drivers',
          priority: null,
          if_this: { mirror_style: { _eq: 12 } },
          then_that: { driver: { _nin: [1, 3, 5] } }
        }
      ];

      mockGetRules.mockResolvedValue(mockRules);
      mockEvaluateRuleConditions.mockReturnValue(false); // Rule does NOT match

      const config = {
        mirrorStyle: '10', // Different mirror style
        driver: '',
        colorTemperature: '',
        lighting: ''
      };

      const result = await applyRulesComplete(config, 1);

      // Should NOT disable any driver options
      expect(result.disabledOptions.drivers || []).toHaveLength(0);
      expect(Object.keys(result.setValues)).toHaveLength(0);
    });
  });

  describe('Complex rule scenarios', () => {
    it('should handle multiple rules with different operators', async () => {
      const mockRules = [
        {
          id: 'rule-eq',
          name: 'force driver',
          priority: 1,
          if_this: { mirror_style: { _eq: 5 } },
          then_that: { driver: { _eq: 4 } } // SET driver 4 (disable alternatives)
        },
        {
          id: 'rule-neq',
          name: 'exclude color temp',
          priority: 2,
          if_this: { driver: { _eq: 4 } },
          then_that: { color_temperature: { _neq: 6 } } // EXCLUDE color temp 6
        }
      ];

      mockGetRules.mockResolvedValue(mockRules);
      // Both rules match
      mockEvaluateRuleConditions.mockReturnValueOnce(true).mockReturnValueOnce(true);

      const config = {
        mirrorStyle: '5',
        driver: '4',
        colorTemperature: '',
        lighting: ''
      };

      const result = await applyRulesComplete(config, 1);

      // First rule: SET driver 4 (disable alternatives via rule_set mechanism)
      expect(result.setValues.driver).toBe(4);
      expect(result.disabledOptions.drivers_rule_set).toContain(4);

      // Second rule: EXCLUDE color temperature 6
      expect(result.disabledOptions.color_temperatures).toContain(6);
    });

    it('should handle rule priority with negative operators', async () => {
      const mockRules = [
        {
          id: 'high-priority',
          name: 'high priority exclusion',
          priority: 1,
          if_this: { driver: { _eq: 4 } },
          then_that: { color_temperature: { _nin: [1, 2, 3] } } // Exclude 1,2,3
        },
        {
          id: 'low-priority',
          name: 'low priority exclusion',
          priority: 2,
          if_this: { driver: { _eq: 4 } },
          then_that: { color_temperature: { _neq: 6 } } // Also exclude 6
        }
      ];

      mockGetRules.mockResolvedValue(mockRules);
      mockEvaluateRuleConditions.mockReturnValue(true); // Both rules match

      const config = {
        driver: '4',
        colorTemperature: '',
        mirrorStyle: '',
        lighting: ''
      };

      const result = await applyRulesComplete(config, 1);

      // Should exclude values from both rules
      expect(result.disabledOptions.color_temperatures).toContain(1);
      expect(result.disabledOptions.color_temperatures).toContain(2);
      expect(result.disabledOptions.color_temperatures).toContain(3);
      expect(result.disabledOptions.color_temperatures).toContain(6);
      expect(result.disabledOptions.color_temperatures).toHaveLength(4);
    });
  });

  describe('isOptionDisabledByRules helper function', () => {
    it('should correctly identify disabled options from _neq rules', () => {
      const ruleDisabledOptions = {
        color_temperatures: [6] // Disabled by _neq rule
      };

      // Option 6 should be disabled
      expect(isOptionDisabledByRules('color_temperatures', 6, ruleDisabledOptions)).toBe(true);

      // Other options should not be disabled
      expect(isOptionDisabledByRules('color_temperatures', 1, ruleDisabledOptions)).toBe(false);
      expect(isOptionDisabledByRules('color_temperatures', 2, ruleDisabledOptions)).toBe(false);
    });

    it('should correctly identify disabled options from _nin rules', () => {
      const ruleDisabledOptions = {
        drivers: [1, 3, 5] // Disabled by _nin rule
      };

      // Excluded options should be disabled
      expect(isOptionDisabledByRules('drivers', 1, ruleDisabledOptions)).toBe(true);
      expect(isOptionDisabledByRules('drivers', 3, ruleDisabledOptions)).toBe(true);
      expect(isOptionDisabledByRules('drivers', 5, ruleDisabledOptions)).toBe(true);

      // Non-excluded options should not be disabled
      expect(isOptionDisabledByRules('drivers', 2, ruleDisabledOptions)).toBe(false);
      expect(isOptionDisabledByRules('drivers', 4, ruleDisabledOptions)).toBe(false);
    });

    it('should handle combination of _eq rule_set and _neq exclusions', () => {
      const ruleDisabledOptions = {
        drivers_rule_set: [4], // Driver 4 was SET by rule (disable alternatives)
        color_temperatures: [6] // Color temp 6 excluded by _neq rule
      };

      // For collection with rule_set, only the set value should be enabled
      expect(isOptionDisabledByRules('drivers', 4, ruleDisabledOptions)).toBe(false); // Set value enabled
      expect(isOptionDisabledByRules('drivers', 1, ruleDisabledOptions)).toBe(true);  // Alternative disabled
      expect(isOptionDisabledByRules('drivers', 2, ruleDisabledOptions)).toBe(true);  // Alternative disabled

      // For collection with direct exclusions, excluded values disabled
      expect(isOptionDisabledByRules('color_temperatures', 6, ruleDisabledOptions)).toBe(true);  // Excluded
      expect(isOptionDisabledByRules('color_temperatures', 1, ruleDisabledOptions)).toBe(false); // Not excluded
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty rules gracefully', async () => {
      mockGetRules.mockResolvedValue([]);

      const config = {
        driver: '1',
        colorTemperature: '',
        mirrorStyle: '',
        lighting: ''
      };

      const result = await applyRulesComplete(config, 1);

      expect(result.disabledOptions).toEqual({});
      expect(result.setValues).toEqual({});
    });

    it('should handle rules with no matching conditions', async () => {
      const mockRules = [
        {
          id: 'no-match',
          name: 'rule that will not match',
          priority: null,
          if_this: { mirror_style: { _eq: 999 } }, // Non-existent mirror style
          then_that: { driver: { _neq: 1 } }
        }
      ];

      mockGetRules.mockResolvedValue(mockRules);
      mockEvaluateRuleConditions.mockReturnValue(false); // Rule does not match

      const config = {
        mirrorStyle: '5',
        driver: '',
        colorTemperature: '',
        lighting: ''
      };

      const result = await applyRulesComplete(config, 1);

      expect(result.disabledOptions).toEqual({});
      expect(result.setValues).toEqual({});
    });
  });
});

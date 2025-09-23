/**
 * @vitest-environment jsdom
 * Test actual Supabase rules to verify the color temperature issue is fixed
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyRulesComplete } from "../../services/rules-ui-integration";

// Mock the supabase module
vi.mock("../../services/supabase", () => ({
  getRules: vi.fn(),
}));

// Mock the rules engine
vi.mock("../../services/rules-engine", () => ({
  evaluateRuleConditions: vi.fn(),
}));

import { getRules } from "../../services/supabase";
import { evaluateRuleConditions } from "../../services/rules-engine";

describe("Real Supabase Rules - Color Temperature Issue", () => {
  const mockGetRules = getRules as any;
  const mockEvaluateRuleConditions = evaluateRuleConditions as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should properly handle the "adjustable color temp" rule from Supabase', async () => {
    // This is the actual rule from Supabase that was causing issues
    const realSupabaseRules = [
      {
        id: "d2a9bc1e-a6df-40a6-9799-94e48215ff4b",
        name: "adjustable color temp",
        priority: null,
        if_this: { driver: { _nin: [5, 4, 2] } },
        then_that: { color_temperature: { _neq: 6 } },
      },
    ];

    mockGetRules.mockResolvedValue(realSupabaseRules);

    // Test case 1: Driver 1 (NOT IN [5,4,2]) should disable Adjustable color temp (id=6)
    mockEvaluateRuleConditions.mockReturnValueOnce(true); // Rule matches

    const configWithDriver1 = {
      driver: "1", // Driver 1 is NOT in [5,4,2]
      colorTemperature: "",
      mirrorStyle: "",
      lighting: "",
    };

    const result1 = await applyRulesComplete(configWithDriver1, 1);

    // Should disable color temperature option 6 (Adjustable 2700k-6500k)
    expect(result1.disabledOptions.color_temperatures).toContain(6);
    expect(result1.disabledOptions.color_temperatures).toHaveLength(1);

    // Should NOT set any values (this is exclusion only)
    expect(Object.keys(result1.setValues)).toHaveLength(0);

    // Test case 2: Driver 4 (IS IN [5,4,2]) should NOT disable Adjustable color temp
    mockEvaluateRuleConditions.mockReturnValueOnce(false); // Rule does NOT match

    const configWithDriver4 = {
      driver: "4", // Driver 4 IS in [5,4,2]
      colorTemperature: "",
      mirrorStyle: "",
      lighting: "",
    };

    const result2 = await applyRulesComplete(configWithDriver4, 1);

    // Should NOT disable any color temperature options
    expect(result2.disabledOptions.color_temperatures || []).toHaveLength(0);
    expect(Object.keys(result2.setValues)).toHaveLength(0);
  });

  it('should handle the "Adjustable For CCT" rule that forces Adjustable', async () => {
    // This rule forces the Adjustable color temperature when driver=4
    const realSupabaseRules = [
      {
        id: "aa106735-10a2-466b-a548-1aee4434a276",
        name: "Adjustable For CCT",
        priority: null,
        if_this: { driver: { _eq: 4 } },
        then_that: { color_temperature: { _eq: 6 } },
      },
    ];

    mockGetRules.mockResolvedValue(realSupabaseRules);
    mockEvaluateRuleConditions.mockReturnValue(true); // Rule matches

    const configWithDriver4 = {
      driver: "4",
      colorTemperature: "",
      mirrorStyle: "",
      lighting: "",
    };

    const result = await applyRulesComplete(configWithDriver4, 1);

    // Should SET color temperature to 6 and disable alternatives
    expect(result.setValues.colorTemperature).toBe(6);
    expect(result.disabledOptions.color_temperatures_rule_set).toContain(6);
  });

  it("should handle cascading rules: Adjustable Color Means High", async () => {
    // This rule sets light_output=2 when color_temperature=6
    const realSupabaseRules = [
      {
        id: "b52ae20c-9f94-4a3c-873f-627db91fc3ac",
        name: "Adjustable Color Means High",
        priority: null,
        if_this: { color_temperature: { _eq: 6 } },
        then_that: { light_output: { _eq: 2 } },
      },
    ];

    mockGetRules.mockResolvedValue(realSupabaseRules);
    mockEvaluateRuleConditions.mockReturnValue(true); // Rule matches

    const configWithAdjustableColor = {
      colorTemperature: "6", // Adjustable color temperature selected
      driver: "",
      mirrorStyle: "",
      lighting: "",
    };

    const result = await applyRulesComplete(configWithAdjustableColor, 1);

    // Should SET light output to 2 (High)
    expect(result.setValues.lightOutput).toBe(2);
    expect(result.disabledOptions.light_outputs_rule_set).toContain(2);
  });

  it("should handle the complete color temperature rule chain", async () => {
    // Test the full chain of rules that work together
    const realSupabaseRules = [
      {
        id: "aa106735-10a2-466b-a548-1aee4434a276",
        name: "Adjustable For CCT",
        priority: null,
        if_this: { driver: { _eq: 4 } },
        then_that: { color_temperature: { _eq: 6 } },
      },
      {
        id: "d2a9bc1e-a6df-40a6-9799-94e48215ff4b",
        name: "adjustable color temp",
        priority: null,
        if_this: { driver: { _nin: [5, 4, 2] } },
        then_that: { color_temperature: { _neq: 6 } },
      },
      {
        id: "b52ae20c-9f94-4a3c-873f-627db91fc3ac",
        name: "Adjustable Color Means High",
        priority: null,
        if_this: { color_temperature: { _eq: 6 } },
        then_that: { light_output: { _eq: 2 } },
      },
    ];

    mockGetRules.mockResolvedValue(realSupabaseRules);

    // Test scenario: Driver 1 selected (should exclude Adjustable)
    mockEvaluateRuleConditions
      .mockReturnValueOnce(false) // "Adjustable For CCT" doesn't match (driver != 4)
      .mockReturnValueOnce(true) // "adjustable color temp" matches (driver not in [5,4,2])
      .mockReturnValueOnce(false); // "Adjustable Color Means High" doesn't match

    const configWithDriver1 = {
      driver: "1",
      colorTemperature: "",
      mirrorStyle: "",
      lighting: "",
    };

    const result = await applyRulesComplete(configWithDriver1, 1);

    // The "adjustable color temp" rule should disable option 6
    expect(result.disabledOptions.color_temperatures).toContain(6);

    // No values should be set (only exclusion rules matched)
    expect(Object.keys(result.setValues)).toHaveLength(0);
  });
});

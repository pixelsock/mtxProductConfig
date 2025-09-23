# Spec Requirements Document

> Spec: Recompute Filtering After Rules
> Created: 2025-09-23

## Overview

Fix the filtering logic to recompute available/disabled options after rules have been applied, ensuring the UI shows correct availability based on the post-rule configuration state.

## User Stories

### Configuration Initialization Shows Wrong Availability

As a user initializing the configurator, I want to see accurate option availability that reflects rule-enforced selections, so that I don't see incorrect disabled states immediately after page load.

When rules fire during initialization (e.g., setting light_direction based on product defaults), the filtering system should recalculate which options are available based on the new rule-enforced selections, not the original empty configuration.

### Rules Enforcement Updates Availability  

As a user making selections that trigger rules, I want the option availability to update immediately to reflect the new configuration state, so that I see accurate filtering based on rule-set values.

When a rule sets a value (e.g., selecting an accessory that forces a specific light_output), the dynamic filtering should recompute using the updated configuration to show which combinations are actually available.

## Spec Scope

1. **Post-Rule Filtering Pass** - Add a second filtering calculation after rules have been applied using the effective configuration
2. **Store Update Coordination** - Ensure filtering results reflect the post-rule state before updating the store
3. **UI Synchronization** - Maintain consistency between rule-enforced selections and availability indicators

## Out of Scope

- Changes to the core rule processing logic
- Modifications to the existing two-level filtering approach
- Performance optimizations beyond the immediate fix

## Expected Deliverable

1. Configuration initialization shows correct option availability after rules have set default values
2. Rule-triggered updates immediately reflect accurate filtering based on the new configuration state
3. No regression in existing filtering behavior for user-driven selections
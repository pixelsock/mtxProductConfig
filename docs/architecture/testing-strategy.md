# Testing Strategy

## Integration with Existing Tests

**Existing Test Framework:** Browser console validation using `src/test/` utilities, script-based validation in `scripts/` directory (validate-configuration-ui.js, rules-phase2-validate.ts)

**Test Organization:** Development-focused validation with practical console tests, Directus schema validation scripts, data consistency checking functions

**Coverage Requirements:** Comprehensive validation of data integrity, API connectivity, and configuration consistency - maintaining existing standards while adding CMS-dependency verification

## New Testing Requirements

### Unit Tests for New Components

**Framework:** Browser console tests extending existing `src/test/` patterns
**Location:** `src/test/option-registry.ts`, `src/test/generic-options.ts`  
**Coverage Target:** 100% validation of OptionRegistry metadata loading, getOptions() function behavior, and configuration_ui parsing
**Integration with Existing:** Built on current `testConnection()`, `checkDataConsistency()` validation patterns

### Integration Tests

**Scope:** End-to-end validation of CMS-driven configuration flow from Directus to UI rendering
**Existing System Verification:** **CRITICAL** - Validate that NO hard-coded data paths remain active, all data flows through OptionRegistry
**New Feature Testing:** Dynamic UI rendering from metadata, generic option fetching, rules engine with canonical addressing

### Legacy Function Elimination Testing

**MISSION CRITICAL TESTING:**
- **Hard-coded Function Detection:** Automated script to scan codebase for eliminated functions (getActiveFrameColors, etc.)
- **Fallback Path Prevention:** Tests to ensure no code paths bypass OptionRegistry
- **CMS Dependency Verification:** Validate that breaking Directus connection completely disables configurator (no fallback data)
- **Administrative Control Testing:** Verify that all UI changes, option availability, and business rules can be controlled 100% from Directus

### Regression Testing

**Existing Feature Verification:** All current configurator functionality works identically through new CMS-driven architecture
**Automated Regression Suite:** Extension of existing validation scripts to verify CMS-controlled behavior matches previous hard-coded behavior  
**Manual Testing Requirements:** Admin workflow testing - verify Directus changes immediately affect configurator behavior

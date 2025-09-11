# Tasks: Troubleshoot Product Options Visibility

**Input**: Design documents from `/Users/nick/Sites/mtxProductConfig/specs/001-we-need-to/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → LOADED: Troubleshooting approach for React configurator with Directus API
   → Extracted: TypeScript/React 18, Directus SDK, debugging methodology
2. Load optional design documents:
   → data-model.md: ProductLine entities with default_options relationships
   → contracts/: Directus API endpoints with curl validation commands
   → research.md: Data flow analysis and component debugging approach
3. Generate tasks by category:
   → Setup: Environment validation, development server
   → Tests: API validation with curl, component behavior verification
   → Investigation: Service layer debugging, React state analysis
   → Implementation: Bug fixes and data flow corrections
   → Validation: End-to-end testing and regression checks
4. Apply debugging task rules:
   → API tests = mark [P] for parallel curl execution
   → Component investigation = sequential (requires understanding from previous tasks)
   → Implementation = sequential (depends on root cause identification)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph for debugging workflow
7. Create parallel execution examples for API validation
8. Validate task completeness for troubleshooting scope
9. Return: SUCCESS (debugging tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (independent API tests, different investigation areas)
- Include exact file paths and curl commands in descriptions

## Path Conventions
- **Single project**: `src/`, existing React configurator at repository root
- **Key files**: `src/services/directus.ts`, `src/components/ui/dynamic-options.tsx`, `src/App.tsx`
- **API endpoint**: `https://pim.dude.digital/items/`

## Phase 3.1: Setup & Environment Validation
- [ ] T001 Verify development environment and dependencies (`npm run dev`, environment variables)
- [ ] T002 Confirm Directus API connectivity and basic authentication
- [ ] T003 [P] Run lint check to ensure codebase is clean (`npm run lint`)

## Phase 3.2: API Validation (TDD Approach) ⚠️ MUST COMPLETE BEFORE COMPONENT INVESTIGATION
**CRITICAL: These API tests MUST pass before proceeding to frontend debugging**
- [ ] T004 [P] Validate product_lines endpoint with curl: `curl -X GET "https://pim.dude.digital/items/product_lines" -H "Content-Type: application/json" -G -d "filter[active][_eq]=true" -d "fields=*,default_options.*"`
- [ ] T005 [P] Validate Polished product line specifically: `curl -X GET "https://pim.dude.digital/items/product_lines" -G -d "filter[sku_code][_eq]=P" -d "fields=*,default_options.*"`
- [ ] T006 [P] Validate accessories collection: `curl -X GET "https://pim.dude.digital/items/accessories" -G -d "filter[active][_eq]=true"`
- [ ] T007 [P] Validate code_order collection: `curl -X GET "https://pim.dude.digital/items/code_order" -G -d "filter[active][_eq]=true" -d "sort=order"`
- [ ] T008 [P] Validate configuration_ui collection: `curl -X GET "https://pim.dude.digital/items/configuration_ui" -G -d "filter[active][_eq]=true" -d "sort=display_order"`

## Phase 3.3: Service Layer Investigation (ONLY after API validation passes)
- [ ] T009 Debug `src/services/directus.ts` - add console logging to `getFilteredOptionsForProductLine` function to trace default_options processing
- [ ] T010 Investigate `getProductLines()` function in `src/services/directus.ts` - verify default_options are being fetched and processed correctly
- [ ] T011 Debug `dynamicSets` processing in service layer - ensure default_options are converted to proper option collections
- [ ] T012 Add temporary logging to service calls to trace data transformation from API response to frontend state

## Phase 3.4: Component State Analysis
- [ ] T013 Debug React state in `src/App.tsx` - add console logging when product line selection changes to verify default_options reach component state
- [ ] T014 Investigate `src/components/ui/dynamic-options.tsx` - determine if this component properly receives and displays default_options data
- [ ] T015 Compare data flow between working "option sets" display and broken "current configurator section" - identify divergence point
- [ ] T016 Debug ProductConfig state object - verify default_options are properly stored and accessible to all components

## Phase 3.5: UI Component Investigation
- [ ] T017 Locate and examine "current configurator section" component - identify which component should display default_options but isn't
- [ ] T018 Compare props and data between working option sets component and broken current configurator component
- [ ] T019 Debug React component hierarchy to trace where default_options data is lost between parent and child components
- [ ] T020 Investigate code_order and configuration_ui collection usage in UI rendering logic

## Phase 3.6: Root Cause Identification & Fix Implementation
- [ ] T021 Identify specific code location where default_options data is not being passed to current configurator section
- [ ] T022 Implement fix to ensure default_options data flows to current configurator section components
- [ ] T023 Verify accessories display correctly for all product lines after fix
- [ ] T024 Ensure Polished product line shows complete default_options after fix

## Phase 3.7: Testing & Validation
- [ ] T025 Test configurator with Polished product line - verify all default_options appear in current configurator section
- [ ] T026 Test accessories display across multiple product lines - ensure universal availability
- [ ] T027 Verify option display order follows configuration_ui collection settings
- [ ] T028 Regression test - ensure existing functionality (option sets, quote generation) still works correctly
- [ ] T029 Cross-browser testing - verify fix works in Chrome, Firefox, Safari
- [ ] T030 Performance validation - ensure fix doesn't impact page load times or API response times

## Dependencies
- Setup (T001-T003) before API validation (T004-T008)
- API validation (T004-T008) before service investigation (T009-T012)
- Service investigation (T009-T012) before component analysis (T013-T016)
- Component analysis (T013-T016) before UI investigation (T017-T020)
- Root cause identification (T021) before fix implementation (T022-T024)
- Implementation (T022-T024) before validation (T025-T030)

## Parallel Example
```
# Launch T004-T008 together for API validation:
Task: "Validate product_lines endpoint with curl command including default_options fields"
Task: "Validate Polished product line with specific sku_code filter"
Task: "Validate accessories collection with active filter"
Task: "Validate code_order collection with sort parameter"
Task: "Validate configuration_ui collection with display_order sort"
```

## Notes
- [P] tasks = independent API tests or separate file investigations
- API validation must pass before frontend debugging
- Add console.log statements for debugging, remove after fix
- Document findings at each phase for troubleshooting report
- Preserve existing functionality while implementing fixes

## Task Generation Rules
*Applied during main() execution for debugging workflow*

1. **From Contracts**:
   - Each API endpoint → curl validation task [P]
   - Each collection → separate validation test [P]
   
2. **From Data Model**:
   - Each entity relationship → service investigation task
   - default_options flow → state tracking tasks
   
3. **From Research Decisions**:
   - Data flow analysis → sequential debugging tasks
   - Component comparison → UI investigation tasks

4. **Debugging Ordering**:
   - Setup → API Tests → Service → Components → UI → Fix → Validate
   - Each phase builds understanding for the next

## Validation Checklist
*GATE: Checked during execution*

- [x] All API endpoints have corresponding curl tests
- [x] All data entities have investigation tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent (different API endpoints)
- [x] Each task specifies exact file path or curl command
- [x] No task conflicts with debugging methodology
- [x] Debugging workflow follows logical investigation sequence

## Success Criteria
- API tests confirm default_options data is available from Directus
- Service layer properly processes and transforms default_options
- React components receive and display default_options data correctly  
- Current configurator section shows same options as option sets
- Polished product line displays complete configuration options
- Accessories appear for all product lines as configured
- No regression in existing functionality
# Tasks: Product Line Default Options Integration

**Input**: Design documents from `/Users/nick/Sites/mtxProductConfig/specs/001-i-want-to/`
**Prerequisites**: plan.md (✅), data-model.md (✅), contracts/ (✅), quickstart.md (✅)

## Execution Flow (main)
```
1. Load plan.md from feature directory ✅
   → Tech stack: TypeScript/React 18 + Vite, Zustand, Supabase
   → State management: 2025 best practices validated
2. Load design documents: ✅
   → data-model.md: M2A relationships, Supabase schema types
   → contracts/: ProductLineOptionsService, RulesEngineService
   → quickstart.md: Performance requirements, testing approach
3. Generate tasks by category:
   → Setup: dependencies, state management setup
   → Tests: contract tests for services, integration tests
   → Core: Supabase services, Zustand store, state management
   → Integration: UI components, rules engine, performance
   → Polish: error handling, edge cases, validation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Validation: All contracts have tests, performance requirements met
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- All paths relative to `/Users/nick/Sites/mtxProductConfig/`

## Phase 3.1: Setup & Dependencies
- [ ] T001 Verify existing state management setup (Zustand) in src/store/
- [ ] T002 [P] Install optional dependencies for 2025 best practices (TanStack Query, nuqs)
- [ ] T003 [P] Configure TypeScript types validation for Supabase M2A relationships

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Contract test ProductLineOptionsService.getProductLineDefaultOptions in src/test/product-line-options-service.test.ts
- [ ] T005 [P] Contract test ProductLineOptionsService.getProductOptionOverrides in src/test/product-line-options-service.test.ts
- [ ] T006 [P] Contract test RulesEngineService.validateOptionConfiguration in src/test/rules-engine-service.test.ts
- [ ] T007 [P] Contract test RulesEngineService.evaluateRules in src/test/rules-engine-service.test.ts
- [ ] T008 [P] Integration test M2A option loading from product_lines_default_options in src/test/m2a-integration.test.ts
- [ ] T009 [P] Integration test product override functionality in src/test/product-overrides.test.ts
- [ ] T010 [P] Performance test 100ms requirement for option loading in src/test/performance.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Supabase Services
- [ ] T011 [P] ProductLineOptionsService M2A query implementation in src/services/product-line-options.service.ts
- [ ] T012 [P] RulesEngineService implementation with JSON rule evaluation in src/services/rules-engine.service.ts
- [ ] T013 [P] Supabase client wrapper with M2A relationship helpers in src/services/supabase-client.service.ts

### State Management (2025 Best Practices)
- [ ] T014 Configuration state Zustand store in src/store/configuration.store.ts
- [ ] T015 Option loading actions and selectors in src/store/configuration.store.ts
- [ ] T016 Error handling and loading states in src/store/configuration.store.ts
- [ ] T017 [P] Optional TanStack Query integration for remote state caching in src/hooks/use-product-options.ts
- [ ] T018 [P] Optional nuqs integration for URL state management in src/hooks/use-url-state.ts

### Core Logic Integration
- [ ] T019 Effective options computation (defaults + overrides) in src/utils/option-resolver.ts
- [ ] T020 Rules evaluation integration with option filtering in src/utils/rules-evaluator.ts
- [ ] T021 M2A data transformation and validation in src/utils/m2a-transformer.ts

## Phase 3.4: UI Integration
- [ ] T022 Update product line selector to use new option loading in src/components/ProductLineSelector.tsx
- [ ] T023 Update configurator components to use Zustand store in src/components/ConfiguratorPanel.tsx
- [ ] T024 Add smooth transitions for option changes in src/components/OptionSelector.tsx
- [ ] T025 Implement error messaging for missing configurations in src/components/ErrorDisplay.tsx
- [ ] T026 Add visual feedback during option loading (<100ms) in src/components/LoadingStates.tsx

## Phase 3.5: Rules Engine Integration
- [ ] T027 Connect rules evaluation to option filtering in src/services/option-filter.service.ts
- [ ] T028 Implement rule violation handling and display in src/components/RuleViolationDisplay.tsx
- [ ] T029 Add rule-based option disabling/enabling in src/utils/option-availability.ts

## Phase 3.6: Edge Cases & Error Handling
- [ ] T030 Handle product line with no default options configured in src/utils/option-resolver.ts
- [ ] T031 Handle corrupted or unreachable option override data in src/services/error-handler.service.ts
- [ ] T032 Handle M2A references to non-existent option sets in src/utils/m2a-validator.ts
- [ ] T033 Add loading states and error boundaries in src/components/ErrorBoundary.tsx
- [ ] T039 [P] Empty state UI for "No options available for this product line" (FR-008) in src/components/EmptyStateDisplay.tsx
- [ ] T040 [P] Option set consistency validation using CLI validation commands (FR-005) in src/utils/consistency-validator.ts
- [ ] T041 [P] Option set existence validation using Supabase CLI verification (FR-006) in src/utils/existence-validator.ts
- [ ] T042 [P] Corruption error handling UI with admin intervention prompt (FR-010) in src/components/CorruptionErrorDisplay.tsx
- [ ] T043 [P] Non-existent option set prevention logic using CLI schema validation (FR-011) in src/utils/schema-validator.ts

## Phase 3.6b: Animation & Visual Transitions
- [ ] T044 [P] Subtle animation system for option transitions (FR-012) in src/components/animations/OptionTransition.tsx
- [ ] T045 [P] Smooth fade transitions between product configurations in src/components/animations/ConfigurationTransition.tsx
- [ ] T046 [P] Loading animation replacements (no spinners, subtle effects) in src/components/animations/LoadingEffects.tsx

## Phase 3.7: Performance & Validation
- [ ] T047 [P] Performance optimization for option loading (meet 100ms requirement) in multiple files
- [ ] T048 [P] State management re-render optimization using Zustand selectors
- [ ] T049 [P] Validate all user acceptance scenarios from quickstart.md using CLI validation
- [ ] T050 [P] MCP Chrome DevTools validation of UI interactions and animations
- [ ] T051 [P] MCP Supabase validation of M2A queries and performance with CLI schema verification

## Dependencies
- Setup (T001-T003) before tests (T004-T010)
- Tests (T004-T010) before implementation (T011-T033)
- Services (T011-T013) before state management (T014-T018)
- Core logic (T019-T021) before UI integration (T022-T026)
- UI components (T022-T026) before rules integration (T027-T029)
- Error handling (T030-T043) after core implementation
- Animation system (T044-T046) can run parallel with error handling
- Performance validation (T047-T051) after all implementation

## Parallel Execution Examples

### Phase 3.2: Contract Tests (Run Together)
```bash
# Launch T004-T010 together:
# Task T004: "Contract test ProductLineOptionsService.getProductLineDefaultOptions"
# Task T005: "Contract test ProductLineOptionsService.getProductOptionOverrides"
# Task T006: "Contract test RulesEngineService.validateOptionConfiguration"
# Task T007: "Contract test RulesEngineService.evaluateRules"
# Task T008: "Integration test M2A option loading"
# Task T009: "Integration test product override functionality"
# Task T010: "Performance test 100ms requirement"
```

### Phase 3.3: Service Implementation (Run Together)
```bash
# Launch T011-T013 together:
# Task T011: "ProductLineOptionsService M2A query implementation"
# Task T012: "RulesEngineService implementation with JSON rule evaluation"
# Task T013: "Supabase client wrapper with M2A relationship helpers"
```

### Phase 3.7: Validation (Run Together)
```bash
# Launch T034-T038 together:
# Task T034: "Performance optimization for option loading"
# Task T035: "State management re-render optimization"
# Task T036: "Validate all user acceptance scenarios"
# Task T037: "MCP Chrome DevTools validation"
# Task T038: "MCP Supabase validation"
```

## Notes
- [P] tasks = different files, no dependencies between them
- Verify all tests fail before implementing (TDD approach)
- Performance requirement: <100ms for all option loading operations
- Use MCP tools for validation instead of traditional test files
- State management follows 2025 best practices (Zustand + optional TanStack Query/nuqs)
- All M2A relationships must use Database['public']['Tables']['...'] types from src/types/database.ts
- Commit after each task completion for incremental progress tracking

## State Management Architecture Validation
- **Remote State**: Supabase M2A queries (T011, T017 optional TanStack Query)
- **Shared State**: Zustand configuration store (T014-T016)
- **URL State**: Optional nuqs for shareable configs (T018)
- **Local State**: Component-specific useState (T022-T026)

## Success Criteria
✅ All contract tests pass  
✅ Performance requirements met (<100ms)  
✅ M2A relationships working correctly  
✅ Product overrides applied properly  
✅ Error handling uses CLI validation instead of hardcoded fallbacks  
✅ All edge cases handled with proper CLI verification
✅ Subtle animations implemented (no loading spinners)
✅ Empty state UI displays correctly
✅ Corruption errors prompt admin intervention
✅ Rules engine integration functional  
✅ UI transitions smooth and responsive  
✅ MCP tool validation successful
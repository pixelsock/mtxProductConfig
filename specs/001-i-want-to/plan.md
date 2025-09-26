
# Implementation Plan: Product Line Default Options Integration

**Branch**: `001-i-want-to` | **Date**: 2025-09-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/nick/Sites/mtxProductConfig/specs/001-i-want-to/spec.md`

## Progress Status: ✅ PHASE 1 COMPLETE - READY FOR TASK PLANNING

**All design artifacts and contracts ready for /tasks command:**

- ✅ **Constitution**: Project principles and technical standards defined
- ✅ **Feature Spec**: Complete with user clarifications integrated  
- ✅ **Data Model**: Updated to use Database['public']['Tables']['...'] types from src/types/database.ts
- ✅ **API Contracts**: All three services updated with real schema types and M2A relationships
- ✅ **Schema Validation**: Supabase introspection complete, real database structure confirmed
- ✅ **Quickstart Guide**: Updated with 2025 state management best practices integration

**State Management Architecture Validated**: Modern React patterns integrated based on 2025 best practices - Zustand for shared state, potential TanStack Query for remote state optimization, nuqs consideration for URL state.

**Ready for**: `/tasks` command to generate implementation tasks based on completed design artifacts.

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Ensure option sets are correctly loaded from the product_line_default_options M2A field in the product-lines table, with proper handling of product-specific overrides from the products table. System must maintain 100ms response time, use Supabase rules engine, and provide smooth transitions between configuration states. Error handling will use CLI validation commands rather than hardcoded fallbacks to maintain constitutional compliance. Implementation will use modern React state management patterns based on 2025 best practices: Zustand for shared configuration state (validated approach), potential TanStack Query for remote state caching, and consideration of nuqs for URL state to enable shareable configurations.

## Technical Context
**Language/Version**: TypeScript/React 18 + Vite (existing stack from package.json)  
**Primary Dependencies**: Supabase JS SDK, Zustand (shared state - validated by 2025 best practices), potential TanStack Query (remote state optimization), potential nuqs (URL state for shareable configs), Zod (validation)  
**Storage**: Supabase PostgreSQL with product_lines and products tables, M2A relationships  
**Testing**: Chrome DevTools MCP + Supabase MCP for schema/API validation (no test runner files)  
**Target Platform**: Web browser (existing React configurator application)
**Project Type**: Web (frontend integration with existing backend)  
**Performance Goals**: <100ms option loading/switching, smooth UI transitions, optimized re-renders  
**Constraints**: Must use existing Supabase schema, rules engine, zero-deployment updates principle, CLI validation for error handling (no hardcoded fallbacks)  
**Scale/Scope**: Integration with existing MTX Product Configurator, M2A relationship handling

**State Management Strategy (2025 Best Practices)**:
- **Remote State**: Supabase data with potential TanStack Query wrapper for caching/deduplication
- **Shared State**: Zustand for configuration state (validated approach)  
- **URL State**: Consider nuqs for shareable configuration links
- **Local State**: useState for component-specific UI states

**Error Handling & Validation Strategy**:
- **CLI Validation**: Use command-line tools for schema/data validation instead of hardcoded fallbacks
- **Supabase CLI**: Schema validation and existence checks for M2A relationships
- **MCP Tools**: Runtime validation and testing of option loading scenarios
- **No Hardcoded Fallbacks**: All error states must be validated through external commands maintaining constitutional compliance

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**✅ API-First Architecture**: All product options, business rules, and SKU logic driven by Supabase API - no hardcoded product logic
**✅ Zero-Deployment Updates**: Backend changes possible without frontend code modification - all taxonomy data-driven  
**✅ Real-Time Visual Feedback**: Configuration changes provide instant SVG-based visual updates controlled by API data
**✅ Rules-Based Logic**: Product compatibility and filtering logic processed from backend rules - no UI-embedded business logic
**✅ Type Safety**: All API contracts and data models strictly typed with TypeScript and Zod validation

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── components/          # React UI components
├── services/           # Supabase SDK, API layer, rules engine integration
├── store/             # Zustand state management
├── types/             # TypeScript type definitions (database.ts with Supabase types)
├── utils/             # Helper functions
└── hooks/             # Custom React hooks

scripts/
├── introspect-schema.js    # Schema validation utilities
└── rules-phase2-validate.sh # Rules validation

specs/001-i-want-to/
├── plan.md             # This file (/plan command output)  
├── research.md         # Phase 0 output (/plan command)
├── data-model.md       # Phase 1 output (/plan command) - COMPLETED
├── quickstart.md       # Phase 1 output (/plan command)
└── contracts/          # Phase 1 output (/plan command) - COMPLETED
    ├── product-line-options-service.md
    ├── rules-engine-service.md
    └── configuration-state-service.md
```
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load completed Phase 1 artifacts: data-model.md, contracts/, quickstart.md
- Generate implementation tasks following 2025 React state management best practices
- Each contract service → TypeScript interface and implementation task [P]
- Zustand store setup → shared state management task
- M2A relationship queries → Supabase service integration task
- Component integration → UI update tasks with performance validation
- Error handling → edge case implementation tasks

**State Management Task Organization**:
- **Remote State**: Supabase M2A query implementation with potential TanStack Query wrapper
- **Shared State**: Zustand store for configuration state (validated approach)
- **Local State**: Component-specific useState implementations
- **URL State**: Optional nuqs integration for shareable configurations

**Ordering Strategy**:
- TDD order: Contract tests before implementations
- State-first: Zustand store → Supabase services → UI integration
- Performance validation: 100ms requirement testing throughout
- Mark [P] for parallel execution (independent service implementations)

**Estimated Output**: 20-25 numbered, ordered tasks with performance benchmarks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

✅ **Step 1**: Load feature spec from `/Users/nick/Sites/mtxProductConfig/specs/001-i-want-to/spec.md`  
✅ **Step 2**: Fill Technical Context with 2025 state management best practices  
✅ **Step 3**: Fill Constitution Check section  
✅ **Step 4**: Evaluate Constitution Check → ✅ All principles satisfied  
✅ **Step 5**: Execute Phase 0 → research.md (leveraged existing schema introspection)  
✅ **Step 6**: Execute Phase 1 → All artifacts complete:
   - ✅ data-model.md (updated with real Supabase schema)
   - ✅ contracts/ (all three services with M2A relationships)  
   - ✅ quickstart.md (updated with state management strategy)
✅ **Step 7**: Re-evaluate Constitution Check → ✅ No new violations  
✅ **Step 8**: Plan Phase 2 → Task generation approach described  
✅ **Step 9**: STOP - Ready for /tasks command

**PLANNING COMPLETE** ✅ All design artifacts ready for task generation and implementation.

**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*

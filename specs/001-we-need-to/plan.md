# Implementation Plan: Troubleshoot Product Options Visibility

**Branch**: `001-we-need-to` | **Date**: 2025-09-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/Users/nick/Sites/mtxProductConfig/specs/001-we-need-to/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Primary requirement: Investigate and fix why product line default_options are not appearing in the current configurator section despite being visible as option sets elsewhere. Specifically affects the Polished product line and accessories across all product lines. Technical approach will involve debugging the data flow from Directus API through the React components, validating API endpoints with curl commands, and ensuring proper filtering parameters for default_options display in the configurator interface.

## Technical Context
**Language/Version**: TypeScript/JavaScript with React 18, Node.js 22 LTS  
**Primary Dependencies**: React, TailwindCSS, Vite, Directus SDK, shadcn/ui components  
**Storage**: Directus CMS with PostgreSQL backend, Supabase Storage for assets  
**Testing**: ESLint + TypeScript compilation, manual testing with test scripts  
**Target Platform**: Web browsers (UMD library build for embedding)
**Project Type**: single (frontend library with external API integration)  
**Performance Goals**: API response time < 500ms, page load time < 3 seconds  
**Constraints**: Must use Directus API with curl validation, preserve existing functionality  
**Scale/Scope**: Product configurator for mirror/lighting products with 13+ data collections
**Implementation Notes**: Using Directus for backend data and API, use curl commands to validate API endpoints and correct filtering parameters and data input

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (existing React configurator - no new projects needed)
- Using framework directly? Yes (React hooks, no wrapper classes)
- Single data model? Yes (existing ProductConfig state object)
- Avoiding patterns? Yes (debugging existing code, not adding patterns)

**Architecture**:
- EVERY feature as library? N/A (this is debugging existing functionality)
- Libraries listed: N/A (troubleshooting, not creating libraries)
- CLI per library: N/A (web frontend debugging)
- Library docs: N/A (debugging task)

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? MODIFIED (debugging existing broken functionality)
- Git commits show tests before implementation? Will validate fixes with manual testing
- Order: Contract→Integration→E2E→Unit strictly followed? Will use debugging approach
- Real dependencies used? Yes (actual Directus API, not mocks)
- Integration tests for: API endpoints, data flow validation
- APPROACH: Validate→Debug→Fix→Test cycle for troubleshooting

**Observability**:
- Structured logging included? Yes (console.log debugging, existing logging)
- Frontend logs → backend? N/A (debugging frontend data display)
- Error context sufficient? Will enhance during debugging

**Versioning**:
- Version number assigned? N/A (bug fix, not new feature)
- BUILD increments on every change? Follow existing project versioning
- Breaking changes handled? No breaking changes expected (fixing existing functionality)

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
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 - Single project (debugging existing React configurator)

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
   - Run `/scripts/update-agent-context.sh [claude|gemini|copilot]` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate debugging tasks from Phase 1 analysis (contracts, data model, quickstart)
- API validation tasks from contracts (curl commands) [P]
- Data flow investigation tasks from data model [Sequential]
- Component comparison tasks from quickstart scenarios
- Fix implementation tasks based on findings

**Debugging Task Categories**:
1. **API Validation Tasks**: Test each Directus endpoint with curl commands
2. **Service Layer Analysis**: Debug `src/services/directus.ts` data processing  
3. **Component Investigation**: Compare option sets vs current configurator components
4. **State Flow Debugging**: Trace React state from API to UI components
5. **Fix Implementation**: Apply discovered solutions
6. **Validation Testing**: Verify fixes work across all scenarios

**Ordering Strategy**:
- Validate→Debug→Fix→Test cycle for troubleshooting
- API validation first (parallel curl tests) [P]
- Service layer investigation (sequential dependency)
- Component debugging (requires service layer understanding)
- Implementation (requires root cause identification)
- Testing (requires implementation completion)

**Specific Focus Areas**:
- Polished product line default_options processing
- Accessories display across all product lines  
- code_order and configuration_ui collection utilization
- Data consistency between option sets and current configurator

**Estimated Output**: 15-20 numbered, ordered debugging tasks in tasks.md

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

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS  
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (troubleshooting approach justified)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
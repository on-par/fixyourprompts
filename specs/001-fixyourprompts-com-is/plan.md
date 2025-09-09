# Implementation Plan: FixYourPrompts.com - AI Prompt Refinement Tool

**Branch**: `001-fixyourprompts-com-is` | **Date**: 2025-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fixyourprompts-com-is/spec.md`

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
FixYourPrompts.com is a free web tool that transforms rough, vague prompts into clear, structured versions with context, constraints, and follow-up questions. It helps developers and analysts improve AI interaction quality while teaching effective prompting techniques including reverse prompting. The tool aims to reduce wasted time and tokens by guiding users toward better prompting habits and building lasting prompt literacy.

## Technical Context
**Language/Version**: TypeScript (migrating from vanilla JavaScript)  
**Primary Dependencies**: React, Vite, Vitest for testing  
**Storage**: N/A (client-side only tool initially)  
**Testing**: Vitest for unit tests, Playwright for end-to-end testing  
**Target Platform**: Web browsers (responsive design)
**Project Type**: web (frontend application)  
**Performance Goals**: Fast prompt processing (<2s), responsive UI interactions  
**Constraints**: Free to use, no user registration required, client-side processing preferred  
**Scale/Scope**: Public web tool, unlimited concurrent users, educational content library

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (frontend only - web application)
- Using framework directly? (React + Vite directly, no unnecessary abstractions)
- Single data model? (Prompt refinement state, no complex DTOs needed)
- Avoiding patterns? (Direct React components, avoiding over-engineering)

**Architecture**:
- EVERY feature as library? (Component-based React architecture)
- Libraries listed: PromptAnalyzer (analysis logic), PromptRefiner (refinement logic), EducationContent (teaching materials)
- CLI per library: N/A (web application, no CLI needed)
- Library docs: Component documentation with TypeScript interfaces

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (Yes, Vitest for unit tests)
- Git commits show tests before implementation? (Yes, TDD approach)
- Order: Contract→Integration→E2E→Unit strictly followed? (E2E with Playwright, unit with Vitest)
- Real dependencies used? (Browser testing with Playwright, component testing with Vitest)
- Integration tests for: component interactions, prompt processing pipeline, user workflows
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? (Console logging for development, error boundaries for production)
- Frontend logs → backend? (N/A - client-side only application)
- Error context sufficient? (Error boundaries, user-friendly error messages)

**Versioning**:
- Version number assigned? (1.0.0 for initial release)
- BUILD increments on every change? (Yes, automated via CI/CD)
- Breaking changes handled? (Semantic versioning, backward compatibility considerations)

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

# Option 2: Web application (selected for this project)
frontend/
├── src/
│   ├── components/
│   │   ├── PromptInput/
│   │   ├── PromptOutput/
│   │   ├── EducationPanel/
│   │   └── common/
│   ├── services/
│   │   ├── PromptAnalyzer.ts
│   │   ├── PromptRefiner.ts
│   │   └── EducationContent.ts
│   ├── types/
│   ├── utils/
│   └── App.tsx
└── tests/
    ├── e2e/ (Playwright)
    └── unit/ (Vitest)

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - Frontend-only React application with TypeScript

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
- Generate tasks from TypeScript interfaces and React component contracts
- Each TypeScript interface → type definition + validation tests [P]
- Each React component → component tests + implementation [P] 
- Each service contract → service tests + implementation
- E2E tests for complete user workflows (Playwright)
- Integration tests for component interactions

**Technology-Specific Task Categories**:
1. **Project Setup Tasks**: Vite config, TypeScript config, testing setup
2. **Type Definition Tasks**: Core interfaces, enums, validation schemas
3. **Service Layer Tasks**: PromptAnalyzer, PromptRefiner, EducationContent services
4. **Component Tasks**: PromptInput, PromptOutput, AnalysisPanel, EducationPanel
5. **Testing Tasks**: Vitest unit tests, Playwright E2E scenarios
6. **Build & Deploy Tasks**: Production build, static hosting setup

**TDD Ordering Strategy**:
- Tests BEFORE implementation (RED-GREEN-Refactor cycle)
- Type definitions → Service contracts → Service tests → Service implementations
- Component contracts → Component tests → Component implementations
- Integration tests → E2E tests → Build pipeline
- Mark [P] for parallel execution (independent components)

**Estimated Output**: 30-35 numbered, ordered tasks in tasks.md covering:
- 5-7 setup and configuration tasks
- 8-10 type definition and service tasks  
- 10-12 React component tasks
- 7-8 testing and deployment tasks

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
- [ ] Complexity deviations documented (none required)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
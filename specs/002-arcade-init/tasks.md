# Tasks: Inicialização ARCADE_INIT

**Input**: Design documents from `/specs/002-arcade-init/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/arcade-init.md, quickstart.md

**Tests**: Automated tests are explicitly required for the sandbox configuration and message behavior, using the existing native Node.js test runner without adding dependencies.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because the task changes files independent of other tasks.
- **[Story]**: User-story association; all implementation tasks belong to US1.
- Every task has a sequential ID and names the relevant file path(s).

## Phase 1: Setup

**Purpose**: No project setup is needed; the existing frontend and test commands are configured.

## Phase 2: Foundational

**Purpose**: No shared infrastructure is required. The single user story can proceed directly.

## Phase 3: User Story 1 - Inicializar o jogo sem identificar o jogador (Priority: P1) 🎯 MVP

**Goal**: Send one fixed `ARCADE_INIT` after the active game's iframe finishes loading, without requiring or sending player identification.

**Independent Test**: Native Node tests verify the exact `ARCADE_INIT` payload, no dispatch for absent/replaced iframe, the `allow-scripts`-only sandbox token, and source/game-id/schema validation for both official `PLACAR` (`payload.pontos`) and legacy `GAME_OVER` (`payload.score`). A browser run verifies the game starts without identification and the post-match identification step remains unchanged.

### Tests (Node Test Runner)

- [x] T001 [P] [US1] Add native Node tests in `fliperama-local/tests/arcade-messages.test.ts` and update score regressions in `fliperama-local/tests/placar.test.ts`; render the CSS-free `GameFrame` component from `fliperama-local/src/pages/Jogo/GameFrame.tsx` with ReactDOMServer and assert the actual emitted iframe has `sandbox="allow-scripts"` exactly, explicitly confirming its tokens exclude `allow-same-origin`, `allow-popups`, and `allow-top-navigation`; also verify the exact `ARCADE_INIT` object and `"*"` target origin, dispatch only when the loaded iframe is the connected active iframe, suppression for absent/disconnected/replaced iframe, and rejection of incoming messages from the wrong source, game id, or malformed score; cover `PLACAR` with finite non-negative `payload.pontos` and legacy `GAME_OVER` with finite non-negative `payload.score`, without using `event.origin === "null"` as authentication.
- [x] T002 [US1] Implement typed initialization, iframe-presence guards, active-window/game-id message validation, and the shared `allow-scripts` sandbox token in `fliperama-local/src/pages/Jogo/arcadeMessages.ts`; implement official `PLACAR.payload.pontos` and legacy `GAME_OVER.payload.score` extraction in `fliperama-local/src/pages/Jogo/extrairPontuacao.ts`, both requiring top-level `jogo` to match the active game id.
- [x] T003 [US1] Integrate `fliperama-local/src/pages/Jogo/GameFrame.tsx` and the message helpers in `fliperama-local/src/pages/Jogo/Jogo.tsx`; render the game iframe with exactly `sandbox="allow-scripts"` and no `allow-same-origin`, `allow-popups`, or `allow-top-navigation`, send the init object once after load only if the event's iframe is still the connected ref, and handle inbound messages only from the active `contentWindow` with matching game id and valid schema, never authenticating by `"null"` origin.
- [x] T004 [P] [US1] Align the US-19/US-16 behavior and sandbox/message-security descriptions in `docs/planejamento/backlog.md`, `docs/planejamento/arquitetura.md`, `docs/planejamento/features-fim-a-fim.md`, and `docs-ref/contexto-g3.md`; preserve player identification after the match and document the official `PLACAR` plus legacy `GAME_OVER` compatibility.
- [x] T005 [US1] Run the Node tests and build from `fliperama-local/` using `npm test` and `npm run build`, then follow `specs/002-arcade-init/quickstart.md` to validate browser load/unmount behavior and unchanged post-match identification.

**Checkpoint**: US1 is complete when the game receives the exact one-time payload only after load while mounted, and player identification remains unchanged.

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: No additional cross-cutting implementation is needed beyond the US1 validation.

## Dependencies & Execution Order

### Phase Dependencies

- Setup and foundational work are not required for this feature.
- User Story 1 can begin immediately.
- T002 depends on T001 so the message helpers satisfy the regression tests.
- T003 depends on T002 to wire the helper behavior and sandbox into the runner.
- T005 depends on T003 and T004.

### User Story Dependencies

- **US1 (P1)**: No dependencies on other user stories or setup tasks; it is the entire MVP.

### Parallel Opportunities

- T001 and T004 can run in parallel because tests and documentation can be prepared independently.
- T002 must follow T001; T003 follows T002.
- T005 runs after implementation and documentation are complete.

## Parallel Example: User Story 1

```text
Task: T001 — Add Node tests in fliperama-local/tests/arcade-messages.test.ts
Task: T004 — Align US-19/US-16 contract and flow in the four listed planning/reference documents
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Add the native tests for message payloads, iframe guards, rendered sandbox attribute, and score acceptance/rejection.
2. Implement reusable message validation and score extraction, then wire the restrictive sandbox and load/message handlers into the game runner and testable iframe component.
3. Align the related US-19/US-16 project references without moving identification before the match.
4. Run the native test suite/build and validate the browser flow.

The single user story delivers the complete requested behavior; no later story phase is needed.

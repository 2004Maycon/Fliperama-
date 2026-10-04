# Implementation Plan: Inicialização ARCADE_INIT

**Branch**: `feature/arcade-init` | **Date**: 2026-10-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-arcade-init/spec.md`

## Summary

Run the game inside the Constitution-required iframe sandbox (`allow-scripts` only), send one `ARCADE_INIT` after the active iframe loads, and keep the existing post-match identification flow. The initialization payload is exactly `type: "ARCADE_INIT"`, `mudo: false`, and `recordes: []`; it omits `apelido`.

The existing React game runner will set the sandbox attribute and dispatch initialization only if the load event belongs to the still-mounted active iframe. Because the sandbox omits `allow-same-origin`, outbound initialization uses `"*"` as target origin for the opaque child origin; only fixed, non-sensitive values are sent. Incoming score messages are accepted only from the active iframe's `contentWindow`, with the active game's exact identifier and a validated message schema. `event.origin === "null"` is never treated as authentication. Automated Node tests cover the message helpers and sandbox configuration.

## Technical Context

**Language/Version**: TypeScript 6, JavaScript ES2023

**Primary Dependencies**: React 19, Vite 8; no new dependency

**Storage**: None; initialization values are transient

**Testing**: Node.js test runner via `npm test` (`node --import tsx --test tests/*.test.ts`); `npm run build` for TypeScript and Vite validation

**Target Platform**: Local web kiosk in Chromium/Firefox, hosting a game in an iframe

**Project Type**: Web application (React frontend and Fastify backend); this feature changes only the game-hosting frontend

**Performance Goals**: Dispatch initialization during the iframe load event without adding a delay to game startup

**Constraints**: Sandbox token is exactly `allow-scripts` (no `allow-same-origin`, pop-ups, or top navigation); do not dispatch without a mounted iframe; outbound init uses `"*"` only because the sandboxed child has an opaque origin and contains no sensitive data; authenticate inbound messages by exact active `contentWindow` identity and validate both the game identifier and message schema, never by `"null"` origin; do not ask for, include, or advance player identification

**Scale/Scope**: One initialization message per loaded game iframe; no persistent state, backend route, or external service changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Design response |
|---|---|---|
| Offline-first and local autonomy | PASS | Initialization uses the already loaded local game and does not depend on network or central services. |
| Idempotency and reliable score collection | PASS | No score, identifier, or persistence behavior changes. |
| Atomic persistence | PASS | No disk state is added or changed. |
| Iframe isolation and messaging | PASS | The active game iframe is sandboxed with `allow-scripts` only. Outbound init contains fixed non-sensitive values; inbound messages require exact active iframe source, expected game id, and valid schema, not a `"null"` origin check. |
| Native test runner | PASS | Node.js test coverage is added for init dispatch, iframe absence/replacement, sandbox configuration, and valid/invalid score messages. |
| UX and identification flow | PASS | Starting a game remains possible without identification; matrícula and apelido are still collected only after the match. |

## Project Structure

### Documentation (this feature)

```text
specs/002-arcade-init/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── arcade-init.md
```

### Source Code

```text
fliperama-local/
├── src/
│   └── pages/
│       └── Jogo/
│           ├── Jogo.tsx                 # restrictive sandbox and iframe message lifecycle
│           ├── GameFrame.tsx            # isolated, directly renderable game iframe
│           ├── arcadeMessages.ts        # typed initialization and inbound message validation
│           └── extrairPontuacao.ts      # official PLACAR and legacy GAME_OVER score extraction
└── tests/
    ├── arcade-messages.test.ts          # native tests of rendered iframe and message contract
    └── placar.test.ts                   # existing score/persistence tests
```

**Structure Decision**: Keep game lifecycle orchestration in `fliperama-local/src/pages/Jogo/Jogo.tsx` and render the iframe through a small CSS-free `GameFrame.tsx` component that can be imported by the native Node test. Render that component to static markup and assert the actual emitted iframe `sandbox` attribute is exactly `allow-scripts`; explicitly assert that its token list excludes `allow-same-origin`, `allow-popups`, and `allow-top-navigation`. Isolate pure message-contract helpers in `arcadeMessages.ts` and score parsing in `extrairPontuacao.ts` so the existing Node test runner can verify payloads, source binding, game-id/schema validation, and score extraction without adding dependencies.

## Complexity Tracking

No constitution violations are introduced by this feature. The iframe restriction and bidirectional message checks are included and tested.

## Phase 0: Research

See [research.md](./research.md) for the browser load-event, iframe availability, and target-origin decisions.

## Phase 1: Design & Contracts

- The transient message data shape and lifecycle are captured in [data-model.md](./data-model.md).
- The game-facing message envelope and delivery constraints are defined in [contracts/arcade-init.md](./contracts/arcade-init.md).
- Runnable validation scenarios are documented in [quickstart.md](./quickstart.md).

## Constitution Check (post-design)

| Principle | Result |
|---|---|
| Offline-first | PASS — no network dependency or external service added. |
| Idempotency / persistence | PASS — no result or stored state changes. |
| Atomic persistence | PASS — no disk writes. |
| Iframe isolation / messaging | PASS — sandbox is `allow-scripts` only; outbound init is non-sensitive; inbound messages require active source, active game id, and valid schema without authenticating on `"null"` origin. |
| Native tests | PASS — Node tests cover iframe configuration, init suppression and score-message validation. |
| UX / player identification | PASS — game entry and post-match identification order are unchanged. |

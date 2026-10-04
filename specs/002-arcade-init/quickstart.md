# Quickstart: Validating ARCADE_INIT

## Prerequisites

- Node.js and npm installed.
- Dependencies already installed in `fliperama-local/`.
- A locally available game entry that can be opened in the kiosk.

## Automated checks

From `fliperama-local/`, run:

```sh
npm test
npm run build
```

Expected result: the native Node test suite passes, including a ReactDOMServer rendering assertion that the emitted iframe has `sandbox="allow-scripts"` exactly and excludes `allow-same-origin`, `allow-popups`, and `allow-top-navigation`, as well as cases for initialization payload, missing/replaced iframe, and valid/rejected score messages; the TypeScript/Vite production build completes without errors.

## Browser validation

1. From `fliperama-local/`, start the application with `npm run dev`.
2. Open the game catalog and start a game without entering matrícula or apelido.
3. Observe messages received by the game window or use a test game that records parent messages.
4. Confirm exactly one `ARCADE_INIT` is received after the iframe finishes loading, with `type: "ARCADE_INIT"`, `mudo: false`, and `recordes: []`.
5. Confirm the message has no `apelido` or matrícula field.
6. Inspect the rendered iframe and confirm its `sandbox` value is exactly `allow-scripts`, without `allow-same-origin`, pop-ups, or top-level navigation permissions.
7. Navigate away or replace the iframe before its load event and confirm no initialization message is delivered to an absent/replaced frame.
8. Send a valid `PLACAR` from the active iframe with `jogo` matching the active game and `payload.pontos` finite and non-negative; confirm the score is captured.
9. Confirm a valid legacy `GAME_OVER` message with matching `jogo` and `payload.score` remains accepted. Confirm a message from another window or with wrong game id/malformed score is ignored, regardless of a `"null"` origin string.
10. Finish a game and confirm the existing post-match identification step remains the only step that requests matrícula and apelido.

The contract details are in [contracts/arcade-init.md](./contracts/arcade-init.md); the transient message lifecycle is in [data-model.md](./data-model.md).

# Data Model: Inicialização ARCADE_INIT

This feature introduces no persisted entities. The only new data is a transient message sent from the kiosk to the currently mounted game.

## Arcade Initialization Message

| Field | Type | Required | Constraint |
|---|---|---:|---|
| `type` | string literal | Yes | Exactly `"ARCADE_INIT"` |
| `mudo` | boolean | Yes | Exactly `false` at initialization |
| `recordes` | list | Yes | Empty list (`[]`) |

The message MUST NOT contain matrícula or `apelido`. It is sent after the iframe load event only when the iframe ref still identifies a connected, mounted iframe. There is at most one initialization dispatch for that mounted iframe.

## Game Score Message

| Field | Type | Required | Constraint |
|---|---|---:|---|
| `type` | string literal | Yes | `"PLACAR"` for the official protocol; `"GAME_OVER"` remains supported for legacy games |
| `jogo` | string | Yes | Exactly the identifier of the game active in the mounted iframe |
| `payload.pontos` | number | For `PLACAR` | Finite and greater than or equal to zero |
| `payload.score` | number | For legacy `GAME_OVER` | Finite and greater than or equal to zero |

A score message is valid only when its source is the exact `contentWindow` of the currently mounted iframe, its game identifier matches the active game, and its type and score fields satisfy the corresponding shape. The serialized iframe origin `"null"` MUST NOT be used as authentication.

## Iframe Sandbox

The game iframe uses only the sandbox token `allow-scripts`. It does not grant `allow-same-origin`, pop-ups, or top-level navigation. Its sandboxed origin is opaque.

## Lifecycle

```text
iframe mounted with allow-scripts only → iframe load completes
    ├─ active ref still points to connected iframe: send Arcade Initialization Message once
    └─ otherwise: send nothing

score event → source is active iframe window?
    ├─ yes + active game id + valid PLACAR/GAME_OVER schema: capture score
    └─ otherwise: ignore; do not authenticate using opaque origin "null"
```

Player identification is not a precondition or part of this message. Matrícula and apelido remain handled in the existing post-match flow.

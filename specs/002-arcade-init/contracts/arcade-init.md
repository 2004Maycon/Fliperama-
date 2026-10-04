# Contract: ARCADE_INIT

## Direction and timing

- **Sender**: Fliperama parent window
- **Recipient**: The active game's iframe window
- **Transport**: `window.postMessage`
- **Timing**: Once, after the iframe load event, provided the iframe remains mounted and its ref still identifies that iframe
- **Iframe sandbox**: `allow-scripts` only; never add `allow-same-origin`, pop-up, or top-navigation permissions for this contract

## Message envelope

```json
{
  "type": "ARCADE_INIT",
  "mudo": false,
  "recordes": []
}
```

The message MUST NOT include matrícula or `apelido`. Sending it MUST NOT require player identification or change the existing order in which the player starts the game and provides identification after the match.

## Outbound target origin

Because the sandboxed child has an opaque origin, send the fixed, non-sensitive initialization envelope with target origin `"*"`. Do not add private player data to this message.

## Suppression rules

Do not dispatch if the iframe ref is empty, points to a different/replaced iframe, or the iframe is no longer connected when its load handler runs. Repeated load notifications for the same active iframe MUST NOT cause duplicate initialization dispatches.

## Incoming score messages

Continue to accept the official score message:

```json
{
  "type": "PLACAR",
  "jogo": "<active-game-id>",
  "payload": {
    "pontos": 150
  }
}
```

Also retain legacy `GAME_OVER` support when `jogo` matches the active game and `payload.score` is finite and non-negative.

For both message types:

- Accept only when `event.source` is exactly the `contentWindow` of the currently mounted iframe.
- Require `event.data.jogo` to exactly match the active game's identifier.
- Validate the type and corresponding numeric score field before finalizing the match.
- Do not use `event.origin === "null"` as authentication; an opaque origin's serialized value is not unique or trustworthy.

Ignore messages from other windows, for other game identifiers, malformed messages, and invalid scores.

# Research: Inicialização ARCADE_INIT

## Decision 1: Dispatch on iframe load

- **Decision**: Send the initialization message from the iframe's load handler, after confirming the ref still points to the loaded iframe and is connected to the document. Guard dispatch so the same mounted iframe receives at most one initialization.
- **Rationale**: The browser load event indicates that the iframe document and its dependent resources have completed loading. Checking the current ref and connection state prevents dispatch after unmount or replacement. This directly meets the feature's lifecycle requirement.
- **Alternatives considered**:
  - Send immediately when mounting: rejected because the child document may not yet be loaded.
  - Add a child-to-parent readiness handshake: not needed by the stated contract, which makes load completion the dispatch point. A handshake would require a new protocol message and game-side support.

## Decision 2: Use the existing parent-to-iframe messaging boundary

- **Decision**: Deliver the fixed initialization envelope directly to the active iframe's `contentWindow` using `postMessage` with target origin `"*"`.
- **Rationale**: The Constitution requires a restrictive sandbox without `allow-same-origin`; that gives the child an opaque origin which cannot be specified as an exact `targetOrigin`. Wildcard delivery is limited to the fixed, non-sensitive initialization values and never includes player identity. No network call, storage, or backend route is added.
- **Alternatives considered**:
  - Specify the game URL's normal origin as `targetOrigin`: rejected because the sandboxed child has an opaque origin, so the browser will not deliver to that non-opaque origin.
  - Send initialization through Fastify or a remote endpoint: rejected because the frontend owns the iframe and the data is transient; it would add unnecessary coupling and impair offline behavior.

## Decision 3: Keep the payload free of player identity

- **Decision**: Include only `type: "ARCADE_INIT"`, `mudo: false`, and `recordes: []`; omit `apelido` and matrícula.
- **Rationale**: The spec clarification selects omission of `apelido`. The existing user flow allows the player to start and finish a game before identification; sending a provisional identity or moving identification earlier would violate the requirement.
- **Alternatives considered**:
  - Send `apelido: "ANON"` or an empty string: rejected because either adds a player identity field to the initialization contract without user identification.

## Target-origin consideration

The iframe must use `sandbox="allow-scripts"` without `allow-same-origin`. The browser serializes its opaque origin as `"null"`, but this value is shared by unrelated opaque origins and is not authentication. For inbound messages, require `event.source` to equal the active iframe's `contentWindow`, require the message's top-level `jogo` to equal the active game's identifier, and validate the supported message type and payload. Never accept a message merely because `event.origin === "null"`.

The official `PLACAR` shape uses `jogo` at the top level and a finite, non-negative number at `payload.pontos`. Preserve legacy `GAME_OVER` compatibility with the same top-level game identifier and finite, non-negative `payload.score`.

Browser references:

- [WHATWG iframe element](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-iframe-element)
- [MDN load event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/load_event)
- [WHATWG postMessage](https://html.spec.whatwg.org/multipage/web-messaging.html#posting-messages)
- [MDN iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox)

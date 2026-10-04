# Feature Specification: Inicialização ARCADE_INIT

**Feature Branch**: `feature/arcade-init`

**Created**: 2026-10-04

**Status**: Draft

**Input**: User description: "Implementar a US-19 para que o fliperama envie uma mensagem ARCADE_INIT ao jogo quando o iframe terminar de carregar. A mensagem deve conter type "ARCADE_INIT", mudo false e recordes como lista vazia. Nenhuma mensagem deve ser enviada caso o iframe não esteja montado. O fluxo atual do sistema deve ser preservado: o jogador acessa o jogo antes da identificação, e matrícula e apelido são coletados somente após a partida. Portanto, esta funcionalidade não deve exigir, antecipar ou alterar a etapa de identificação do jogador."

## Clarifications

### Session 2026-10-04

- Q: Como a mensagem `ARCADE_INIT` deve representar o apelido, já que o jogador ainda não se identifica antes da partida? → A: Omitir completamente o campo `apelido` da mensagem.
- Q: Qual formato de pontuação deve ser aceito na mensagem oficial `PLACAR` para manter a captura funcional com o iframe sandboxed? → A: Usar `payload.pontos` e `jogo` no nível superior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inicializar o jogo sem identificar o jogador (Priority: P1)

Como jogador, quero que o jogo receba as configurações iniciais assim que estiver carregado, para que eu possa começar a partida sem precisar me identificar antes.

**Why this priority**: A mensagem inicial faz parte da integração entre o fliperama e o jogo. Preservar a partida antes da identificação mantém o fluxo atual do quiosque.

**Independent Test**: Iniciar um jogo e verificar que, após o carregamento, ele recebe uma única mensagem `ARCADE_INIT` com `type` igual a `"ARCADE_INIT"`, `mudo` igual a `false` e `recordes` como lista vazia. Verificar também que não é solicitado qualquer dado de identificação antes da partida.

**Acceptance Scenarios**:

1. **Given** o jogador iniciou um jogo sem ter informado matrícula ou apelido e o iframe está montado, **When** o iframe termina de carregar, **Then** o jogo recebe a mensagem `ARCADE_INIT` com `type: "ARCADE_INIT"`, `mudo: false` e `recordes: []`, sem o campo `apelido`.
2. **Given** o jogo está carregando, **When** o iframe não está montado no momento do carregamento, **Then** nenhuma mensagem `ARCADE_INIT` é enviada.
3. **Given** uma partida terminou, **When** o fluxo segue para a etapa posterior à partida, **Then** matrícula e apelido continuam sendo coletados somente nessa etapa e a inicialização do jogo não os exige nem os antecipa.
4. **Given** o jogo está hospedado no iframe sandboxed ativo e envia um `PLACAR` válido com seu identificador e pontuação, **When** o fliperama recebe a mensagem, **Then** a pontuação é capturada sem depender de `event.origin` ser `"null"`.
5. **Given** a janela superior recebe uma mensagem de outra janela ou com identificador/formato inválido, **When** a mensagem é processada, **Then** ela é ignorada e não encerra a partida.

### Edge Cases

- Se o iframe for desmontado antes de terminar de carregar, nenhuma mensagem deve ser enviada.
- Se o jogador ainda não tiver sido identificado, o envio dos valores iniciais definidos para `ARCADE_INIT` continua ocorrendo sem bloquear ou redirecionar o fluxo para identificação.
- A origem opaca do iframe sandboxed é serializada como `"null"` e não identifica de forma confiável o jogo; a aceitação de mensagens deve se basear na janela ativa do iframe e na validação estrita dos dados esperados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Quando o jogo incorporado terminar de carregar e estiver montado, o fliperama MUST enviar ao jogo uma mensagem de inicialização com `type` igual a `"ARCADE_INIT"`.
- **FR-002**: A mensagem de inicialização MUST conter `mudo` igual a `false` e `recordes` como uma lista vazia.
- **FR-003**: O fliperama MUST NOT enviar a mensagem de inicialização se o iframe não estiver montado.
- **FR-004**: A inicialização do jogo MUST NOT exigir, antecipar ou alterar a etapa de identificação do jogador.
- **FR-005**: O jogador MUST continuar podendo acessar e jogar o jogo antes de informar matrícula ou apelido; esses dados MUST continuar sendo coletados somente após a partida.
- **FR-006**: A mensagem `ARCADE_INIT` MUST NOT conter o campo `apelido`; o fliperama MUST NOT solicitar ou inventar um apelido para enviá-la.
- **FR-007**: O jogo MUST ser executado em iframe com sandbox restrito ao token `allow-scripts`, sem `allow-same-origin`, permissões de pop-up ou navegação no contexto superior.
- **FR-008**: O fliperama MUST aceitar mensagens do jogo somente quando `event.source` for a janela do iframe atualmente montado, `event.data.jogo` corresponder ao identificador do jogo ativo e o tipo e os dados da mensagem forem válidos. O sistema MUST NOT usar `event.origin === "null"` como autenticação.
- **FR-009**: O fliperama MUST continuar capturando `PLACAR` com pontuação numérica finita e não negativa em `payload.pontos`; MUST continuar aceitando `GAME_OVER` legado com `payload.score` equivalente, desde que ambas as mensagens incluam `jogo` no nível superior e venham da janela ativa do iframe.

### Key Entities

- **Mensagem de inicialização**: Dados enviados pelo fliperama ao jogo após o carregamento, contendo o tipo `ARCADE_INIT`, o estado inicial de áudio mudo desligado e uma lista vazia de recordes.
- **Sessão de jogo**: Partida iniciada pelo jogador antes da etapa posterior à partida em que matrícula e apelido são coletados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos casos em que o jogo termina de carregar com o iframe montado, ele recebe uma mensagem com `type: "ARCADE_INIT"`, `mudo: false` e `recordes: []`, sem o campo `apelido`.
- **SC-002**: Em 100% dos casos em que o iframe não está montado, nenhuma mensagem `ARCADE_INIT` é enviada.
- **SC-003**: O fluxo permite iniciar e jogar sem identificação prévia, e matrícula e apelido permanecem restritos à etapa após a partida.
- **SC-004**: O iframe renderizado usa somente o sandbox `allow-scripts`, sem `allow-same-origin`, pop-ups ou navegação superior.
- **SC-005**: Testes automatizados demonstram que a pontuação de um `PLACAR` válido do iframe ativo continua sendo capturada, enquanto mensagens de outra janela ou com jogo/esquema inválido são ignoradas sem consultar `"null"` como origem confiável.

## Assumptions

- O estado inicial de áudio para esta mensagem é sempre mudo desligado (`false`), conforme definido para esta funcionalidade.
- Não há recordes disponíveis para incluir nesta inicialização; por isso, a lista enviada é vazia.
- A mensagem inicial não inclui matrícula nem apelido, pois a identificação só ocorre após a partida.

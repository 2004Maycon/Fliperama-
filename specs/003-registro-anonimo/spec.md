# Feature Specification: Registrar partida sem identificação (#17)

**Feature Branch**: `feature/anon-sem-identificacao`

**Created**: 2026-10-04

**Status**: Draft

**Input**: Issue Arcade-IFES/Fliperama-#17: permitir jogar sem identificação; apelido vazio vira `ANON`, matrícula opcional, com botão acessível por teclado após o resultado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Salvar a partida sem identificação (Priority: P1)

Como jogador que acabou uma partida, quero escolher não me identificar para registrar a pontuação e a avaliação sem informar meus dados e começar outra partida.

**Why this priority**: Remove o bloqueio atual para quem não quer compartilhar matrícula ou apelido.

**Independent Test**: Terminar um jogo, dar uma nota, chegar à identificação, acionar **JOGAR SEM IDENTIFICAÇÃO** usando apenas Tab e Enter; verificar que a partida foi registrada como `ANON`, com matrícula vazia, e que o quiosque voltou à atração.

**Acceptance Scenarios**:

1. **Given** uma partida concluída na tela de identificação, **When** o jogador aciona **JOGAR SEM IDENTIFICAÇÃO**, **Then** a pontuação e a avaliação são salvas com apelido `ANON` e matrícula vazia, sem exigir preenchimento dos campos.
2. **Given** foco de teclado no botão após navegar com Tab, **When** o jogador pressiona Enter, **Then** ocorre a mesma gravação anônima sem depender do mouse.
3. **Given** campos parcialmente preenchidos, **When** o jogador escolhe o botão anônimo, **Then** os valores digitados são descartados da partida registrada.
4. **Given** uma falha ao salvar localmente, **When** o jogador escolhe qualquer opção de registro, **Then** permanece na identificação e pode tentar novamente após ler um erro em português.

---

### User Story 2 - Registrar apelido com matrícula opcional (Priority: P2)

Como jogador que deseja informar somente seu apelido, quero salvar a partida sem matrícula; se deixar o apelido vazio ao salvar, quero aparecer como `ANON`.

**Why this priority**: Mantém o fluxo normal e permite o preenchimento parcial previsto na issue e no requisito de identificação.

**Independent Test**: Salvar uma partida informando só apelido, outra com matrícula e apelido, e outra com ambos os campos em branco; conferir os registros e os avisos.

**Acceptance Scenarios**:

1. **Given** um apelido alfanumérico válido e matrícula vazia, **When** o jogador salva, **Then** a partida é registrada com o apelido informado e matrícula vazia.
2. **Given** apelido vazio, **When** o jogador salva, **Then** a partida é registrada com `ANON` e sem matrícula, mesmo que uma matrícula tenha sido digitada.
3. **Given** matrícula informada, **When** o jogador salva, **Then** ela só é aceita se contiver exatamente 12 dígitos.
4. **Given** apelido informado, **When** o jogador salva, **Then** são aceitos apenas de 1 a 9 caracteres alfanuméricos, sem distinção de caixa.

### Edge Cases

- A escolha anônima descarta qualquer matrícula e apelido digitados antes de clicar no botão.
- Com apelido informado, uma matrícula preenchida parcialmente ou com formato inválido impede apenas a gravação pelo formulário; o botão anônimo continua disponível.
- O apelido composto só de espaços equivale ao campo vazio; apelidos com espaços internos, símbolos ou mais de 9 caracteres não são aceitos.
- Partidas sem identificação continuam armazenadas localmente quando não há internet, preservando o resultado para envio posterior.
- `ANON` pode contribuir com a avaliação do jogo, mas não aparece no ranking oficial por apelido; a classificação é responsabilidade do serviço central.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir **JOGAR SEM IDENTIFICAÇÃO** abaixo do formulário, na tela posterior ao resultado.
- **FR-002**: O jogador MUST poder acionar esse botão via teclado usando Tab e Enter, com foco perceptível.
- **FR-003**: Ao escolher a opção anônima, o sistema MUST registrar pontuação, jogo e avaliação da partida com apelido `ANON` e matrícula vazia, sem validar os campos preenchidos.
- **FR-004**: O sistema MUST permitir salvar a partida com matrícula vazia quando o jogador informa um apelido válido.
- **FR-005**: Ao salvar com apelido vazio ou composto só de espaços, o sistema MUST usar `ANON` e apagar a matrícula do registro anônimo.
- **FR-006**: Ao informar matrícula não vazia, o sistema MUST aceitar apenas 12 dígitos numéricos; o apelido informado MUST conter de 1 a 9 caracteres `A-Z` ou `0-9`, sem distinção de caixa.
- **FR-007**: Após uma gravação local bem-sucedida, o sistema MUST retornar à atração; se falhar, MUST mostrar erro em português e permitir nova tentativa sem perder o resultado.
- **FR-008**: Partidas anônimas MUST ser preservadas para envio mesmo sem internet; o apelido `ANON` não MUST aparecer no ranking oficial de jogadores.

### Key Entities *(include if feature involves data)*

- **Partida**: resultado de um jogo com pontuação, avaliação, apelido, matrícula opcional, identificador próprio e situação de envio.
- **Identificação da partida**: escolha posterior à partida; pode conter apelido válido e matrícula válida ou ser anônima (`ANON`, sem matrícula).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos fluxos de teste com botão anônimo, a partida salva contém `ANON`, matrícula vazia e a pontuação/avaliação originais.
- **SC-002**: O fluxo anônimo é concluído do resultado até a atração apenas com teclado, sem preencher campos.
- **SC-003**: Casos de apelido sem matrícula e apelido em branco salvam corretamente; casos de matrícula não vazia inválida e apelido fora do padrão mostram erro sem abandonar a partida.
- **SC-004**: Com internet indisponível, a partida anônima fica na fila local; quando o envio é possível, ela conserva o mesmo identificador e não aparece no ranking oficial.

## Assumptions

- O registro ocorre depois da partida e da avaliação, conforme `docs/planejamento/backlog.md` (US-08) e a issue #17.
- A opção anônima registra a partida como `ANON` para preservar pontuação e voto, mas não solicita colocação no ranking; a API central já trata `ANON` fora do ranking oficial conforme `docs-ref/integracao-api.md`.
- Não há alteração neste escopo para sincronização, termos ofensivos, catálogo ou integração com o jogo.

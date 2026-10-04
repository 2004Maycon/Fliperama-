# Feature Specification: Fila de reenvio com um arquivo por partida

**Feature Branch**: `fix/fila-arquivo-individual`

**Created**: 2026-10-04

**Status**: Implemented

**Input**: User description: "Issue #15 (Arcade-IFES/Fliperama-): fix(US-04) persistência por arquivo individual na fila de reenvio. Hoje a fila de resultados é guardada em um único arquivo reescrito por completo a cada operação, o que cria um ponto único de falha: uma queda de energia durante a escrita pode corromper todo o histórico de partidas pendentes. A fila deve guardar um arquivo por partida pendente, mover para a pasta de enviadas após envio bem-sucedido, listar a fila lendo a pasta e preparar ambas as pastas na inicialização. O arquivo legado da fila única pode ser ignorado por ora."

## Clarifications

### Session 2026-10-04

- Q: Se já existir uma partida com o mesmo id na pasta de enviadas ao mover uma partida pendente, o que o sistema deve fazer? → A: Manter o registro já arquivado, remover o pendente e seguir sem erro
- Q: Quando a fila é listada e um registro pendente está ilegível (corrompido, vazio ou JSON inválido), o que o sistema deve fazer com esse arquivo? → A: Ignorar na listagem, registrar aviso no log e deixar o arquivo na pasta

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Partida concluída fica guardada de forma isolada (Priority: P1)

Quando um jogador conclui uma partida, o placar é guardado na fila local de reenvio como um registro próprio, independente dos demais. O placar fica seguro mesmo sem rede e mesmo que o quiosque seja desligado da tomada logo depois.

**Why this priority**: É o núcleo da correção. Sem registros isolados, uma queda de energia durante a escrita pode destruir todas as partidas pendentes (Constituição, Princípios II e III).

**Independent Test**: Registrar uma partida e verificar que existe exatamente um registro novo na pasta de pendentes, identificado pelo id da partida, com o conteúdo completo do placar. Pode ser validado sem nenhuma sincronização.

**Acceptance Scenarios**:

1. **Given** a fila está vazia, **When** uma partida é registrada, **Then** existe um único registro na pasta de pendentes, nomeado pelo id único da partida, contendo matrícula, apelido, jogo, pontuação, avaliação e data/hora da partida.
2. **Given** a fila já tem partidas pendentes, **When** uma nova partida é registrada, **Then** os registros anteriores permanecem inalterados.
3. **Given** a fila tem várias partidas, **When** a fila é consultada, **Then** todas as partidas pendentes são retornadas, uma por registro existente.

---

### User Story 2 - Partida enviada sai da fila e fica arquivada (Priority: P1)

Depois que a Plataforma de Gestão confirma o recebimento de um placar, o registro da partida deixa de constar como pendente e passa a ficar na pasta de enviadas, preservando o histórico.

**Why this priority**: Evita reenvio de partidas já confirmadas e mantém o histórico local, sem perder dados (Constituição, Princípio II).

**Independent Test**: Registrar uma partida, marcá-la como enviada e verificar que ela não aparece mais na fila de pendentes e que o registro existe na pasta de enviadas com o mesmo conteúdo.

**Acceptance Scenarios**:

1. **Given** uma partida pendente, **When** o envio é confirmado e a partida é removida da fila, **Then** o registro deixa de existir na pasta de pendentes e passa a existir na pasta de enviadas com o mesmo conteúdo.
2. **Given** uma partida pendente, **When** ela é removida da fila, **Then** as demais partidas pendentes continuam disponíveis e inalteradas.
3. **Given** um id de partida que não está na fila, **When** a remoção é solicitada, **Then** o sistema trata a situação sem afetar outras partidas.

---

### User Story 3 - Falha em uma gravação não afeta as outras partidas (Priority: P1)

Se a gravação de uma partida falhar, ou se um registro estiver ilegível, as demais partidas pendentes continuam íntegras e disponíveis para reenvio.

**Why this priority**: É o objetivo declarado da issue: eliminar o ponto único de falha e garantir resiliência a queda de energia.

**Independent Test**: Simular falha na gravação de um registro e corromper um registro existente; verificar que os outros registros continuam legíveis e a fila continua operando.

**Acceptance Scenarios**:

1. **Given** uma fila com partidas pendentes, **When** a gravação de uma nova partida falha, **Then** nenhum registro já existente é alterado ou perdido.
2. **Given** uma fila em que um dos registros está ilegível, **When** a fila é consultada, **Then** os registros legíveis são retornados e o registro ilegível não impede a consulta.
3. **Given** uma interrupção de energia durante a gravação, **When** o quiosque reinicia, **Then** nenhum registro parcialmente escrito é tratado como partida válida.

---

### User Story 4 - Pastas da fila existem desde a inicialização (Priority: P2)

Na inicialização, o quiosque garante que as pastas de pendentes e de enviadas existam, sem apagar o que já estiver nelas.

**Why this priority**: É pré-condição das demais histórias, mas é simples e de baixo risco.

**Independent Test**: Iniciar com as pastas inexistentes e verificar que ambas são criadas; iniciar novamente com registros presentes e verificar que nada é apagado.

**Acceptance Scenarios**:

1. **Given** nenhuma das duas pastas existe, **When** a fila é preparada, **Then** ambas passam a existir.
2. **Given** as pastas já existem com registros, **When** a fila é preparada novamente, **Then** os registros existentes permanecem intactos.

---

### Edge Cases

- Já existe um registro de enviada com o mesmo id ao mover uma partida: o registro arquivado é mantido, o pendente é removido e a operação termina sem erro.
- Remoção de um id inexistente ou já movido (por exemplo, reenvio após reinicialização): não deve gerar erro que interrompa o processamento das demais partidas.
- Registro corrompido, vazio ou parcialmente escrito na pasta de pendentes: ignorado na listagem, com aviso registrado no log, e o arquivo permanece na pasta; a leitura dos demais não é impedida.
- Arquivos na pasta de pendentes que não são registros de partida (por exemplo, arquivos temporários de gravação interrompida): não devem ser tratados como partidas.
- Existência do arquivo legado da fila única: deve ser ignorado e não deve interferir na nova fila.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST guardar cada partida concluída na fila de pendentes como um registro próprio, nomeado pelo id único da partida.
- **FR-002**: O sistema MUST gerar o id único e a data/hora ISO 8601 da partida no momento do registro e incluí-los no registro.
- **FR-003**: O sistema MUST gravar cada registro de forma atômica, de modo que uma queda de energia nunca deixe um registro parcial ou vazio visível como partida válida (Constituição, Princípio III).
- **FR-004**: O sistema MUST, ao registrar uma nova partida, preservar sem alteração todos os registros já pendentes.
- **FR-005**: O sistema MUST listar a fila lendo todos os registros de partida da pasta de pendentes.
- **FR-006**: O sistema MUST ignorar na listagem registros ilegíveis ou que não sejam registros de partida, sem impedir o retorno dos demais. Para cada registro ilegível, o sistema MUST registrar um aviso no log com o nome do arquivo e mantê-lo na pasta.
- **FR-007**: O sistema MUST, ao remover uma partida após envio bem-sucedido, mover seu registro da pasta de pendentes para a pasta de enviadas, preservando o conteúdo. Se já existir um registro de enviada com o mesmo id, o registro arquivado MUST ser mantido, o pendente removido e a operação concluída sem erro.
- **FR-008**: O sistema MUST manter as demais partidas pendentes inalteradas quando uma partida for removida ou quando a gravação ou a remoção de uma partida falhar.
- **FR-009**: O sistema MUST criar as pastas de pendentes e de enviadas na preparação da fila, sem apagar o conteúdo existente.
- **FR-010**: O sistema MUST ignorar o arquivo legado de fila única; a migração de seu conteúdo está fora do escopo desta feature.
- **FR-011**: O contrato observável da fila para o restante do sistema (campos de uma partida, retorno do registro criado, listagem de pendentes) MUST permanecer compatível, de modo que os testes de placar existentes continuem passando.

### Key Entities

- **Partida pendente**: resultado de uma partida ainda não confirmado pela Plataforma de Gestão. Atributos: id único, matrícula, apelido, jogo, pontuação, avaliação e data/hora da partida. Existe como um registro individual na pasta de pendentes.
- **Partida enviada**: resultado cujo envio foi confirmado. Mesmo conteúdo da partida pendente, arquivado na pasta de enviadas.
- **Fila de reenvio**: conjunto das partidas pendentes, formado pelos registros individuais da pasta de pendentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos registros de partida, existe exatamente um registro individual na pasta de pendentes após a conclusão do registro.
- **SC-002**: Em 100% dos envios confirmados, a partida deixa a fila de pendentes e aparece na pasta de enviadas, e nenhuma partida pendente é perdida ou alterada nesse processo.
- **SC-003**: Em testes com falha de gravação ou registro corrompido, 100% das demais partidas pendentes continuam legíveis e disponíveis para reenvio.
- **SC-004**: Após interrupção de energia simulada durante uma gravação, nenhuma partida previamente registrada é perdida e nenhum registro incompleto é tratado como partida válida.
- **SC-005**: Todos os testes de placar existentes continuam passando sem alteração de comportamento observável.

## Assumptions

- O escopo é o que consta na issue #15 (US-04): registro individual, movimentação para enviadas, listagem e preparação das pastas. O worker de reenvio com intervalos progressivos e a idempotência na API central não fazem parte desta feature.
- O arquivo legado de fila única é ignorado; partidas que estejam apenas nele não são migradas, conforme a issue.
- O id único da partida (UUID) já é gerado no registro e continua sendo o identificador do registro.
- A gravação atômica segue a estratégia write-then-rename exigida pela Constituição (Princípio III) e pela documentação de arquitetura, mesmo que a issue não detalhe o mecanismo.
- A fila e as pastas de pendentes e de enviadas ficam sob o diretório de dados local do servidor do quiosque.
- Um id de partida já enviada que seja solicitado novamente para remoção é tratado como operação sem efeito, e não como falha da fila.

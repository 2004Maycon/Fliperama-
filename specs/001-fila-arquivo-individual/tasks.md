---

description: "Tasks da feature: fila de reenvio com um arquivo por partida"
---

# Tasks: Fila de reenvio com um arquivo por partida

**Input**: Design documents from `/specs/001-fila-arquivo-individual/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/fila-resultados-service.md](contracts/fila-resultados-service.md)

**Tests**: Incluídos. A Constituição (Princípio V) pede testes de integração do ciclo de vida da fila, e o plano prevê `tests/fila-resultados.test.ts`. Escreva cada teste antes da implementação e confirme que ele falha.

**Organization**: Tarefas agrupadas por user story. Todas as stories alteram o mesmo arquivo de produção, então quase nada é paralelizável. Por isso há poucos marcadores [P].

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: User story da tarefa (US1 a US4)

## Path Conventions

- Backend: `fliperama-local/server/services/`
- Testes: `fliperama-local/tests/`
- Comandos de teste e lint rodam a partir de `fliperama-local/`

---

## Phase 1: Setup

**Purpose**: Confirmar a linha de base antes de alterar

- [X] T001 Rodar `npm test` e `npm run lint` em `fliperama-local/` e registrar que `tests/placar.test.ts` passa antes da mudança
- [X] T002 Criar `fliperama-local/tests/fila-resultados.test.ts` com helper que cria diretório temporário, executa `process.chdir` e restaura o diretório e o temporário ao final, no mesmo padrão de `fliperama-local/tests/placar.test.ts`

---

## Phase 2: Foundational

**Purpose**: Estrutura de caminhos compartilhada por todas as stories

**⚠️ CRITICAL**: Nenhuma story começa antes desta fase

- [X] T003 Em `fliperama-local/server/services/filaResultadosService.ts`, substituir a constante `ARQUIVO_FILA` por funções ou constantes de caminho relativo `./data/fila` e `./data/enviadas`, resolvidas a cada chamada (research D6). Manter o tipo `ResultadoPartida` e as quatro assinaturas públicas (research D7)
- [X] T004 Em `fliperama-local/server/services/filaResultadosService.ts`, criar helper interno de gravação atômica: abrir `<id>.json.tmp`, escrever o conteúdo, chamar `sync()` no `FileHandle`, fechar e então `rename` para `<id>.json`. Se qualquer passo falhar, remover o `.tmp` e propagar o erro (research D1)

**Checkpoint**: Caminhos e gravação atômica prontos

---

## Phase 3: User Story 4 - Pastas da fila existem desde a inicialização (Priority: P2)

**Goal**: `prepararFilaResultados` cria `data/fila/` e `data/enviadas/` sem apagar conteúdo. Vem primeiro por ser pré-condição das demais.

**Independent Test**: Chamar `prepararFilaResultados` com as pastas inexistentes e depois com registros presentes.

### Tests for User Story 4

- [X] T005 [US4] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: sem pastas, `prepararFilaResultados()` cria `data/fila` e `data/enviadas` (FR-009)
- [X] T006 [US4] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: segunda chamada com registro existente em `data/fila` não apaga o registro (FR-009)

### Implementation for User Story 4

- [X] T007 [US4] Em `fliperama-local/server/services/filaResultadosService.ts`, reescrever `prepararFilaResultados` para criar as duas pastas com `mkdir` recursivo, sem criar nem tocar `fila-resultados.json` (FR-010)

**Checkpoint**: T005 e T006 passam

---

## Phase 4: User Story 1 - Partida concluída fica guardada de forma isolada (Priority: P1) 🎯 MVP

**Goal**: `adicionarResultado` grava um registro por partida e `buscarFilaResultados` lista a pasta.

**Independent Test**: Registrar partidas e verificar um arquivo por partida e a listagem.

### Tests for User Story 1

- [X] T008 [US1] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: `adicionarResultado` cria exatamente um `data/fila/<id>.json` com matrícula, apelido, jogoId, pontuação, avaliação, `id` e `jogadoEm` em ISO 8601 (FR-001, FR-002)
- [X] T009 [US1] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: uma segunda partida não altera o conteúdo do primeiro registro (FR-004)
- [X] T010 [US1] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: `buscarFilaResultados` retorna todas as partidas, ordenadas por `jogadoEm` com desempate por id (FR-005, research D8)
- [X] T011 [US1] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: após uma gravação, não resta nenhum `.json.tmp` em `data/fila` (FR-003)

### Implementation for User Story 1

- [X] T012 [US1] Em `fliperama-local/server/services/filaResultadosService.ts`, reescrever `adicionarResultado` para gerar `id` (UUID) e `jogadoEm` e gravar `data/fila/<id>.json` com o helper atômico (T004), retornando o registro criado
- [X] T013 [US1] Em `fliperama-local/server/services/filaResultadosService.ts`, reescrever `buscarFilaResultados` para ler somente os arquivos `.json` de `data/fila/`, fazer `JSON.parse` de cada um e ordenar por `jogadoEm`, com desempate por `id`

**Checkpoint**: T008 a T011 passam. MVP entregue.

---

## Phase 5: User Story 2 - Partida enviada sai da fila e fica arquivada (Priority: P1)

**Goal**: `removerResultado` move o registro para `data/enviadas/`.

**Independent Test**: Registrar, remover e verificar pendentes e enviadas.

### Tests for User Story 2

- [X] T014 [US2] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: `removerResultado(id)` tira o registro de `data/fila` e o deixa em `data/enviadas/<id>.json` com o mesmo conteúdo (FR-007)
- [X] T015 [US2] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: remover uma partida não altera as demais pendentes (FR-008)
- [X] T016 [US2] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: com `data/enviadas/<id>.json` já existente, `removerResultado` mantém o arquivado, remove o pendente e não lança erro (FR-007, clarificação 1)
- [X] T017 [US2] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: `removerResultado` de id inexistente não lança erro e não altera a fila (edge case)

### Implementation for User Story 2

- [X] T018 [US2] Em `fliperama-local/server/services/filaResultadosService.ts`, reescrever `removerResultado`: se `data/enviadas/<id>.json` não existir, `rename` do pendente; se existir, remover o pendente; se o pendente não existir, retornar sem erro (research D3)

**Checkpoint**: T014 a T017 passam

---

## Phase 6: User Story 3 - Falha em uma gravação não afeta as outras partidas (Priority: P1)

**Goal**: Registros ilegíveis e temporários não quebram a fila e geram aviso no log.

**Independent Test**: Criar arquivos corrompidos e temporários e verificar a listagem.

### Tests for User Story 3

- [X] T019 [US3] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: com um `.json` corrompido em `data/fila`, `buscarFilaResultados` retorna os demais, emite `console.warn` com o nome do arquivo e não remove o arquivo (FR-006, clarificação 2)
- [X] T020 [US3] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: um `.json` vazio e um `.json` sem `id` string são ignorados com aviso (FR-006, research D5)
- [X] T021 [US3] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: um `<id>.json.tmp` em `data/fila` não aparece na listagem (FR-003, research D2)
- [X] T022 [US3] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: um `fila-resultados.json` legado em `data/` não aparece na fila e não é alterado (FR-010)
- [X] T023 [US3] Em `fliperama-local/tests/fila-resultados.test.ts`, teste: se a gravação de uma nova partida falhar, os registros já existentes continuam inalterados (FR-004, FR-008). Simular a falha tornando `data/fila` não gravável ou removendo a pasta no teste

### Implementation for User Story 3

- [X] T024 [US3] Em `fliperama-local/server/services/filaResultadosService.ts`, em `buscarFilaResultados`, tratar cada arquivo em `try/catch`, validar que o JSON é objeto com `id` string, emitir `console.warn` com o nome do arquivo quando inválido e continuar a listagem (research D4, D5)

**Checkpoint**: T019 a T023 passam

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T025 Rodar `npm test` em `fliperama-local/` e confirmar que `tests/placar.test.ts` passa sem alteração (FR-011, SC-005)
- [X] T026 Rodar `npm run lint` em `fliperama-local/` e corrigir avisos nos arquivos alterados
- [X] T027 Conferir que `fliperama-local/server/server.ts` e `fliperama-local/server/services/reenvioService.ts` não precisaram de alteração (research D7)
- [X] T028 Executar a validação manual descrita em [quickstart.md](quickstart.md)
- [X] T029 Atualizar o status da tarefa de persistência individual da US-04 em `docs/planejamento/backlog.md`, apenas se o backlog tiver uma linha correspondente para essa tarefa

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende do Setup e bloqueia as stories
- **US4 (Phase 3)**: depende da Foundational
- **US1 (Phase 4)**: depende da US4, pois usa as pastas
- **US2 (Phase 5)**: depende da US1, pois precisa de registros para mover
- **US3 (Phase 6)**: depende da US1, pois altera a listagem
- **Polish (Phase 7)**: depende de todas as stories

### Within Each User Story

- Escrever os testes e vê-los falhar antes da implementação
- Todas as tarefas de uma story tocam os mesmos dois arquivos, então rodam em sequência

### Parallel Opportunities

Não há tarefas [P]: todas as alterações ficam em `filaResultadosService.ts` e `fila-resultados.test.ts`. Após a US1, US2 e US3 poderiam andar em paralelo por pessoas diferentes, mas conflitariam no mesmo arquivo, então não é recomendado.

---

## Implementation Strategy

### MVP First (US4 + US1)

1. Setup e Foundational
2. US4 e US1: pastas, registro individual e listagem
3. **Validar**: um `.json` por partida em `data/fila/`

### Incremental Delivery

1. Adicionar US2 (mover para enviadas), validar
2. Adicionar US3 (robustez a registros ilegíveis), validar
3. Polish e abrir o PR

---

## Notes

- Commits no formato Conventional Commits, por exemplo `fix(US-04): ...`
- Não alterar o escopo: sem worker de reenvio, migração do arquivo legado ou quarentena
- Commitar após cada story concluída

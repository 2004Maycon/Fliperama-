# Tasks: Registro anônimo depois da partida

**Input**: `specs/003-registro-anonimo/spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/resultados.md`, `quickstart.md`.

**Tests**: A constituição exige teste Node da rota Fastify e da fila; escrever cenário que falhe antes de alterar as regras.

**Organization**: Uma fase por história, com resultado verificável independentemente.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar que o projeto já tem ferramentas e dados gerados ignorados pelo Git.

- [x] T001 Verificar scripts de teste/build/lint em fliperama-local/package.json e padrões de node_modules, dist, .env, data em fliperama-local/.gitignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tornar a rota local testável sem iniciar o servidor e o sincronizador.

- [x] T002 Extrair POST /resultados sem mudar o contrato atual para fliperama-local/server/routes/resultados.ts e registrar o módulo em fliperama-local/server/server.ts

**Checkpoint**: A rota responde do mesmo modo anterior e aceita um teste com Fastify.inject.

---

## Phase 3: User Story 1 - Salvar a partida sem identificação (Priority: P1) 🎯 MVP

**Goal**: O botão salva `ANON` com matrícula vazia, avaliação e pontos, só retorna à atração após sucesso.

**Independent Test**: Simular POST anônimo no servidor local, inspecionar a fila e executar Tab+Enter no botão após uma partida.

- [x] T003 [US1] Adicionar teste inicialmente falho de POST anônimo, persistência offline, resposta e placar sem matrícula em fliperama-local/tests/anonimo.test.ts
- [x] T004 [P] [US1] Aceitar `ANON` sem matrícula e descartar matrícula recebida junto com `ANON` em fliperama-local/server/routes/resultados.ts
- [x] T005 [P] [US1] Adicionar botão nativo JOGAR SEM IDENTIFICAÇÃO que envia ('', 'ANON'), evita duplicidade e mantém erro/retry em fliperama-local/src/pages/Identificacao/Identificacao.tsx
- [x] T006 [US1] Dar ao botão foco de alto contraste e tamanho legível em fliperama-local/src/pages/Identificacao/Identificacao.css

**Checkpoint**: P1 funciona offline e por teclado; uma falha de gravação não descarta a partida.

---

## Phase 4: User Story 2 - Registrar apelido com matrícula opcional (Priority: P2)

**Goal**: Permitir apelido sem matrícula, converter apelido vazio a `ANON`, validar dados informados.

**Independent Test**: Enviar apelido alfanumérico sem matrícula, apelido vazio, matrícula não vazia de 12 dígitos, matrícula parcial, apelido inválido, e conferir resposta/fila.

- [x] T007 [US2] Adicionar cenários inicialmente falhos para apelido sem matrícula, apelido vazio, matrícula parcial e apelido fora de A-Z/0-9 em fliperama-local/tests/anonimo.test.ts
- [x] T008 [US2] Normalizar apelido vazio para `ANON`, aceitar matrícula `''` com apelido válido e rejeitar matrícula não vazia diferente de 12 dígitos ou apelido fora de 1 a 9 A-Z/0-9 em fliperama-local/server/routes/resultados.ts
- [x] T009 [US2] Aplicar as mesmas regras de validação e explicar ao jogador por que o formulário não foi salvo em fliperama-local/src/pages/Identificacao/Identificacao.tsx

**Checkpoint**: Os dois caminhos de registro funcionam sem divergir entre interface e servidor.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validar a entrega completa e documentar as evidências.

- [x] T010 Executar npm test, npm run build e npm run lint em fliperama-local/package.json e corrigir regressões detectadas
- [ ] T011 Conferir a jornada e os casos de erro conforme specs/003-registro-anonimo/quickstart.md; registrar limites de validação no PR

---

## Dependencies & Execution Order

T001 → T002 → T003 → T004/T005 → T006 → T007 → T008 → T009 → T010 → T011. A rota extraída na fase 2 é usada pelas duas histórias; P2 amplia P1 sem mudar o comportamento anônimo.

### Parallel Opportunities

Após T003, as mudanças do servidor (T004) e da interface (T005) podem ser feitas em paralelo por afetarem arquivos distintos. T006 depende do botão de T005. Não há necessidade de novos serviços ou dependências.

### Independent Test Criteria

- **US1**: Uma partida com `ANON` e matrícula vazia passa pelo endpoint, mantém pontuação e nota na fila offline e conserva o payload G1 sem matrícula; Tab+Enter aciona o botão.
- **US2**: Apelido válido sem matrícula e apelido vazio salvam; matrícula parcial com apelido válido e apelido com símbolo são rejeitados sem gravar.

## Implementation Strategy

Entregar US1 primeiro como MVP; validar rota e teclado. Depois adicionar US2, executar a suíte e verificar o resultado em revisão antes de pedir merge.

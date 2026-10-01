# Guia de Uso do Spec-Kit: Fliperama Local (G3)

Este documento orienta a equipe sobre o fluxo de desenvolvimento orientado por especificações (Spec-Driven Development) adotado no repositório do fliperama. O objetivo é organizar as decisões técnicas e regras de negócio antes de alterar o código da aplicação.

## 1. O que é o Spec-Kit

O Spec-Kit é um conjunto de ferramentas e instruções para agentes de IA (Antigravity IDE e Claude Code). O fluxo substitui a escrita direta de código por etapas estruturadas:

1. Especificar o comportamento esperado da funcionalidade.
2. Esclarecer dúvidas e regras de negócio abertas.
3. Planejar a arquitetura técnica e os arquivos afetados.
4. Decompor o plano em tarefas atômicas ordenadas.
5. Criar issues rastreáveis no GitHub.
6. Implementar as tarefas com validação contínua por testes.

## 2. Estrutura de arquivos no repositório

O repositório organiza o Spec-Kit nos seguintes diretórios:

- `.specify/`: arquivos de infraestrutura, modelos de documentos e scripts de automação do toolkit.
- `.specify/memory/constitution.md`: princípios de produto inegociáveis do quiosque (operação sem internet, persistência atômica e sandbox no iframe).
- `.agents/skills/`: comandos do Spec-Kit integrados ao Antigravity IDE (prefixo `/speckit-*`).
- `.claude/skills/`: comandos equivalentes para membros do time que utilizam o Claude Code.
- `specs/<nome-da-feature>/`: pasta criada para cada funcionalidade trabalhada, contendo os documentos gerados pelo fluxo.

## 3. Fluxo de trabalho por funcionalidade

Ao iniciar uma nova história do backlog ou refatoração estrutural, siga a sequência abaixo:

### Passo 1: Criar a branch de trabalho

Toda tarefa começa em uma branch criada a partir da `main` atualizada do fork:

```bash
git checkout main
git pull origin main
git checkout -b feature/<nome-da-feature>
```

### Passo 2: Especificar a funcionalidade (`/speckit-specify`)

No chat do agente, execute o comando descrevendo o que o sistema deve fazer em linguagem natural. Foque no problema a resolver e nas regras para o usuário, sem citar bibliotecas ou detalhes de código:

```text
/speckit-specify <descrição em linguagem natural>
```

O comando gera o arquivo `specs/<nome-da-feature>/spec.md` contendo as histórias de usuário e os critérios de aceitação.

### Passo 3: Esclarecer pontos abertos (`/speckit-clarify`)

Execute o comando de esclarecimento para encontrar ambiguidades:

```text
/speckit-clarify
```

O agente fará perguntas sobre casos de borda, formatos de dados e respostas de erro. As respostas fornecidas pelo time são registradas diretamente no `spec.md`.

### Passo 4: Planejar a arquitetura técnica (`/speckit-plan`)

Com a especificação aprovada, elabore o plano técnico indicando as tecnologias do projeto (React, TypeScript, Fastify e o test runner nativo do Node):

```text
/speckit-plan
```

Este passo gera `plan.md` e `research.md` na pasta da feature, mapeando os arquivos modificados e o modelo de dados.

### Passo 5: Gerar a lista de tarefas (`/speckit-tasks`)

Transforme o plano técnico em uma sequência de tarefas ordenadas:

```text
/speckit-tasks
```

O comando cria `specs/<nome-da-feature>/tasks.md`, organizado por fases (preparação, testes unitários, implementação e validação). Tarefas sem dependências mútuas recebem o marcador `[P]` para execução paralela.

### Passo 6: Criar as issues no GitHub (`/speckit-taskstoissues`)

Para integrar o planejamento ao quadro do repositório, rode:

```text
/speckit-taskstoissues
```

O script lê `tasks.md` e usa o GitHub CLI (`gh`) para abrir as issues correspondentes no repositório, mantendo o histórico de progresso acessível a todos do grupo.

### Passo 7: Implementação guiada (`/speckit-implement`)

Após revisar as tarefas e issues, inicie a implementação:

```text
/speckit-implement
```

O agente segue as tarefas do `tasks.md` em ordem. A cada etapa concluída, rode os testes automatizados para validar que nada quebrou:

```bash
npm test
```

## 4. Tabela de comandos rápidos

| Etapa | Antigravity IDE | Claude Code | Arquivo gerado ou atualizado |
| --- | --- | --- | --- |
| Princípios do produto | `/speckit-constitution` | `/speckit-constitution` | `.specify/memory/constitution.md` |
| Especificação funcional | `/speckit-specify` | `/speckit-specify` | `specs/<feature>/spec.md` |
| Resolução de dúvidas | `/speckit-clarify` | `/speckit-clarify` | `specs/<feature>/spec.md` |
| Plano de arquitetura | `/speckit-plan` | `/speckit-plan` | `specs/<feature>/plan.md` |
| Quebra de tarefas | `/speckit-tasks` | `/speckit-tasks` | `specs/<feature>/tasks.md` |
| Conversão para issues | `/speckit-taskstoissues` | `/speckit-taskstoissues` | Issues no GitHub |
| Geração de código | `/speckit-implement` | `/speckit-implement` | Código da aplicação em `src/` e `server/` |

## 5. Diretrizes para a equipe

1. Não altere os arquivos base em `.specify/templates/` manualmente. As atualizações devem ser feitas por meio dos comandos do CLI.
2. A constituição em `.specify/memory/constitution.md` define as regras inegociáveis de qualidade. Qualquer plano técnico que viole seus princípios deve ser recusado na revisão.
3. Mantenha os documentos gerados em `specs/<nome-da-feature>/` commitados no repositório junto com o código da funcionalidade.

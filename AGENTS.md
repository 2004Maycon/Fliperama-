# AGENTS.md — Instruções para Agentes de IA

## 1. Visão geral do projeto

O **Fliperama Local (G3)** é uma estação física do Recreio Arcade que:

- Executa jogos web dentro de iframes em um quiosque local.
- Coleta placares dos jogos ao final de cada sessão.
- Sincroniza esses placares com a **Plataforma de Gestão central (Arcade-IFES)**, mantida pelo grupo G1.

O projeto é acadêmico, da disciplina de **Extensão** do curso de **Sistemas de Informação** do IFES. A avaliação é baseada em entregas incrementais ao longo do semestre, cada uma com critérios específicos documentados em `docs-ref/contexto-g3.md`.

---

## 2. Estrutura do repositório

```text
.
├── fliperama-local/     # Código-fonte da aplicação (React + Vite + Fastify)
│   ├── src/             #   Frontend React
│   ├── server/          #   Backend Fastify (servidor local)
│   ├── public/          #   Assets estáticos
│   └── tests/           #   Testes
├── docs/                # Artefatos formais do processo (backlog, features
│                        #   fim a fim, DSM, arquitetura) — ainda vazio,
│                        #   a ser populado a partir das issues do GitHub
├── docs-ref/            # Contexto de referência (temporário)
│   ├── contexto-g3.md   #   Requisitos, cronograma e critérios de avaliação do G3
│   └── integracao-api.md#   Contrato técnico da API da Plataforma de Gestão (G1)
├── AGENTS.md            # Este arquivo
└── README.md
```

### Pendências estruturais

- **Mover código para a raiz:** o conteúdo de `fliperama-local/` será movido para a raiz do repositório em breve. Até lá, todo o código-fonte vive dentro desse subdiretório.
- **`docs/planejamento/`:** ainda não criado. Quando existir, conterá backlog, features fim a fim, DSM e documento de arquitetura — e passará a ser a **fonte de verdade**, substituindo `docs-ref/`.
- **`.specify/` e `specs/`:** ainda não existem. Quando criados, conterão a constitution e as specs geradas pelo Spec Kit (Spec-Driven Development).

---

## 3. Contexto obrigatório antes de qualquer tarefa

**Antes de escrever specs, planos ou código, leia obrigatoriamente:**

1. **`docs-ref/contexto-g3.md`** — requisitos, cronograma e critérios de avaliação do G3.
2. **`docs-ref/integracao-api.md`** — contrato técnico da API da Plataforma de Gestão (mantida pelo G1).
3. **`docs/planejamento/*.md`** (se existirem) — backlog, features, DSM, arquitetura. Quando disponíveis, estes são a **fonte de verdade** e têm precedência sobre `docs-ref/`.

Não pule esta etapa. O contexto desses arquivos é indispensável para evitar decisões desalinhadas com os requisitos reais do projeto.

---

## 4. Fluxo de trabalho (Git)

| Aspecto | Convenção |
| --- | --- |
| **Fork de trabalho** | `nribjoaovictor/Fliperama-` (remote `origin`) |
| **Repositório oficial** | `Arcade-IFES/Fliperama-` (remote `upstream`, somente leitura) |
| **Branch estável** | `main` |
| **Branch de integração** | `dev` |
| **Branches de trabalho** | `feature/<nome>` ou `fix/<nome>` |
| **Destino de PRs** | Sempre `dev` — nunca `main` diretamente |
| **Formato de commits** | Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:` |

---

## 5. Convenções técnicas

- **Frontend:** React + Vite (TypeScript).
- **Backend/servidor local:** Fastify (TypeScript, executado via `tsx`).
- **Testes:** Node.js test runner nativo (`node --test`).
- **Lint:** ESLint com plugins React.

### Regra de ouro

> **Não invente funcionalidade que não esteja documentada em `docs-ref/` ou `docs/planejamento/`.**
> Se não houver evidência de um requisito nesses arquivos, sinalize isso explicitamente em vez de presumir que ele existe.

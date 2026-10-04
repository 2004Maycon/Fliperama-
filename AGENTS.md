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
├── docs/                # Artefatos formais do processo
│   └── planejamento/    #   Backlog, features fim a fim, DSM e arquitetura
├── docs-ref/            # Contexto externo e especificações de referência
│   ├── contexto-g3.md   #   Requisitos (RF/RNF), cronograma e critérios de avaliação do G3
│   └── integracao-api.md#   Contrato técnico da API da Plataforma de Gestão (G1)
├── AGENTS.md            # Este arquivo
└── README.md
```

### Pendências estruturais

- **Mover código para a raiz:** o conteúdo de `fliperama-local/` será movido para a raiz do repositório em breve. Até lá, todo o código-fonte vive dentro desse subdiretório.
- **`.specify/` e `specs/`:** configurados e em uso ativo com o Spec Kit (Spec-Driven Development), contendo a constituição (`.specify/memory/constitution.md`) e as especificações de features em `specs/`.

---

## 3. Contexto obrigatório antes de qualquer tarefa

**Antes de escrever specs, planos ou código, consulte obrigatoriamente:**

1. **`docs/planejamento/*.md`** — backlog, features fim a fim, DSM e arquitetura. Esta é a **fonte de verdade** para o desenvolvimento e decisões internas da aplicação.
2. **`docs-ref/contexto-g3.md`** — requisitos funcionais e não funcionais do G3 (RF-L01 a RF-L26, RNF-L01 a RNF-L10), cronograma de entregas (E1 a E4, CP1 a CP4) e critérios de avaliação.
3. **`docs-ref/integracao-api.md`** — contrato técnico e especificação de endpoints da API da Plataforma de Gestão (G1).

Não pule esta etapa. O contexto desses arquivos é indispensável para evitar decisões desalinhadas com os requisitos reais do projeto.

---

## 4. Fluxo de trabalho (Git)

Consulte também [`CONTRIBUTING.md`](CONTRIBUTING.md) para diretrizes completas.

| Aspecto | Convenção |
| --- | --- |
| **Fork de trabalho** | `nribjoaovictor/Fliperama-` (remote `origin`) |
| **Repositório oficial** | `Arcade-IFES/Fliperama-` (remote `upstream`, somente leitura) |
| **Branch base no fork** | `main` (código estável do fork) |
| **Branches de trabalho** | `feature/<nome>` ou `fix/<nome>` (criadas sempre a partir de `main`) |
| **Destino de PRs (no fork)** | Sempre `main` do fork via Pull Request (nunca commit direto na `main`) |
| **Envio para a organização** | PR de `nribjoaovictor/Fliperama-:main` → `Arcade-IFES/Fliperama-:develop` |
| **Formato de commits** | Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:` |

---

## 5. Convenções técnicas

- **Frontend:** React + Vite (TypeScript).
- **Backend/servidor local:** Fastify (TypeScript, executado via `tsx`).
- **Testes:** Node.js test runner nativo (`node --test`).
- **Lint:** ESLint com plugins React.

### Regra de ouro

> **Não invente funcionalidade que não esteja documentada em `docs-ref/` ou `docs/planejamento/`.**
> Se não houver evidência de um requisito nesses arquivos, sinalize isso explicitamente em vez de presumir que ele existe.

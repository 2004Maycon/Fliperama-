# Implementation Plan: Fila de reenvio com um arquivo por partida

**Branch**: `fix/fila-arquivo-individual` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-fila-arquivo-individual/spec.md`

## Summary

Substituir o armazenamento da fila de resultados (um único `data/fila-resultados.json` reescrito por completo) por um registro JSON por partida em `data/fila/<id>.json`. Após envio confirmado, o registro é movido para `data/enviadas/<id>.json`. A gravação usa write-then-rename (Constituição, Princípio III). A mudança fica restrita a `fliperama-local/server/services/filaResultadosService.ts`, mantendo as assinaturas públicas usadas por `server.ts`, `reenvioService.ts` e `tests/placar.test.ts`.

## Technical Context

**Language/Version**: TypeScript (ESM), executado com `tsx` sobre Node.js

**Primary Dependencies**: Apenas módulos nativos do Node (`node:fs/promises`, `node:path`, `node:crypto`). Nenhuma dependência nova.

**Storage**: Arquivos JSON em disco: `data/fila/` (pendentes) e `data/enviadas/` (enviadas), relativos ao diretório de trabalho do servidor

**Testing**: `node --import tsx --test tests/*.test.ts` (executor nativo), com diretório temporário e `process.chdir`, como em `tests/placar.test.ts`

**Target Platform**: Quiosque Linux, servidor Fastify local

**Project Type**: Web application local (frontend React + backend Fastify); a mudança é só no backend

**Performance Goals**: Sem meta nova. A fila é pequena (partidas pendentes durante indisponibilidade da rede) e a listagem lê um diretório pequeno.

**Constraints**: Escrita atômica; operação offline; assinaturas públicas inalteradas; caminhos relativos (`./data/...`) resolvidos no momento da chamada, pois os testes trocam o diretório de trabalho

**Scale/Scope**: Um serviço, 4 funções públicas, mais testes novos

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
| ----------- | ----------- |
| I. Offline-first | Passa. Toda a feature é persistência local, sem rede. |
| II. Idempotência | Passa. O id UUID nomeia o arquivo. Colisão em enviadas mantém o arquivado (FR-007). |
| III. Persistência atômica | Passa. Write-then-rename para criar o registro e `rename` para mover. |
| IV. Isolamento via iframe | Não se aplica. |
| V. Testes com `node --test` | Passa. Testes de integração do ciclo de vida da fila, sem dependências novas. |
| Separação frontend/backend | Passa. Só o backend Fastify toca o sistema de arquivos. |
| Regra de não proliferação | Passa. Escopo limitado à issue #15 e à US-04. Sem worker, migração ou quarentena. |

Nenhuma violação. Sem entradas em Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-fila-arquivo-individual/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── fila-resultados-service.md
└── tasks.md             # Criado por /speckit-tasks
```

### Source Code (repository root)

```text
fliperama-local/
├── server/
│   └── services/
│       └── filaResultadosService.ts   # alterado
└── tests/
    └── placar.test.ts                 # deve continuar passando
    └── fila-resultados.test.ts        # novo: ciclo de vida da fila por arquivo
```

**Structure Decision**: Estrutura existente de aplicação web (frontend em `src/`, backend em `server/`). Nenhum arquivo ou módulo novo no código de produção. Os consumidores (`server.ts`, `reenvioService.ts`) não mudam.

## Complexity Tracking

Sem violações a justificar.

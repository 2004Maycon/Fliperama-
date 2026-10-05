# Implementation Plan: Registro anônimo depois da partida

**Branch**: `feature/anon-sem-identificacao` | **Date**: 2026-10-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-registro-anonimo/spec.md`.

## Summary

Adicionar um botão de registro anônimo à tela de identificação após o resultado, permitir salvar um apelido sem matrícula e tratar apelido vazio como `ANON`. O servidor local deve validar e normalizar o mesmo contrato da interface, preservando a fila e o fluxo offline existentes. Um teste do endpoint local exercita gravação e validação sem depender da API central.

## Technical Context

**Language/Version**: TypeScript 6 / Node.js 24 no ambiente de validação

**Primary Dependencies**: React 19, Fastify 5, Vite 8

**Storage**: Fila local `fliperama-local/data/fila/<id>.json` já existente; um arquivo atômico por partida, sem nova migração

**Testing**: `node --import tsx --test tests/*.test.ts`, `tsc -b`, Vite e ESLint

**Target Platform**: Navegador e servidor local de quiosque; interface em pt-BR e operável por teclado

**Project Type**: Aplicação web React com servidor Fastify local

**Performance Goals**: Opção anônima sem espera de rede; retorno após persistência local

**Constraints**: A resposta de sucesso exige persistência local; envio à API G1 continua assíncrono; não alterar o formato externo do placar

**Scale/Scope**: Um fluxo de tela, um endpoint local, um teste de integração

## Constitution Check

*GATE: Reavaliado antes e depois da pesquisa/desenho.*

| Princípio | Decisão e verificação |
|-----------|----------------------|
| I. Offline first | Usar o caminho atual de gravação na fila; nenhuma requisição externa na confirmação. |
| II. Idempotência | Manter o UUID atribuído pela fila e o reenvio atual; o botão desabilita enquanto salva para evitar clique duplo. |
| III. Persistência atômica | Reutilizar a fila com um arquivo por partida e gravação temporária seguida de renomeação, entregue pela issue #15; sem criar outra forma de persistência. |
| IV. Isolamento do jogo | O fluxo só acontece após o jogo; não alterar iframe nem mensagens. |
| V. Teste de integração | Exercitar a rota Fastify com `inject`, validar corpo e fila num diretório isolado, e verificar payload sem matrícula. |
| UX e requisitos | Botão nativo, visível, com foco evidente; compatível com Tab+Enter. Issue #17, US-08 e contrato da API documentam apelido opcional e `ANON`. |

**Gate**: PASS para esta mudança. A issue #15 já introduziu persistência atômica por partida; a #17 reutiliza esse serviço.

## Project Structure

### Documentation (this feature)

```text
specs/003-registro-anonimo/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/
│   └── resultados.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
fliperama-local/
├── src/
│   └── pages/Identificacao/
│       ├── Identificacao.tsx
│       └── Identificacao.css
├── server/
│   ├── server.ts
│   ├── routes/resultados.ts
│   └── services/filaResultadosService.ts  (reuso, sem mudança)
└── tests/
    └── anonimo.test.ts
```

**Structure Decision**: Extrair a rota existente `POST /resultados` para um módulo registrável permite testá-la pelo Fastify sem iniciar o servidor HTTP ou sincronizador. Manter `App.tsx`, fila e integração G1 sem mudanças.

## Complexity Tracking

Sem violações novas que exijam exceção à Constituição; a fila atual já foi atualizada pela issue #15.

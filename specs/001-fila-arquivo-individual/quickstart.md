# Quickstart: validar a fila por arquivo

## Pré-requisitos

- Dependências instaladas em `fliperama-local/` (`npm install`).

## Rodar os testes

```bash
cd fliperama-local
npm test
npm run lint
```

Esperado: todos passam, incluindo `tests/placar.test.ts` (FR-011, SC-005) e o teste novo da fila.

## Validação manual (opcional)

1. Inicie o servidor: `npm run server`.
2. Registre uma partida pelo fluxo normal, com a API da Plataforma de Gestão indisponível.
3. Confirme que existe `data/fila/<id>.json` e que `data/fila-resultados.json` não foi alterado.
4. Disponibilize a API e aguarde o reenvio.
5. Confirme que o arquivo saiu de `data/fila/` e está em `data/enviadas/`.

## Cenários cobertos pelos testes

Mapeamento para a [spec](spec.md):

- Um registro por partida e preservação dos anteriores (US1, FR-001, FR-004).
- Movimento para enviadas e colisão de id (US2, FR-007).
- Registro corrompido ignorado com aviso (US3, FR-006).
- Arquivo `.json.tmp` fora da fila (FR-003).
- Preparação idempotente das pastas (US4, FR-009).

Detalhes em [contracts](contracts/fila-resultados-service.md) e [data-model](data-model.md).

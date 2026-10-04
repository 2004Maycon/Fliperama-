# Contract: filaResultadosService

Interface interna do servidor, consumida por `server.ts` e `reenvioService.ts`. Nenhuma assinatura muda.

| Função | Entrada | Saída | Comportamento |
| -------- | --------- | ------- | --------------- |
| `prepararFilaResultados()` | nenhuma | `Promise<void>` | Cria `data/fila/` e `data/enviadas/` se faltarem. Não apaga conteúdo. |
| `adicionarResultado(resultado)` | `Omit<ResultadoPartida, 'id' \| 'jogadoEm'>` | `Promise<ResultadoPartida>` | Gera `id` e `jogadoEm`. Grava `data/fila/<id>.json` de forma atômica. Retorna o registro criado. |
| `buscarFilaResultados()` | nenhuma | `Promise<ResultadoPartida[]>` | Lê os `.json` de `data/fila/`, ignora ilegíveis com aviso no log e ordena por `jogadoEm`. |
| `removerResultado(id)` | `string` | `Promise<void>` | Move `data/fila/<id>.json` para `data/enviadas/<id>.json`. Colisão mantém o arquivado e remove o pendente. Id inexistente não gera erro. |

## Garantias

- Uma falha em uma operação não altera outros registros.
- Nenhum registro parcial ou vazio fica visível como `.json` em `data/fila/`: o conteúdo é sincronizado em disco antes do `rename`.

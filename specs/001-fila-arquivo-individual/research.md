# Research: Fila de reenvio com um arquivo por partida

Nenhum item ficou como NEEDS CLARIFICATION. As decisões abaixo fecham escolhas de projeto.

## D1. Gravação atômica

- **Decision**: Gravar em `data/fila/<id>.json.tmp`, forçar a persistência do conteúdo em disco com `fsync` (`FileHandle.sync()`) e só então fazer `rename` para `<id>.json`.
- **Rationale**: Exigido pela Constituição (Princípio III). O `rename` é atômico no mesmo sistema de arquivos, mas sem `fsync` prévio um corte de energia pode deixar o nome definitivo apontando para um arquivo vazio, o que viola a garantia de FR-003.
- **Alternatives considered**: `writeFile` direto no destino (rejeitado: pode deixar arquivo parcial após queda de energia). `rename` sem `fsync` (rejeitado: atômico para o nome, mas não para o conteúdo).

## D2. Arquivos temporários na listagem

- **Decision**: A listagem considera só arquivos terminados em `.json`. O sufixo `.json.tmp` deixa temporários fora da fila sem lógica extra.
- **Rationale**: Atende à edge case de arquivos que não são registros de partida.
- **Alternatives considered**: Prefixo `.tmp-` no nome (mais frágil com o filtro por extensão).

## D3. Mover para enviadas

- **Decision**: Se `data/enviadas/<id>.json` não existir, `rename` do pendente para enviadas. Se existir, remover o pendente (`rm` com `force`). Id inexistente em pendentes não gera erro.
- **Rationale**: Segue a clarificação 1 e a idempotência do reenvio após reinicialização.
- **Alternatives considered**: Sobrescrever o arquivado (perde o registro original). Falhar com erro (trava o reenvio).

## D4. Registro ilegível

- **Decision**: Na listagem, `JSON.parse` por arquivo em `try/catch`. Em caso de falha, `console.warn` com o nome do arquivo e seguir. O arquivo permanece em `data/fila/`.
- **Rationale**: Segue a clarificação 2. O projeto já usa `console.log` nos serviços, então não há biblioteca de log a introduzir.
- **Alternatives considered**: Quarentena (fora do escopo, sem base na documentação).

## D5. Validação de registro

- **Decision**: Considerar válido o JSON que seja objeto com `id` string. Isso basta para excluir arquivos que não sejam partidas. Os demais campos seguem o tipo `ResultadoPartida`.
- **Rationale**: Mantém FR-006 sem criar um esquema novo.
- **Alternatives considered**: Validar todos os campos (excesso para o escopo).

## D6. Caminhos relativos

- **Decision**: Manter caminhos relativos (`./data/fila`, `./data/enviadas`) calculados a cada chamada.
- **Rationale**: `tests/placar.test.ts` usa `process.chdir` para um diretório temporário. Uma constante resolvida em tempo de importação quebraria o isolamento.

## D7. Compatibilidade com `placar.test.ts`

- **Decision**: Manter as quatro assinaturas: `prepararFilaResultados()`, `buscarFilaResultados()`, `removerResultado(id)`, `adicionarResultado(resultado)`, além do tipo `ResultadoPartida`.
- **Rationale**: FR-011. `reenvioService.ts` e `server.ts` continuam sem alteração.

## D8. Ordem da listagem

- **Decision**: Ordenar por `jogadoEm` crescente, com desempate pelo id, para manter reenvio cronológico.
- **Rationale**: O arquivo único preservava ordem de inserção. Sem ordenação, a ordem do diretório é indefinida.
- **Alternatives considered**: Ordem do diretório (não determinística).

# Contrato local: POST /resultados

O frontend envia o resultado depois da avaliação e escolha da identificação:

```json
{"matricula":"","apelido":"ANON","jogoId":"corrida-contra-o-sino","pontuacao":42,"avaliacao":4}
```

- Matrícula: campo string obrigatório no corpo, pode ser `""`; se não vazia com apelido informado, exatamente 12 dígitos.
- Apelido: campo string obrigatório no corpo; espaço/vazio vira `ANON`. Fora disso, após remover espaços das pontas e usar maiúsculas, 1 a 9 caracteres `A-Z` ou `0-9`. `ANON` descarta eventual matrícula.
- Jogo não vazio; pontuação finita e não negativa; avaliação inteira de 1 a 5.
- Sucesso `200`: `{"sucesso":true,"resultado":{...}}`; a partida foi adicionada à fila com `id` e `jogadoEm`.
- Erro `400`: `{"sucesso":false,"erro":"Dados da partida inválidos."}`; não grava uma partida.
- Erro de armazenamento: a interface informa o jogador e mantém a tela para tentar novamente.

O formato G3 → G1 continua sendo `{id_partida,jogo_id,jogador,pontos,nota,jogado_em}`; sem matrícula. A exclusão de `ANON` do ranking é responsabilidade do G1, conforme `docs-ref/integracao-api.md`.

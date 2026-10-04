# Data Model: Fila de reenvio com um arquivo por partida

## Partida (ResultadoPartida)

| Campo | Tipo | Observação |
| ------- | ------ | ----------- |
| `id` | string (UUID) | Gerado no registro. Nomeia o arquivo. |
| `matricula` | string | Informada pelo jogador |
| `apelido` | string | Informado pelo jogador |
| `jogoId` | string | Identificador do jogo |
| `pontuacao` | number | |
| `avaliacao` | number | |
| `jogadoEm` | string (ISO 8601), opcional | Gerado no registro |

Os campos não mudam em relação ao tipo atual.

## Layout em disco

```text
data/
├── fila/        # partidas pendentes: <id>.json
└── enviadas/    # partidas confirmadas: <id>.json
```

- `fila-resultados.json` (legado) é ignorado.
- `<id>.json.tmp` é temporário de gravação e não faz parte da fila.

## Estados e transições

```text
(registro) --adicionarResultado--> PENDENTE  (data/fila/<id>.json)
PENDENTE --removerResultado--> ENVIADA       (data/enviadas/<id>.json)
PENDENTE com colisão em enviadas --removerResultado--> pendente removido, arquivado mantido
```

## Regras de validação

- Registro válido: JSON objeto com `id` string.
- Registro ilegível ou sem `id`: ignorado na listagem, aviso no log, arquivo permanece.
- Remoção de id inexistente: sem efeito, sem erro.

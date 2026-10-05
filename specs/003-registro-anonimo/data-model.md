# Data model: registro anônimo

## Resultado de partida

| Campo | Regra nesta feature |
|-------|---------------------|
| `id` | UUID mantido pela fila; reutilizado no reenvio. |
| `jogoId` | Identificador obrigatório do jogo já selecionado. |
| `pontuacao` | Número finito, maior ou igual a zero. |
| `avaliacao` | Inteiro de 1 a 5. |
| `apelido` | `ANON` quando vazio/só espaços; caso contrário, 1 a 9 caracteres `A-Z`/`0-9` após normalizar caixa. |
| `matricula` | String vazia para `ANON` ou omissão pelo jogador; se preenchida com apelido válido, 12 dígitos. |
| `jogadoEm` | Data ISO existente, gerada com o registro local. |

## Transições

1. Ao confirmar avaliação, a pontuação e nota aguardam identificação.
2. Ao salvar pelo formulário ou opção anônima, a rota valida, normaliza e coloca a partida na fila offline.
3. Apenas após sucesso local o quiosque volta à atração. Em erro, mantém o resultado na tela para nova tentativa.
4. O trabalhador de reenvio existente transmite o apelido, pontuação e avaliação; a matrícula não sai da máquina. `ANON` pode ser contado como voto e não no ranking oficial.

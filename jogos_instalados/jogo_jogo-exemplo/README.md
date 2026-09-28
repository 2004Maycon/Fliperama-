# Quiz Invaders (exemplo)

Jogo de exemplo do **Recreio Arcade**, mantido pelo G1 (Plataforma de Gestão). Serve para duas coisas:

1. **Modelo de repositório válido**: tem tudo o que a submissão exige, na raiz.
2. **Teste de ponta a ponta** da API: submissão → curadoria → download no fliperama → placar.

## Como jogar

Mova a nave com **← →** até a resposta certa e atire com **Espaço** (ou Enter). São 10 questões por partida, com 15 segundos cada. Acertar vale 100 pontos, mais 10 por segundo restante.

No fim da partida, o jogo pede o **apelido** do jogador para o ranking (A-Z e 0-9, até 9 caracteres). Dá para digitar no teclado ou usar só o joystick: **↑ ↓** trocam a letra, **→** vai para a próxima, **←** apaga, **Enter** confirma.

Com o apelido confirmado, o jogo envia ao fliperama a mensagem `PLACAR`, via `window.parent.postMessage`. O fliperama repassa o placar para a API (e pede a nota do jogo ao jogador):

```json
{ "tipo": "PLACAR", "jogo": "jogo-exemplo", "versao": "1.1.0", "jogador": "ANA", "pontos": 1450, "duracao_s": 95, "acertos": 8, "erros": 2, "tema": "Matemática" }
```

Para rodar localmente, sirva a pasta por HTTP, porque o jogo carrega `questoes.json` com `fetch`:

```bash
npx serve .
```

## Estrutura exigida pela submissão

| Arquivo | Para quê |
| --- | --- |
| `index.html` | Ponto de entrada do jogo, na raiz |
| `game.json` | Manifesto: id, nome, versão, autores, mecânica, tema… |
| `questoes.json` | Banco com pelo menos 20 questões, todas com `fonte` |
| `capa.png` | Capa mostrada no catálogo |

Detalhes e códigos de erro: [docs/submissao.md](https://github.com/Arcade-IFES/Plataforma-Gestao-API/blob/main/docs/submissao.md) da API.

## Publicar uma versão

1. Aumente `versao` no `game.json` (ex.: `1.0.0` → `1.1.0`).
2. Commite e crie a tag com o mesmo número:
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```
3. Submeta no Portal (ou `POST /api/jogos`) com o link deste repositório e a tag.

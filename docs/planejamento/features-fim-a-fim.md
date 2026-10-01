# Features fim a fim: Fliperama Local (G3)

Decomposição do produto em funcionalidades verticais para o quiosque do Recreio Arcade. Cada item integra interface, regras locais, persistência em disco e comunicação externa.

## 1. Visão geral e critérios de decomposição

Features fim a fim organizam o sistema pelo fluxo de uso do usuário. Cada funcionalidade conecta quatro partes:

1. Interface com o usuário (React): navegação por teclado e contraste para tela 4:3.
2. Servidor local (Fastify): regras de sessão, orquestração e sanitização.
3. Armazenamento em disco: arquivos JSON e JSONL gravados com escrita atômica para resistir a quedas de energia.
4. Integrações externas: contratos com a Plataforma de Gestão (G1) e com o SDK dos jogos (G4).

Para cada feature, este documento registra:

- Problema que resolve
- Quem usa (jogador, operador, desenvolvedor de jogos ou curador)
- Resultado entregue
- Partes do sistema envolvidas

## 2. Tabela de features priorizadas

A tabela reúne as seis features verticais do fliperama em ordem de prioridade de implementação:

| Feature | Usuário | Valor entregue | Partes envolvidas |
| --- | --- | --- | --- |
| F4: Execução isolada em iframe com captura de pontuação via SDK (Prioridade 1) | Jogador e desenvolvedor do jogo (G4) | Roda o jogo em tela cheia sob sandbox restrito, envia dados iniciais via `ARCADE_INIT`, recebe pontuação via `postMessage` (`PLACAR`) e fecha o iframe liberando memória RAM. | React (view `EmJogo`), Fastify (servidor de arquivos estáticos locais), disco (`jogos/<id>/<versao>/`) e contratos de mensagem G3/G4. |
| F3: Navegação e seleção no catálogo de jogos locais (Prioridade 2) | Jogador | Apresenta a grade de jogos em tela 4:3 com capa, título, autoria e controles. Funciona só com setas e Enter, direto do disco, mesmo sem conexão de rede. | React (view `PainelSelecao`), Fastify (`GET /api/jogos` local e rotas de capas) e disco (`catalogo.json` e assets). |
| F2: Identificação do jogador por matrícula e apelido (Prioridade 3) | Jogador | Coleta matrícula de 12 dígitos e apelido de até 9 caracteres ao final da partida. Preenche ANON se o apelido ficar vazio e bloqueia termos ofensivos. | React (view `Identificacao`), Fastify (normalização e validação) e disco (`config.json`). |
| F6: Sincronização de catálogo e download de zips com a gestão central (Prioridade 4) | Operador do quiosque e curador (G1) | Atualiza o quiosque com pacotes aprovados na gestão central. Baixa zips pendentes com checagem condicional (`ETag`/`sha256`), extrai no disco e remove jogos descontinuados. | React (view `Sincronizacao` e status no topo), Fastify (rotina em background) e API central (`GET /api/jogos` e `GET /api/jogos/{id}/pacote`). |
| F5: Registro de voto e enfileiramento de resultados offline (Prioridade 5) | Jogador, curador (G1) e operador | Grava partidas em `partidas.jsonl`, recolhe nota opcional de 1 a 5 estrelas e envia à API central com chave de idempotência (`id_partida`). Em falhas de rede, guarda na pasta `fila/` e repete o envio com espera progressiva. | React (view `FimPartida`), Fastify (rota de placar e fila em disco) e API central (`POST /api/placares`). |
| F1: Atração e inicialização autônoma do quiosque (Prioridade 6) | Operador do quiosque e jogador | Sobe a interface direto na tela de atração ao ligar o computador na tomada, exibe mapa de teclas, bloqueia teclas de saída do sistema operacional e retorna ao início após inatividade. | React (views `Atracao` e `MapaTeclas`), scripts de boot Linux e flags do Chromium em modo `--kiosk`. |

## 3. Detalhamento dos fluxos

### F4: Execução isolada em iframe com captura de pontuação via SDK

- Problema: jogos de terceiros podem travar, vazar memória ou tentar acessar dados locais. O quiosque precisa isolar a execução de cada jogo e capturar os resultados de forma uniforme.
- Quem usa:
  - Jogador: joga a partida em tela cheia e encerra quando terminar ou desistir.
  - Desenvolvedor do jogo (G4): integra o jogo aos contratos da plataforma.
- Resultado entregue:
  1. O jogador escolhe o jogo e aciona a partida.
  2. O React monta um `<iframe sandbox="allow-scripts">` sem `allow-same-origin`, apontando para a rota do Fastify local.
  3. O fliperama envia a mensagem `ARCADE_INIT` com apelido, melhores pontuações e estado do áudio.
  4. O jogo roda e, ao terminar, emite `postMessage` do tipo `PLACAR` com pontos, duração, acertos, erros e tema.
  5. Se o jogo não responder em 15 segundos ou a partida passar de 5 minutos, o supervisor encerra por timeout.
  6. Ao receber o placar ou atingir timeout, o React desmonta o iframe para liberar memória RAM e passa para a tela final.
- Partes do sistema envolvidas:
  - React: view `EmJogo` e listener de eventos `message`.
  - Fastify: entrega de arquivos estáticos em `/jogos/:id/:versao/*`.
  - Disco: `/var/lib/recreio-arcade/jogos/<id>/<versao>/`.
  - Contratos externos: mensagens `ARCADE_INIT`, `ARCADE_MUDO` e `PLACAR` (RF-L05, RF-L06, RF-L10, RF-L16, RF-L22, RF-L23).

### F3: Navegação e seleção no catálogo de jogos locais

- Problema: a máquina do pátio tem monitor 4:3 (1024×768) e teclado sem mouse. O jogador precisa achar e escolher títulos com facilidade, sem lentidão e sem depender de internet.
- Quem usa:
  - Jogador: consulta a lista de jogos, vê instruções e escolhe o que jogar.
- Resultado entregue:
  1. O painel exibe uma grade com capas, título, autoria, controles, tema e nível de cada jogo.
  2. A navegação usa apenas setas e Enter, com foco visual claro no card selecionado.
  3. O jogador pode filtrar os títulos por tema usando teclas de atalho.
  4. Ao apertar Enter no card, o sistema inicia o jogo imediatamente, deixando a avaliação e a identificação para o término da partida.
  5. As informações vêm do cache local, com resposta abaixo de 150 ms.
- Partes do sistema envolvidas:
  - React: view `PainelSelecao`, componente de card e indicador de modo offline.
  - Fastify: rota local `GET /api/jogos` e rotas de imagens de capa.
  - Disco: `/var/lib/recreio-arcade/catalogo.json` e pastas de assets.
  - Requisitos associados: RF-L02, RF-L03, RF-L11, RF-L14.

### F2: Identificação do jogador com validação de apelido e matrícula

- Problema: o ranking precisa associar pontuações a um jogador sem burocracia de login prévio e sem permitir termos ofensivos na tela pública.
- Quem usa:
  - Jogador: informa matrícula institucional e apelido ao concluir a partida.
- Resultado entregue:
  1. A tela solicita matrícula de 12 dígitos e apelido de até 9 caracteres (`A-Z`, `0-9`) após a avaliação da partida.
  2. O jogador pode digitar pelo teclado ou pular caso não deseje registrar a pontuação no ranking oficial.
  3. Se pressionar Enter com o apelido vazio, o sistema assume `ANON`.
  4. O sistema converte minúsculas em maiúsculas de forma automática.
  5. Se o texto estiver na lista de bloqueio do quiosque, a interface pede outro apelido sem exibir detalhes técnicos.
  6. Os dados aprovados são anexados ao resultado da partida para gravação e envio.
- Partes do sistema envolvidas:
  - React: view `Identificacao`, seletor de caracteres por setas e avisos de validação.
  - Fastify: rotina de sanitização e comparação com termos bloqueados.
  - Disco: lista de palavras proibidas em `config.json`.
  - Requisitos associados: RF-L04, RF-L24, RF-L26.

### F6: Sincronização de catálogo e download de zips com a gestão central

- Problema: atualizar jogos manualmente em quiosques físicos demanda tempo e gera erros. O fliperama precisa baixar novos jogos aprovados e remover versões antigas sem intervenção no pátio.
- Quem usa:
  - Operador do quiosque: confere status da sincronização e uso de disco.
  - Curador (G1): aprova jogos na plataforma central, disponibilizando-os para o quiosque.
  - Jogador: recebe versões novas e corrigidas.
- Resultado entregue:
  1. O quiosque consulta `GET /api/jogos` na API de Gestão em intervalos regulares ou no boot.
  2. Compara o hash SHA-256 dos jogos remotos com o `catalogo.json` local.
  3. Se houver pacote novo ou alterado, faz requisição em `GET /api/jogos/{id}/pacote` com cabeçalho `If-None-Match`. Se o arquivo for igual, a API responde `304 Not Modified` sem enviar o corpo.
  4. Ao receber o zip, valida o hash contra o cabeçalho `X-Sha256`. Se o hash for divergente, descarta o arquivo.
  5. Extrai o pacote na pasta `jogos/<id>/<versao>/` e atualiza `catalogo.json` com escrita atômica.
  6. Exclui do disco pastas de jogos que não constam mais no catálogo oficial.
  7. Se a conexão cair, mantém o catálogo local em funcionamento sem interromper partidas.
- Partes do sistema envolvidas:
  - React: status de sincronização na barra superior e view `Sincronizacao`.
  - Fastify: processo de sincronização e rota `/api/sync/status`.
  - Disco: `catalogo.json` e diretório `/var/lib/recreio-arcade/jogos/`.
  - API externa (G1): rotas `GET /api/jogos` e `GET /api/jogos/{id}/pacote`.
  - Requisitos associados: RF-L01, RF-L15, RF-L20.

### F5: Registro de voto e enfileiramento de resultados offline

- Problema: a internet do pátio oscila com frequência. Partidas e avaliações não podem se perder durante quedas de rede nem duplicar pontuação quando o sinal retornar.
- Quem usa:
  - Jogador: dá nota de 1 a 5 e vê seu resultado no ranking local.
  - Curador e coordenação (G1): recebem avaliações e histórico para compor relatórios do projeto.
- Resultado entregue:
  1. Ao fim do jogo, a tela mostra os pontos obtidos e o ranking combinado (oficial mais partidas locais).
  2. Oferece campo de nota (1 a 5 estrelas) e comentário opcional. O jogador pode pular a avaliação com uma única tecla.
  3. O sistema gera um `id_partida` (UUID v4).
  4. Grava a linha da partida em `partidas.jsonl` por append-only.
  5. Salva o registro completo em `fila/<id_partida>.json`.
  6. Envia para `POST /api/placares` com cabeçalho `Authorization: Bearer est_...`.
  7. Se a API responder 201 ou 200 (`duplicada: true`), move o arquivo para `enviadas/<id_partida>.json`.
  8. Em caso de falha de rede, o arquivo fica na pasta `fila/` e o worker repete o envio com intervalos de 5 s, 15 s, 1 min e 5 min.
- Partes do sistema envolvidas:
  - React: view `FimPartida` com botões de nota e opção de pular.
  - Fastify: rota local de recebimento de placar e rotina de reenvio da fila.
  - Disco: `partidas.jsonl`, `/fila/<id_partida>.json` e `/enviadas/<id_partida>.json`.
  - API externa (G1): rota `POST /api/placares`.
  - Requisitos associados: RF-L06, RF-L07, RF-L08, RF-L15, RF-L17, RF-L18.

### F1: Atração e inicialização autônoma do quiosque

- Problema: o fliperama opera sem mouse e sem operador presente no pátio. Ele deve inicializar sozinho ao ser ligado na tomada, impedir saída para o sistema operacional e retomar a tela inicial quando ficar ocioso.
- Quem usa:
  - Operador do quiosque: liga a máquina na tomada pela manhã e desliga ao fim do dia.
  - Jogador: vê a demonstração visual e o mapa de comandos na tela de descanso.
- Resultado entregue:
  1. Ao ligar a máquina, o sistema sobe o servidor Fastify e abre o Chromium em tela cheia com a opção `--kiosk`.
  2. A tela de atração abre de imediato, exibindo demonstração e mapa de teclas ativas.
  3. Atalhos do sistema operacional (`Alt+F4`, `Ctrl+W`, `Ctrl+T`, `F11`, `Alt+Tab`) são interceptados e ignorados.
  4. Após 60 segundos sem toque no teclado no painel de seleção (ou 20 segundos na tela de fim), o sistema volta à atração e limpa a sessão.
  5. Se uma tecla física quebrar, o operador ou jogador pode reconfigurar o mapeamento, que fica salvo em `teclas.json`.
  6. Se o navegador fechar por pane, o serviço do sistema reinicia a interface.
- Partes do sistema envolvidas:
  - React: views `Atracao` e `MapaTeclas`, timer de inatividade e bloqueio de atalhos.
  - Fastify: rotas `/api/teclas` e `/api/health`.
  - Disco: `teclas.json` e rotinas de boot do Linux.
  - Ambiente: Chromium em `--kiosk`.
  - Requisitos associados: RF-L09, RF-L11, RF-L12, RF-L13, RF-L19.

## 4. Rastreabilidade com os requisitos do G3

| Feature | Requisitos funcionais | Requisitos não funcionais | Histórias de usuário | Marco |
| --- | --- | --- | --- | --- |
| F4: Execução isolada e captura de placar | RF-L05, RF-L06, RF-L10, RF-L16, RF-L22, RF-L23 | RNF-L02, RNF-L03, RNF-L06 | US-15, US-16, US-17, US-19, US-20, US-21 | E1 / E2 |
| F3: Navegação e seleção no catálogo | RF-L02, RF-L03, RF-L11, RF-L14 | RNF-L01, RNF-L07 | US-02, US-07, US-10, US-12 | E1 / E2 |
| F2: Identificação do jogador | RF-L04, RF-L24, RF-L26 | RNF-L07, RNF-L10 | US-08, US-14 | E1 / E2 |
| F6: Sincronização com gestão central | RF-L01, RF-L15, RF-L20 | RNF-L04, RNF-L08, RNF-L09 | US-01, US-04, US-06 | E2 |
| F5: Registro de voto e fila offline | RF-L06, RF-L07, RF-L08, RF-L15, RF-L17, RF-L18 | RNF-L04, RNF-L05 | US-03, US-04, US-13, US-22, US-23 | E2 / E3 |
| F1: Atração e quiosque autônomo | RF-L09, RF-L11, RF-L12, RF-L13, RF-L19 | RNF-L04, RNF-L05, RNF-L07 | US-05, US-09, US-11, US-18 | E3 |

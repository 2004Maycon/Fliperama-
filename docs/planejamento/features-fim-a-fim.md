# Features Fim a Fim: Fliperama Local (G3)

> Decomposição do produto em funcionalidades verticais completas para o quiosque do Recreio Arcade, conectando interface, regras locais, persistência em disco e integrações externas.

---

## 1. Visão Geral e Critérios de Decomposição

As features fim a fim representam recortes verticais do produto. Em vez de fatiar o sistema por camadas técnicas isoladas (apenas telas ou apenas rotas de backend), cada funcionalidade aqui descrita entrega valor perceptível ao usuário, atravessando:

1. **Interface do usuário (React):** interação por teclado, alto contraste e feedback visual.
2. **Serviço local (Fastify):** regras de negócio da sessão, orquestração e sanitização.
3. **Persistência local (Disco):** arquivos JSON e JSONL com escrita atômica para tolerância a desligamentos bruscos.
4. **Integrações externas:** contratos com a Plataforma de Gestão (G1) e o SDK dos jogos (G4).

### Perguntas respondidas por cada feature

- **Problema:** qual dor operacional ou de uso ela soluciona.
- **Usuário:** quem interage ou se beneficia diretamente (Jogador, Operador, Desenvolvedor de Jogos / G4, Curador / G1).
- **Valor entregue:** o resultado prático obtido após a execução do fluxo.
- **Partes envolvidas:** componentes de interface, rotas locais, arquivos em disco e APIs externas.

---

## 2. Tabela de Features Fim a Fim Priorizadas

A tabela a seguir apresenta as seis features verticais do fliperama, ordenadas pela prioridade de entrega e construção incremental (da espinha dorsal de execução até a blindagem do quiosque autônomo):

| Feature | Usuário | Valor entregue | Partes envolvidas |
| --- | --- | --- | --- |
| **F4: Execução isolada em iframe com captura de pontuação via SDK** (Prioridade 1) | Jogador e Desenvolvedor do Jogo (G4) | Executa o jogo web em tela cheia com proteção sandbox (sem acesso a rede ou cookies locais), repassa dados iniciais do jogador (`ARCADE_INIT`), captura a pontuação via `postMessage` (`PLACAR`) e encerra o processo liberando a memória RAM. | **React:** View `EmJogo`, iframe com sandbox restrito, listeners de mensagens.<br>**Fastify:** Servidor de arquivos estáticos dos pacotes locais.<br>**Disco:** Diretório `/var/lib/recreio-arcade/jogos/<id>/<versao>/`.<br>**Contratos:** Protocolo de mensagens G3 ↔ G4 (`ARCADE_INIT`, `ARCADE_MUDO`, `PLACAR`). |
| **F3: Navegação e seleção no catálogo de jogos locais** (Prioridade 2) | Jogador (estudante no pátio) | Permite ao aluno folhear os jogos disponíveis em grade de alto contraste com capa, título, autoria e controles, usando apenas as setas e Enter, funcionando com resposta rápida mesmo se a rede do pátio estiver fora do ar. | **React:** View `PainelSelecao`, card de jogo com foco ativo, filtros de busca.<br>**Fastify:** Rota local `GET /api/jogos` servindo o catálogo compilado em cache e rota de imagens de capa.<br>**Disco:** Arquivo `catalogo.json` e pastas de assets dos jogos.<br>**APIs:** Nenhuma em tempo de execução (leitura exclusiva do disco local). |
| **F2: Identificação do jogador com validação de apelido** (Prioridade 3) | Jogador (estudante no pátio) | Registra a identidade do aluno (até 9 caracteres `A-Z`, `0-9`) em segundos por digitação ou setas, fornecendo atalho para anonimato (`ANON`) e barrando palavras inadequadas antes de repassar o apelido à sessão de jogo e ao ranking. | **React:** View `Identificacao`, seletor de caracteres, feedback amigável de validação.<br>**Fastify:** Validador e normalizador de apelidos (maiúsculas, regex e lista de bloqueio).<br>**Disco:** Lista de termos restritos em `config.json`.<br>**APIs:** Nenhuma externa direta (apelido compõe o estado da sessão local). |
| **F6: Sincronização de catálogo e download de zips com a gestão central** (Prioridade 4) | Operador do quiosque e Curador (G1) | Mantém a máquina física atualizada com os pacotes aprovados na gestão central sem necessidade de pendrive; baixa apenas zips modificados via verificação condicional (`ETag`/`sha256`), extrai os arquivos com segurança e apaga jogos removidos. | **React:** Indicador de status na barra superior e view `Sincronizacao`.<br>**Fastify:** Módulo background Sincronizador e rotas internas de checagem.<br>**Disco:** `catalogo.json`, descompactação em `jogos/<id>/<versao>/` e renomeação atômica.<br>**APIs externas (G1):** `GET /api/jogos` e `GET /api/jogos/{id}/pacote` com cabeçalhos `If-None-Match` e `X-Sha256`. |
| **F5: Registro de voto e enfileiramento de resultados offline** (Prioridade 5) | Jogador, Curador (G1) e Operador | Salva a partida no histórico local com escrita segura (`partidas.jsonl`), coleta nota de 1 a 5 estrelas pulável com uma tecla, e enfileira o envio para a API central com espera progressiva e chave de idempotência (`id_partida`), evitando perda ou duplicidade de dados em quedas de rede. | **React:** View `FimPartida` (placar, estrelas de 1 a 5, comentário opcional, botão pular).<br>**Fastify:** Rota interna de registro de placar e worker da fila de reenvio.<br>**Disco:** `partidas.jsonl` (append-only), pastas `fila/` e `enviadas/`.<br>**APIs externas (G1):** `POST /api/placares` com autenticação Bearer de estação (`est_...`) e tratamento de resposta 200/201. |
| **F1: Atração e inicialização autônoma do quiosque** (Prioridade 6) | Operador do quiosque e Jogador | Inicia o sistema operacional direto na tela de demonstração ao ligar na tomada, exibe animação atrativa e mapa de teclas, bloqueia tentativas de saída para a área de trabalho (kiosk restrito) e retorna à tela inicial após inatividade no painel. | **React:** View `Atracao`, View `MapaTeclas`, timer de inatividade (60 s / 20 s).<br>**Fastify:** Rota de integridade do servidor local e carregamento de configurações de boot.<br>**Disco:** Arquivo `teclas.json`, scripts de inicialização do sistema (systemd/autostart).<br>**Ambiente:** Chromium em modo `--kiosk`, interceptação de atalhos de saída (`Alt+F4`, `Ctrl+W`, `F11`). |

---

## 3. Detalhamento dos Fluxos Verticais

### F4: Execução isolada em iframe com captura de pontuação via SDK

- **Problema resolvido:** Jogos desenvolvidos por terceiros podem falhar, conter códigos inseguros ou monopolizar recursos. O quiosque precisa de um ambiente controlado para rodar qualquer jogo web aprovado sem expor dados internos e sem degradar a memória da máquina ao longo do recreio.
- **Quem usa:**
  - *Jogador:* joga a partida em tela cheia com comandos responsivos e visualização de tempo e pontuação.
  - *Desenvolvedor do jogo (G4):* integra seu jogo ao fliperama por meio do contrato de mensagens padronizado.
- **Resultado entregue:**
  1. O usuário aciona "Jogar" no painel.
  2. O React monta um `<iframe sandbox="allow-scripts">` (sem `allow-same-origin`) apontando para o servidor local Fastify.
  3. O fliperama envia a mensagem `ARCADE_INIT` com apelido do jogador, melhores recordes daquele jogo e o estado de áudio ativo.
  4. O jogo executa e, ao ser finalizado pelo jogador, envia o evento `postMessage` com o tipo `PLACAR` contendo pontos, acertos, erros e duração.
  5. Caso o jogo trave por mais de 15 segundos na carga ou ultrapasse 5 minutos, o supervisor encerra a sessão por timeout com aviso ao usuário.
  6. Ao receber o placar ou atingir o encerramento, o React desmonta o iframe do DOM e aciona limpeza de memória, encaminhando o fluxo para a tela de encerramento.
- **Partes do sistema envolvidas:**
  - *Telas React:* View `EmJogo`, banner fixo de instrução de saída e controle de volume global.
  - *Rotas Fastify:* Servidor estático isolado servindo os arquivos descompactados do jogo em `/jogos/:id/:versao/*`.
  - *Disco local:* Diretório `/var/lib/recreio-arcade/jogos/<jogo-id>/<versao>/`.
  - *Contratos:* Mensagens `ARCADE_INIT`, `ARCADE_MUDO` e `PLACAR` (RF-L05, RF-L06, RF-L10, RF-L16, RF-L22, RF-L23).

---

### F3: Navegação e seleção no catálogo de jogos locais

- **Problema resolvido:** O quiosque de pátio opera com teclado simples de computador, sem mouse. Os alunos precisam encontrar jogos de forma rápida e visual a até dois metros de distância, mesmo quando o cabo de rede estiver desconectado.
- **Quem usa:**
  - *Jogador:* navega pelas opções, confere instruções e seleciona o título desejado.
- **Resultado entregue:**
  1. O painel apresenta uma grade de cards legíveis em resolução 1024×768 (4:3), com alto contraste.
  2. Cada card traz título, capa, desenvolvedores, controles de jogo, tema e nível.
  3. A navegação ocorre exclusivamente pelas setas direcionais, mantendo sempre um item com foco visual destacado.
  4. O jogador pode aplicar filtros rápidos por tema com atalhos de teclado.
  5. Ao pressionar Enter sobre um jogo selecionado, o sistema avança para a tela de identificação ou direto para a partida caso já identificado.
  6. Todas as informações e imagens são lidas do cache local, garantindo tempo de resposta abaixo de 150 ms sem requisições externas.
- **Partes do sistema envolvidas:**
  - *Telas React:* View `PainelSelecao`, componente de card de jogo com foco ativo, indicador de modo offline na barra de topo.
  - *Rotas Fastify:* Rota local `GET /api/jogos` servindo o arquivo compilado e rota de assets locais para as capas dos jogos.
  - *Disco local:* Arquivo `/var/lib/recreio-arcade/catalogo.json` e diretórios de assets.
  - *Requisitos associados:* RF-L02, RF-L03, RF-L11, RF-L14.

---

### F2: Identificação do jogador com validação de apelido

- **Problema resolvido:** O ranking escolar precisa indicar os melhores jogadores sem exigir cadastros demorados, sem expor dados pessoais (LGPD) e sem permitir nomes pejorativos ou ofensivos no monitor público.
- **Quem usa:**
  - *Jogador:* digita ou monta seu apelido antes de começar a jogar.
- **Resultado entregue:**
  1. O sistema solicita um apelido de até 9 caracteres (`A-Z`, `0-9`).
  2. O aluno pode digitar diretamente pelo teclado alfanumérico ou selecionar caracteres com as setas para cima/baixo e avançar com Enter.
  3. Pressionar Enter com o campo vazio define automaticamente o jogador como `ANON` (modo anônimo, que participa da partida mas não entra na disputa de ranking oficial).
  4. O sistema converte automaticamente minúsculas em maiúsculas.
  5. Se o apelido coincidir com termos da lista de bloqueio configurada no quiosque, uma mensagem orienta o jogador a escolher outro nome, sem exibir detalhes técnicos.
  6. O apelido validado é gravado no estado da sessão e segue para a partida ativa.
- **Partes do sistema envolvidas:**
  - *Telas React:* View `Identificacao`, teclado virtual auxiliar para setas, campo de entrada com foco forçado e mensagens amigáveis.
  - *Rotas Fastify:* Rota ou validador local de termos bloqueados e sanitização de string.
  - *Disco local:* Arquivo de configuração `config.json` contendo a lista de palavras bloqueadas.
  - *Requisitos associados:* RF-L04, RF-L24, RF-L26.

---

### F6: Sincronização de catálogo e download de zips com a gestão central

- **Problema resolvido:** A atualização manual de jogos via pendrive em quiosques de campo é lenta e sujeita a falhas. O fliperama precisa baixar novos jogos aprovados e descartar títulos reprovados pela curadoria de forma transparente.
- **Quem usa:**
  - *Operador do quiosque:* acompanha o estado das atualizações e espaço em disco.
  - *Curador (G1):* publica versões aprovadas no portal web que chegam automaticamente à máquina física.
  - *Jogador:* recebe jogos novos e versões corrigidas sem precisar esperar manutenções manuais.
- **Resultado entregue:**
  1. Em intervalos regulares (ou no boot), o fliperama consulta `GET /api/jogos` na API de Gestão.
  2. O sistema compara o hash SHA-256 de cada jogo remoto com o hash salvo no `catalogo.json` local.
  3. Se houver versão nova ou ausente, faz o download do arquivo compactado em `GET /api/jogos/{id}/pacote` usando o cabeçalho `If-None-Match`. Se o pacote não mudou, o servidor responde `304 Not Modified` e nenhum dado é transmitido.
  4. Ao baixar o zip, confere o hash SHA-256 com o cabeçalho `X-Sha256`. Se o hash não bater, descarta o arquivo corrompido.
  5. Extrai os arquivos na pasta `jogos/<id>/<versao>/` com escrita atômica e atualiza o `catalogo.json`.
  6. Jogos que saíram do catálogo oficial são removidos do disco para preservar o armazenamento de 200 GB.
  7. Se a rede estiver indisponível, mantém a versão local intacta sem travar o quiosque.
- **Partes do sistema envolvidas:**
  - *Telas React:* Indicador de sincronização na barra de status e tela de diagnóstico do operador.
  - *Rotas Fastify:* Módulo de sincronização agendada e rota local `/api/sync/status`.
  - *Disco local:* Arquivo `catalogo.json`, pasta de extração `/var/lib/recreio-arcade/jogos/` e escrita atômica com arquivo `.tmp`.
  - *APIs externas (G1):* `GET /api/jogos`, `GET /api/jogos/{id}/pacote`, `GET /api/ranking/jogos`.
  - *Requisitos associados:* RF-L01, RF-L15, RF-L20.

---

### F5: Registro de voto e enfileiramento de resultados offline

- **Problema resolvido:** A rede Wi-Fi do pátio pode oscilar durante o recreio. As pontuações e as avaliações pedagógicas dos alunos não podem ser descartadas nem duplicadas ao restabelecer a conexão.
- **Quem usa:**
  - *Jogador:* avalia a diversão do jogo com nota de 1 a 5 e vê seu resultado local.
  - *Curador / Administradores (G1):* recebem métricas confiáveis para o ranking oficial e relatórios do projeto de extensão.
- **Resultado entregue:**
  1. Ao término da partida, a tela de encerramento exibe a pontuação final e o ranking offline atualizado (combinando dados locais e a última versão oficial).
  2. Apresenta a coleta de voto (1 a 5 estrelas) e comentário opcional, com opção de pular imediatamente com a tecla Enter ou seta.
  3. Gera um identificador único de partida (`id_partida`, UUID v4).
  4. Grava imediatamente a linha da partida em `partidas.jsonl` de forma append-only.
  5. Grava o payload completo em `fila/<id_partida>.json`.
  6. Tenta enviar para a Plataforma de Gestão via `POST /api/placares` com autenticação de estação (`Bearer est_...`).
  7. Se houver conexão, o servidor processa e responde status 201 (ou 200 caso já enviada anteriormente). O fliperama move o arquivo para `enviadas/<id_partida>.json`.
  8. Se a requisição falhar (queda de rede), a pendência permanece em disco e o processo de segundo plano tenta o reenvio com intervalo progressivo (5 s, 15 s, 1 min, 5 min) sem duplicar registros no servidor.
- **Partes do sistema envolvidas:**
  - *Telas React:* View `FimPartida`, componente de estrelas (1 a 5), campo de texto curto opcional e botão "Pular".
  - *Rotas Fastify:* Rota local receptora de placar, serviço de fila em disco e agendador de reenvio com backoff.
  - *Disco local:* Arquivos `/var/lib/recreio-arcade/partidas.jsonl`, `/fila/<id_partida>.json` e `/enviadas/<id_partida>.json`.
  - *APIs externas (G1):* Rota `POST /api/placares` com cabeçalho `Authorization: Bearer est_...`.
  - *Requisitos associados:* RF-L06, RF-L07, RF-L08, RF-L15, RF-L17, RF-L18.

---

### F1: Atração e inicialização autônoma do quiosque

- **Problema resolvido:** O fliperama fica em área aberta no pátio do instituto. Ele não pode depender de teclado com mouse, não pode exibir a área de trabalho do Linux em caso de cliques acidentais e precisa retomar a atração visual quando os alunos deixam a máquina ociosa.
- **Quem usa:**
  - *Operador do quiosque:* apenas liga o cabo de força na tomada pela manhã e desliga no fim do expediente.
  - *Jogador no pátio:* é convidado a jogar pelas chamadas visuais e instruções da tela de atração.
- **Resultado entregue:**
  1. Ao ligar a máquina na tomada, scripts de boot sobem o serviço Fastify e iniciam o navegador Chromium diretamente em tela cheia com a opção `--kiosk`.
  2. O quiosque abre imediatamente na tela de Atração com demonstração visual, instruções em alto contraste e mapa das teclas ativas.
  3. Todos os atalhos de saída do sistema operacional (`Alt+F4`, `Ctrl+W`, `Ctrl+T`, `F11`, `Alt+Tab`) são interceptados e bloqueados.
  4. Se o jogador parar de interagir no painel de seleção por mais de 60 segundos, o sistema limpa a sessão e retorna à tela de atração.
  5. Se uma tecla física falhar, o operador ou jogador pode acessar o remapeamento e persistir a nova tecla no `teclas.json`.
  6. Caso o navegador feche por erro de processo, o supervisor local reinicia a interface automaticamente.
- **Partes do sistema envolvidas:**
  - *Telas React:* View `Atracao`, View `MapaTeclas`, hook global de inatividade e listener de bloqueio de atalhos.
  - *Rotas Fastify:* Rotas de suporte à configuração de teclas `/api/teclas` e integridade `/api/health`.
  - *Disco local:* Arquivo `teclas.json`, script de inicialização do sistema operacional Linux.
  - *Ambiente:* Janela do Chromium com flags restritivas de kiosk.
  - *Requisitos associados:* RF-L09, RF-L11, RF-L12, RF-L13, RF-L19.

---

## 4. Rastreabilidade com os Requisitos do G3

| Feature | Requisitos Funcionais Atendidos | Requisitos Não Funcionais Atendidos | Histórias de Usuário Associadas (Backlog) | Entrega Marco |
| --- | --- | --- | --- | --- |
| **F4: Execução isolada e captura de placar** | RF-L05, RF-L06, RF-L10, RF-L16, RF-L22, RF-L23 | RNF-L02, RNF-L03, RNF-L06 | US-15, US-16, US-17, US-19, US-20, US-21 | E1 / E2 |
| **F3: Navegação e seleção no catálogo** | RF-L02, RF-L03, RF-L11, RF-L14 | RNF-L01, RNF-L07 | US-02, US-07, US-10, US-12 | E1 / E2 |
| **F2: Identificação do jogador** | RF-L04, RF-L24, RF-L26 | RNF-L07, RNF-L10 | US-08, US-14 | E1 / E2 |
| **F6: Sincronização com gestão central** | RF-L01, RF-L15, RF-L20 | RNF-L04, RNF-L08, RNF-L09 | US-01, US-04, US-06 | E2 |
| **F5: Registro de voto e fila offline** | RF-L06, RF-L07, RF-L08, RF-L15, RF-L17, RF-L18 | RNF-L04, RNF-L05 | US-03, US-04, US-13, US-22, US-23 | E2 / E3 |
| **F1: Atração e quiosque autônomo** | RF-L09, RF-L11, RF-L12, RF-L13, RF-L19 | RNF-L04, RNF-L05, RNF-L07 | US-05, US-09, US-11, US-18 | E3 |

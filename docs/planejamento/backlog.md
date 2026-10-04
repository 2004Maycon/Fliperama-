# Planejamento Scrum: Fliperama Local (G3)

> Planejamento ágil baseado no modelo do curso `scrum-planejamento-template.md`.

---

## 1. Visão Geral do Planejamento

| Campo | Descrição |
| --- | --- |
| Nome do Produto | Fliperama Local (G3): Recreio Arcade |
| Equipe | Grupo G3 (César Augusto, João Victor, Matheus Fragoso, Maycon Silva) |
| Product Owner | - |
| Scrum Master | - |
| Data de Início | 03/08/2026 |
| Objetivo Geral | Construir um quiosque de fliperama para o pátio do IFES que funcione offline e em modo kiosk, baixe jogos aprovados da Plataforma de Gestão central (G1), rode cada jogo em sandbox seguro, registre pontuações via postMessage (G4) e colete avaliações dos alunos para a disciplina de Extensão. |

### Restrições da Máquina de Destino

| Item | Valor |
| --- | --- |
| Sistema Operacional | Linux (distribuição enxuta) |
| Memória RAM | 4 GB compartilhados entre sistema, Fastify, Chromium kiosk e aba do jogo |
| Disco | 200 GB (disco rígido) |
| Entrada | Teclado comum de PC, sem mouse |
| Vídeo | Resolução a partir de 1024×768 em proporção 4:3, legível a 2 metros sob luz externa |
| Execução | Chromium em modo kiosk servido localmente via Node.js e Fastify |

---

## 2. Backlog do Produto

> Backlog do produto organizado em épicos para grandes blocos de entrega e histórias de usuário (US) para fluxos específicos.

### Tabela Geral do Backlog

| ID | US/EPIC | Descrição | Importância | Status |
| --- | --- | --- | --- | --- |
| EPIC-01 | EPIC | Sincronização e Operação Autônoma Offline | Alta | Em andamento |
| EPIC-02 | EPIC | Experiência do Jogador e Seleção de Jogos | Alta | Em andamento |
| EPIC-03 | EPIC | Execução Segura e Captura de Placar | Alta | Em andamento |
| EPIC-04 | EPIC | Avaliação, Fila de Resultados e Métricas | Média | Pendente |
| US-01 | US | Sincronizar catálogo de jogos com a API central (download, validação sha256 e extração) | Alta | Em andamento |
| US-02 | US | Operar offline com jogos armazenados no cache local | Alta | Em andamento |
| US-03 | US | Reenviar placares pendentes da fila local com idempotência por id_partida | Alta | Em andamento |
| US-04 | US | Persistir dados em disco com escrita atômica e formato append-only | Alta | Em andamento |
| US-05 | US | Iniciar direto na tela de atração ao ligar o computador na tomada | Média | Pendente |
| US-06 | US | Carregar configurações externas (URL da API, token de estação e intervalos) | Alta | Em andamento |
| US-07 | US | Exibir painel de seleção em grade com capa, nome, autores e controles | Alta | Em andamento |
| US-08 | US | Identificar jogador por matrícula (12 dígitos) e apelido (até 9 caracteres), com opção anônima | Alta | Em andamento |
| US-09 | US | Voltar à tela de atração por inatividade no painel e na tela de fim de jogo | Média | Pendente |
| US-10 | US | Navegar por todo o sistema usando apenas teclado (setas e Enter, foco visual) | Alta | Em andamento |
| US-11 | US | Exibir mapa de teclas na atração e permitir remapeamento persistente | Média | Pendente |
| US-12 | US | Manter resolução mínima de 1024×768 (4:3) e contraste legível a 2 metros | Média | Pendente |
| US-13 | US | Exibir ranking offline combinando partidas locais com ranking oficial sincronizado | Média | Pendente |
| US-14 | US | Exibir mensagens de erro claras, sem termos técnicos ou códigos HTTP | Média | Em andamento |
| US-15 | US | Rodar o jogo em tela cheia dentro de iframe isolado (sandbox sem same-origin) | Alta | Concluído |
| US-16 | US | Capturar placar via postMessage conferindo a origem e o jogo em execução | Alta | Concluído |
| US-17 | US | Remover iframe e liberar memória RAM ao fim de cada partida | Alta | Em andamento |
| US-18 | US | Bloquear atalhos de saída do sistema operacional (modo kiosk restrito) | Alta | Pendente |
| US-19 | US | Enviar ARCADE_INIT sem identificação prévia (mudo false e recordes vazios) | Média | Em andamento |
| US-20 | US | Encerrar partidas por timeout (15 s para carregar, 5 min de jogo) com log | Média | Pendente |
| US-21 | US | Alternar mudo global por tecla dedicada e manter estado entre partidas (ARCADE_MUDO) | Média | Pendente |
| US-22 | US | Coletar nota de 1 a 5 e comentário ao fim da partida, com tecla para pular | Alta | Em andamento |
| US-23 | US | Salvar histórico de partidas em partidas.jsonl | Alta | Em andamento |
| US-24 | US | Abrir tela de diagnóstico por atalho reservado de teclas | Baixa | Pendente |
| US-25 | US | Exportar relatório da sessão em JSON e CSV para alimentar docs/campo.md | Baixa | Pendente |

---

### Mapeamento dos Épicos e Requisitos Funcionais (RF-L01 a RF-L26)

#### EPIC-01: Sincronização e Operação Autônoma Offline

Baixar, armazenar e manter jogos atualizados a partir do servidor central, com funcionamento contínuo mesmo sem conexão de rede.

| Requisito | Resumo |
| --- | --- |
| RF-L01 | Sincronizar com a gestão (download de pacotes, cache local) |
| RF-L02 | Operar offline (jogos já baixados continuam jogáveis) |
| RF-L08 | Fila de reenvio (persistir e reenviar placares com espera crescente, idempotência por `id_partida`) |
| RF-L15 | Persistência em disco (JSON/JSONL, escrita atômica com arquivo temporário e renomeação) |
| RF-L19 | Boot automático (iniciar na tela de atração ao ligar na tomada) |
| RF-L20 | Arquivo de configuração (URL, token de estação e intervalo de sync fora do código) |

#### EPIC-02: Experiência do Jogador e Seleção de Jogos

Interface legível a distância e controlada só por teclado, desde a tela de atração até a escolha do jogo.

| Requisito | Resumo |
| --- | --- |
| RF-L03 | Painel de seleção (nome, autores, controles, capa, busca/filtro) |
| RF-L04 | Identificação do jogador (apelido de até 9 caracteres) |
| RF-L09 | Retorno automático à atração (timeout sem interação) |
| RF-L11 | 100% teclado (setas + Enter, foco visual ativo permanente) |
| RF-L13 | Mapa de teclas e suporte a remapeamento |
| RF-L14 | Resolução mínima (1024×768, 4:3, alto contraste) |
| RF-L18 | Ranking offline (exibição mesmo sem rede, indicando origem dos dados) |
| RF-L24 | Erros em linguagem de jogador (mensagens amigáveis) |
| RF-L26 | Barrar apelido ofensivo (lista de bloqueio no arquivo de configuração) |

#### EPIC-03: Execução Segura e Captura de Placar

Executar jogos em iframe isolado (`sandbox`), capturar pontuações por postMessage e liberar recursos ao encerrar cada partida.

| Requisito | Resumo |
| --- | --- |
| RF-L05 | Execução do jogo (a partir do cache, tela cheia, saída visível) |
| RF-L06 | Captura de placar (protocolo `postMessage`, mensagem `PLACAR`) |
| RF-L10 | Encerramento limpo do jogo (remoção do iframe, liberação de memória RAM) |
| RF-L12 | Kiosk restrito (bloqueio de atalhos do SO para fechar abas ou sair de tela cheia) |
| RF-L16 | Dados somente-leitura para o jogo (apelido e recordes via SDK) |
| RF-L22 | Timeout de jogo (15 s para carga, 5 min para partida, com log) |
| RF-L23 | Mudo global (tecla única, estado retido entre partidas) |

#### EPIC-04: Avaliação, Fila de Resultados e Métricas

Coletar votos dos alunos, registrar histórico de partidas em disco e gerar dados para o relatório de campo.

| Requisito | Resumo |
| --- | --- |
| RF-L07 | Voto ao fim da partida (nota 1 a 5, comentário opcional, pulável com tecla única) |
| RF-L17 | Histórico de partidas em disco (ranking local combinando `partidas.jsonl` com ranking oficial) |
| RF-L21 | Tela de diagnóstico (combinação reservada: conectividade, sync, fila, disco) |
| RF-L25 | Exportar relatório da sessão (JSON/CSV para alimentar `docs/campo.md`) |

> Todos os 26 requisitos funcionais (RF-L01 a RF-L26) estão distribuídos nos quatro épicos.

---

### Detalhamento das Histórias de Usuário e Critérios de Aceitação

#### EPIC-01: Sincronização e Operação Autônoma Offline

##### US-01: Sincronizar catálogo de jogos

* **Como** fliperama, **quero** consultar o catálogo da API (`GET /api/jogos`) e baixar pacotes novos ou atualizados, **para que** o painel mostre os jogos aprovados.
* **Requisitos:** RF-L01, RF-L15 (parcial)
* **Critérios de aceitação:**
  1. Consultar `GET /api/jogos` e comparar o `sha256` de cada jogo com o arquivo local em disco.
  2. Se o hash for diferente ou o jogo não existir localmente, baixar o pacote por `pacote_url`, enviando `If-None-Match: "<sha256 local>"` (aceitando resposta `304 Not Modified`).
  3. Conferir o hash `sha256` do zip baixado com o cabeçalho `X-Sha256`; descartar o arquivo se houver divergência.
  4. Descompactar o pacote em `jogos/<jogo-id>/<versao>/`, mantendo `index.html` e `game.json` na raiz da pasta.
  5. Atualizar `catalogo.json` com gravação atômica (arquivo temporário e renomeação).
  6. Apagar do disco os jogos que saíram do catálogo da API.
  7. Se a rede falhar, manter o catálogo local existente sem alterações.

##### US-02: Operar offline com jogos em cache

* **Como** jogador, **quero** continuar jogando mesmo sem internet, **para que** o quiosque funcione no pátio sem depender da rede.
* **Requisito:** RF-L02
* **Critérios de aceitação:**
  1. Listar e rodar todos os jogos já baixados mesmo sem conexão ativa.
  2. Mostrar na barra de status que a máquina está operando offline.
  3. Salvar placares de partidas offline na fila local sem interromper a navegação.

##### US-03: Reenviar placares pendentes com idempotência

* **Como** fliperama, **quero** salvar placares pendentes em disco e reenviá-los com espera crescente, **para que** nenhuma partida se perca por instabilidade na rede.
* **Requisito:** RF-L08
* **Critérios de aceitação:**
  1. Gravar cada placar pendente em um arquivo próprio em `fila/<id_partida>.json` por escrita atômica.
  2. Usar intervalos progressivos de reenvio: 5 s, 15 s, 1 min e 5 min.
  3. Enviar a requisição `POST /api/placares` com o mesmo `id_partida` (UUID); tratar retorno HTTP `200` com `"duplicada": true` como sucesso.
  4. Mover o arquivo confirmado para a pasta `enviadas/`.
  5. Reenvios duplicados não podem alterar pontuações ou rankings no servidor.

##### US-04: Armazenar dados com integridade (persistência em disco)

* **Como** fliperama, **quero** que os arquivos sobrevivam a desligamentos repentinos da tomada, **para que** nenhuma partida salva seja corrompida.
* **Requisito:** RF-L15
* **Critérios de aceitação:**
  1. Gravar arquivos de estado (`catalogo.json`, `ranking-oficial.json`, `teclas.json`) usando arquivo temporário seguido de renomeação atômica.
  2. Adicionar novas partidas ao final de `partidas.jsonl` (formato append-only, uma linha por registro).
  3. Reiniciar o sistema sem perda de dados após queda súbita de energia.

##### US-05: Iniciar automaticamente na tela de atração (boot automático)

* **Como** operador, **quero** que o fliperama abra direto na tela de atração ao ligar o computador, **para que** não seja necessária intervenção manual.
* **Requisito:** RF-L19
* **Critérios de aceitação:**
  1. Carregar o sistema operacional, iniciar o servidor Fastify e abrir o Chromium em modo kiosk assim que a máquina ligar.
  2. Apresentar a tela de atração logo após o carregamento inicial.
  3. Funcionar sem login, cliques de mouse ou comandos manuais no teclado.

##### US-06: Carregar configuração externa

* **Como** operador, **quero** definir URL da API, token de estação e intervalos em arquivo externo, **para que** essas variáveis fiquem fora do código e do navegador.
* **Requisito:** RF-L20
* **Critérios de aceitação:**
  1. Ler configurações externas (arquivo `config.json` ou variáveis de ambiente) com URL da API, token da estação (`est_...`) e intervalo de sincronização.
  2. Carregar as variáveis no servidor Fastify durante o boot e repassá-las aos módulos de sincronização e fila.
  3. Aplicar alterações de configuração ao reiniciar o servidor, sem recompilar o projeto.

---

#### EPIC-02: Experiência do Jogador e Seleção de Jogos

##### US-07: Exibir painel de seleção de jogos

* **Como** jogador, **quero** ver uma grade com capa, nome, autores e controles dos jogos, **para que** eu escolha rápido o que jogar.
* **Requisito:** RF-L03
* **Critérios de aceitação:**
  1. Exibir os jogos do `catalogo.json` em grade navegável.
  2. Mostrar em cada card a capa, o título, os autores e os comandos básicos.
  3. Permitir busca rápida ou filtro por tema.
  4. Navegar inteiramente por setas e Enter.
  5. Destacar visualmente o card com foco ativo.

##### US-08: Identificar o jogador por matrícula e apelido

* **Como** jogador, **quero** informar minha matrícula e apelido após a partida, **para que** minha pontuação seja associada ao ranking oficial do IFES sem bloquear o início do jogo.
* **Requisitos:** RF-L04, RF-L26
* **Critérios de aceitação:**
  1. Coletar matrícula institucional de 12 dígitos numéricos e apelido de até 9 caracteres alfanuméricos (`A-Z`, `0-9`).
  2. Apresentar a identificação ao final da sessão, permitindo jogar direto pelo catálogo sem cadastro prévio.
  3. Preencher automaticamente com `ANON` caso o apelido fique em branco.
  4. Bloquear palavras da lista de termos ofensivos com aviso amigável.
  5. Permitir pular a identificação caso o jogador não queira registrar o placar no ranking.

##### US-09: Retornar à atração por inatividade

* **Como** fliperama, **quero** voltar à tela de atração após determinado tempo sem interação, **para que** a máquina não fique presa em telas internas.
* **Requisito:** RF-L09
* **Critérios de aceitação:**
  1. Voltar à tela de atração após 60 segundos sem comandos de teclado no painel de seleção.
  2. Voltar à tela de atração após 20 segundos sem comandos na tela de fim de partida.
  3. Limpar o apelido da sessão ao retornar para a tela de atração.

##### US-10: Garantir navegação 100% por teclado

* **Como** jogador, **quero** navegar por todas as telas apenas com setas e Enter, **para que** eu não dependa de mouse.
* **Requisito:** RF-L11
* **Critérios de aceitação:**
  1. Permitir navegação por setas e Enter em todas as telas da plataforma.
  2. Manter foco visual ativo em pelo menos um elemento interativo da tela.
  3. Operar o fluxo principal sem mouse ou ponteiro.

##### US-11: Exibir mapa de teclas e permitir remapeamento

* **Como** jogador ou operador, **quero** ver as teclas mapeadas e poder reconfigurar teclas defeituosas, **para que** o fliperama continue operacional.
* **Requisito:** RF-L13
* **Critérios de aceitação:**
  1. Exibir o mapa de teclas ativas na tela de atração.
  2. Permitir remapear comandos caso uma tecla física pare de responder.
  3. Salvar o mapeamento em `teclas.json` e manter a configuração após reiniciar.

##### US-12: Garantir resolução e contraste mínimos

* **Como** jogador, **quero** textos e elementos legíveis a 2 metros sob a luz do pátio, **para que** eu consiga usar o fliperama sem dificuldade visual.
* **Requisito:** RF-L14
* **Critérios de aceitação:**
  1. Adaptar o layout para resoluções a partir de 1024×768 na proporção 4:3.
  2. Usar alto contraste em fundos e elementos interativos.
  3. Dimensionar textos e ícones para leitura a 2 metros de distância.

##### US-13: Exibir ranking offline

* **Como** jogador, **quero** ver o ranking mesmo quando a máquina estiver sem rede, **para que** eu conheça a pontuação a bater.
* **Requisito:** RF-L18
* **Critérios de aceitação:**
  1. Montar o ranking combinando `partidas.jsonl` com `ranking-oficial.json` da última sincronização.
  2. Identificar na tela se as pontuações são oficiais ou dados locais ainda não sincronizados.
  3. Atualizar o ranking oficial quando a conexão com o servidor estiver ativa.

##### US-14: Exibir erros em linguagem de jogador

* **Como** jogador, **quero** que mensagens de erro sejam claras e amigáveis, **para que** eu compreenda a situação sem jargões técnicos.
* **Requisito:** RF-L24
* **Critérios de aceitação:**
  1. Ocultar stack traces, códigos HTTP e erros de sistema na interface.
  2. Apresentar orientações diretas e linguagem simples para falhas comuns.
  3. Gravar dados técnicos e respostas originais apenas nos arquivos de log.

---

#### EPIC-03: Execução Segura e Captura de Placar

##### US-15: Executar jogo em iframe isolado

* **Como** jogador, **quero** que o jogo abra em tela cheia com instrução clara de saída, **para que** eu possa jogar com imersão e sair quando quiser.
* **Requisito:** RF-L05
* **Critérios de aceitação:**
  1. Carregar o jogo do cache local em `<iframe sandbox>` sem `allow-same-origin`.
  2. Ocupar toda a área de exibição da tela.
  3. Mostrar instrução visível com o atalho para abandonar a partida.
  4. Servir os arquivos do jogo pelo servidor Fastify local.

##### US-16: Capturar placar via postMessage

* **Como** fliperama, **quero** receber o placar do jogo via `postMessage`, **para que** a pontuação seja registrada automaticamente ao fim da partida.
* **Requisito:** RF-L06
* **Critérios de aceitação:**
  1. Ouvir eventos disparados por `window.addEventListener('message', ...)`.
  2. Validar se `event.source === iframe.contentWindow`, se `event.data.jogo` corresponde ao jogo ativo e se o esquema e a pontuação são válidos; não usar `event.origin === "null"` como autenticação sob sandbox sem `allow-same-origin`.
  3. Coletar `PLACAR` (protocolo oficial G4, pontuação finita e não negativa em `payload.pontos`) e `GAME_OVER` (compatibilidade, pontuação em `payload.score`), ambos com `jogo` no nível superior.
  4. Anexar `jogador`, `id_partida` (UUID) e `jogado_em` antes de salvar e enviar.

##### US-17: Encerrar jogo e liberar memória

* **Como** fliperama, **quero** remover o iframe e liberar memória ao final de cada partida, **para que** o consumo de RAM não aumente com o tempo.
* **Requisito:** RF-L10
* **Critérios de aceitação:**
  1. Destruir e retirar o iframe do DOM ao terminar a partida (por placar, desistência ou timeout).
  2. Manter o uso de RAM estável nos níveis de referência após três partidas consecutivas.

##### US-18: Bloquear atalhos de fuga (modo kiosk)

* **Como** operador, **quero** impedir a saída do navegador para a área de trabalho, **para que** a máquina funcione com segurança no pátio.
* **Requisito:** RF-L12
* **Critérios de aceitação:**
  1. Interceptar atalhos de saída (`Ctrl+W`, `Alt+F4`, `F11`, `Alt+Tab`) no navegador.
  2. Manter a navegação restrita à aplicação do fliperama.
  3. Reiniciar o Chromium automaticamente caso o processo feche inesperadamente.

##### US-19: Fornecer dados somente-leitura ao jogo

* **Como** jogo (G4), **quero** receber o estado inicial de áudio e a lista de recordes ao iniciar a partida, **para que** eu personalize a rodada sem depender da identificação antecipada.
* **Requisito:** RF-L16
* **Critérios de aceitação:**
  1. Após o iframe terminar de carregar, enviar uma única mensagem `ARCADE_INIT` ao iframe ativo com `{ type: "ARCADE_INIT", mudo: false, recordes: [] }`, sem matrícula ou apelido.
  2. Não enviar a mensagem se o iframe estiver ausente, desconectado ou tiver sido substituído antes do carregamento.
  3. Executar jogos em iframe com `sandbox="allow-scripts"` apenas, sem `allow-same-origin`, permissão de pop-up ou navegação no contexto superior.
  4. Para mensagens recebidas, validar `event.source === iframe.contentWindow`, `event.data.jogo` contra o jogo ativo e o esquema/pontuação; não confiar em `event.origin === "null"`.
  5. Continuar capturando `PLACAR` oficial em `payload.pontos` e `GAME_OVER` legado em `payload.score`, ambos com `jogo` correspondente ao jogo ativo.
  6. Preservar o fluxo em que matrícula e apelido são coletados somente após a partida.
  7. Tratar os dados iniciais como somente-leitura, sem permitir alterações no estado interno da plataforma.
  8. Os testes automatizados no Node Test Runner cobrem o payload inicial, supressão quando iframe ausente/substituído, configuração do sandbox e recebimento/rejeição de mensagens de placar.

##### US-20: Encerrar jogos por timeout

* **Como** fliperama, **quero** encerrar automaticamente jogos que travarem na inicialização ou durarem tempo excessivo, **para que** a máquina não fique presa.
* **Requisito:** RF-L22
* **Critérios de aceitação:**
  1. Encerrar o jogo e voltar ao painel se o carregamento demorar mais de 15 segundos.
  2. Finalizar partidas que ultrapassarem 5 minutos de duração.
  3. Registrar o motivo do encerramento no log da sessão.
  4. Informar o jogador com mensagem clara na tela.

##### US-21: Controlar mudo global

* **Como** jogador, **quero** alternar o áudio com uma tecla dedicada, **para que** seja possível silenciar o quiosque rapidamente.
* **Requisito:** RF-L23
* **Critérios de aceitação:**
  1. Alternar mudo ligado e desligado por tecla única.
  2. Manter o estado do áudio entre partidas consecutivas.
  3. Enviar mensagem `ARCADE_MUDO` via `postMessage` para o iframe durante o jogo.

---

#### EPIC-04: Avaliação, Fila de Resultados e Métricas

##### US-22: Coletar voto ao fim da partida

* **Como** jogador, **quero** atribuir uma nota de 1 a 5 e um comentário opcional após jogar, **para que** os jogos recebam avaliação da comunidade escolar.
* **Requisito:** RF-L07
* **Critérios de aceitação:**
  1. Apresentar opções de nota de 1 a 5 estrelas e campo de comentário na tela de fim de partida.
  2. Permitir pular a avaliação com uma tecla única.
  3. Anexar os dados ao placar no bloco `feedback: { nota, comentario }` enviado à API.
  4. Sobrescrever avaliações anteriores se o mesmo jogador votar novamente no mesmo jogo.

##### US-23: Manter histórico local de partidas

* **Como** fliperama, **quero** salvar todas as partidas em `partidas.jsonl`, **para que** o histórico local e os relatórios de campo tenham base consistente.
* **Requisito:** RF-L17
* **Critérios de aceitação:**
  1. Adicionar cada partida como uma nova linha em `partidas.jsonl` (append-only).
  2. Recalcular o ranking local a partir das linhas de `partidas.jsonl`.
  3. Gravar `id_partida`, `jogo`, `jogador`, `pontos`, `duracao_s`, `acertos`, `erros` e `jogado_em`.

##### US-24: Exibir tela de diagnóstico

* **Como** operador, **quero** abrir uma tela de diagnóstico via atalho reservado de teclas, **para que** eu verifique o status do sistema sem terminal.
* **Requisito:** RF-L21
* **Critérios de aceitação:**
  1. Abrir modal de diagnóstico por combinação reservada de teclas.
  2. Exibir estado de conexão, data e hora da última sincronização, contagem da fila e espaço em disco.
  3. Fechar a tela pelo mesmo atalho ou com a tecla Esc.

##### US-25: Exportar relatório da sessão

* **Como** operador, **quero** exportar as partidas em JSON e CSV, **para que** os dados alimentem o relatório de campo `docs/campo.md`.
* **Requisito:** RF-L25
* **Critérios de aceitação:**
  1. Gerar arquivos `.json` e `.csv` consolidados com os dados das sessões.
  2. Incluir partidas jogadas, notas de avaliação e eventos registrados nos logs.
  3. Permitir acionar a exportação pela tela de diagnóstico ou por comando no terminal.

---

## 3. Planejamento Geral de Sprints

> Distribuição de épicos, histórias e tarefas principais ao longo das quatro sprints da disciplina, alinhadas às entregas E1 a E4.

| Sprint | EPCs | US | Task |
| --- | --- | --- | --- |
| Sprint 1 (E1, até 31/08) | EPIC-02, EPIC-03, EPIC-04 | US-07, US-08, US-09, US-10, US-11, US-12, US-15, US-16, US-22 | Protótipo das 7 telas no Figma Maker e prova de conceito técnica de iframe sandbox com captura de `postMessage` |
| Sprint 2 (E2, até 28/09) | EPIC-01, EPIC-02, EPIC-03 | US-01, US-02, US-03, US-04, US-06, US-07, US-08, US-10, US-14, US-15, US-16, US-17, US-19 | Sincronizador de jogos com API, cache local, execução Fastify, captura e envio de placar, fila de reenvio offline idempotente e UI funcional |
| Sprint 3 (E3, até 26/10) | EPIC-01, EPIC-02, EPIC-03, EPIC-04 | US-05, US-09, US-11, US-12, US-13, US-18, US-20, US-21, US-22, US-23 | Modo kiosk restrito, coleta de votos, ranking offline, mapa de teclas, timeouts de inatividade e execução do teste de campo no pátio |
| Sprint 4 (E4, até 30/11) | EPIC-04 | US-24, US-25, Ajustes de Campo | Tela de diagnóstico, exportação de relatórios (JSON/CSV), 3 melhorias decorrentes do teste de campo e documentação final |

---

## 4. Sprint 1

### Objetivo da Sprint

Validar a experiência do jogador no protótipo navegável das 7 telas e demonstrar a viabilidade técnica de rodar jogos em iframe sandbox com captura de placar via `postMessage`.

### Itens Planejados

| EPC | US | Task | Responsável | Status |
| --- | --- | --- | --- | --- |
| EPIC-02 | US-07 | Desenhar telas do catálogo e seleção no Figma Maker | João Victor | Concluído |
| EPIC-02 | US-08 | Desenhar fluxo de identificação do jogador por apelido | João Victor | Concluído |
| EPIC-02 | US-10 | Estruturar fluxo clicável 100% por teclado no protótipo | João Victor | Concluído |
| EPIC-03 | US-15 | Criar página de teste carregando jogo em `<iframe sandbox>` | João Victor | Concluído |
| EPIC-03 | US-16 | Capturar evento `postMessage` (`PLACAR`) e exibir dados na tela | João Victor | Concluído |
| EPIC-04 | US-22 | Desenhar tela de fim de partida com votação de 1 a 5 estrelas | João Victor | Concluído |

### Critérios de Conclusão

* [x] Protótipo cobre as 7 telas no Figma Maker (Atração, Identificação, Seleção, Jogo, Fim, Sincronização, Teclas)
* [x] Fluxo clicável de ponta a ponta validado sem links quebrados
* [x] Demonstração técnica de iframe com atributo sandbox rodando jogo de teste
* [x] Captura de postMessage (`PLACAR`) comprovada na tela
* [x] Resolução de 1024×768 e alto contraste aplicados ao protótipo

### Observações

> A Sprint 1 focou em Discovery e validação técnica da integração. A execução de jogos em iframe e a captura de placar foram validadas com jogos de teste locais e fila em arquivo único. Os requisitos definitivos de sincronização com a API G1 e escrita atômica contra queda de energia estão alocados para a Sprint 2.

---

## 5. Sprint 2

### Objetivo da Sprint

Sincronizar jogos com a API de Gestão (G1), executar pacotes locais em cache, capturar e enviar placares com fila offline tolerante a falhas de rede.

### Itens Planejados

| EPC | US | Task | Responsável | Status |
| --- | --- | --- | --- | --- |
| EPIC-01 | US-01 | Consumir `GET /api/jogos`, download condicional e checagem sha256 | João Victor | Em andamento |
| EPIC-01 | US-02 | Rodar jogos do cache em disco mesmo sem conexão ativa | César | Em andamento |
| EPIC-01 | US-03 | Criar fila de reenvio em disco com espera crescente e idempotência por `id_partida` | João Victor | Em andamento |
| EPIC-01 | US-04 | Criar módulo de persistência com escrita atômica e append-only em `partidas.jsonl` | César | Em andamento (fila individual concluída na issue #15) |
| EPIC-01 | US-06 | Implementar leitura de configuração externa (URL, token de estação) | Maycon | Em andamento |
| EPIC-02 | US-07 | Desenvolver painel de seleção em React com grade alimentada pelo `catalogo.json` | Matheus | Em andamento |
| EPIC-02 | US-08 | Implementar tela de identificação por matrícula e apelido | Matheus | Em andamento |
| EPIC-02 | US-10 | Assegurar navegação 100% por setas e Enter nas telas do frontend | Matheus / João Victor | Em andamento |
| EPIC-02 | US-14 | Implementar tratamento de erros com mensagens amigáveis de jogador | Maycon | Em andamento |
| EPIC-03 | US-15 | Servir pacotes locais via Fastify em iframe isolado sem same-origin | João Victor | Concluído |
| EPIC-03 | US-16 | Capturar `postMessage`, validar origem e enviar dados para `/api/placares` | João Victor | Concluído |
| EPIC-03 | US-17 | Remover iframe e liberar memória ao concluir a partida | César | Em andamento |
| EPIC-03 | US-19 | Enviar mensagem `ARCADE_INIT` para o jogo ao iniciar | João Victor | Em andamento |

### Critérios de Conclusão

* [ ] Baixar pacotes aprovados, validar hash sha256 e descompactar arquivos no disco
* [ ] Rodar jogos em cache em modo offline com indicação visual na tela
* [ ] Transmitir placar recebido para `POST /api/placares` com token da estação
* [ ] Salvar partidas na fila em disco durante quedas de rede e reenviar sem duplicar registros
* [ ] Preservar integridade de catálogo e histórico após desligamentos da máquina

### Observações

> Escopo da Entrega E2 (28/09/2026). A validação inclui desconectar o cabo de rede durante a partida e testar reenvios repetidos. O fluxo de telas foi ajustado para que o jogador acesse o jogo imediatamente a partir do catálogo, realizando a avaliação e a identificação institucional ao final da sessão. A persistência atômica por arquivo individual na fila de reenvio (`data/fila/<id>.json` e `data/enviadas/<id>.json`) foi concluída na issue #15.

---

## 6. Sprint 3

### Objetivo da Sprint

Configurar modo kiosk restrito, implementar coleta de votos de 1 a 5, timeouts de inatividade e realizar o teste de campo no pátio do IFES.

### Itens Planejados

| EPC | US | Task | Responsável | Status |
| --- | --- | --- | --- | --- |
| EPIC-01 | US-05 | Configurar inicialização automática do sistema direto na tela de atração (boot) | Maycon | Pendente |
| EPIC-02 | US-09 | Implementar timeouts de inatividade (60 s no painel, 20 s no fim da partida) | Matheus | Pendente |
| EPIC-02 | US-11 | Implementar tela de mapa de teclas com remapeamento persistente em `teclas.json` | Matheus | Pendente |
| EPIC-02 | US-12 | Validar resolução 1024×768 (4:3) e contraste visual no monitor físico do quiosque | Maycon | Pendente |
| EPIC-02 | US-13 | Implementar ranking offline combinando dados locais com oficial sincronizado | César | Pendente |
| EPIC-02 | US-26 | Implementar bloqueio de apelidos ofensivos baseado em lista configurável | Maycon | Pendente |
| EPIC-03 | US-18 | Configurar Chromium em modo kiosk e bloquear atalhos de saída do SO | João Victor | Pendente |
| EPIC-03 | US-20 | Implementar timeouts de jogo (15 s para carga, 5 min para partida) com log | César | Pendente |
| EPIC-03 | US-21 | Implementar atalho de mudo global retendo estado e emitindo `ARCADE_MUDO` | Maycon | Pendente |
| EPIC-04 | US-22 | Implementar tela de voto (1 a 5 estrelas) com tecla para pular e envio à API | Matheus | Pendente |
| EPIC-04 | US-23 | Estruturar gravação em `partidas.jsonl` e log de eventos de sessão | César | Pendente |
| EPIC-04 | — | Conduzir teste de campo no pátio (≥ 10 jogadores, ≥ 15 partidas concluídas) | Toda a equipe | Pendente |

### Critérios de Conclusão

* [ ] Inicializar o sistema direto na tela de atração sem intervenção de mouse
* [ ] Bloquear atalhos de saída do sistema operacional (`Alt+F4`, `Ctrl+W`, `Alt+Tab`, etc.)
* [ ] Coletar nota de 1 a 5 ou permitir pular a avaliação ao fim do jogo
* [ ] Operar por 60 minutos ininterruptos durante o teste de campo
* [ ] Consolidar dados de teste no relatório `docs/campo.md`

### Observações

> Teste de campo no pátio planejado entre 06/10 e 16/10 (preferencialmente de 13 a 16 de outubro de 2026).

---

## 7. Sprint 4

### Objetivo da Sprint

Construir tela de diagnóstico, exportar dados da sessão, implementar os três ajustes apontados no teste de campo e finalizar a documentação.

### Itens Planejados

| EPC | US | Task | Responsável | Status |
| --- | --- | --- | --- | --- |
| EPIC-04 | US-24 | Desenvolver tela de diagnóstico por combinação de teclas reservada | Matheus / Maycon | Pendente |
| EPIC-04 | US-25 | Desenvolver rotina de exportação da sessão em formatos JSON e CSV | César | Pendente |
| — | — | Implementar Ajuste de Campo #1 (definido pós-teste de campo) | João Victor | Pendente |
| — | — | Implementar Ajuste de Campo #2 (definido pós-teste de campo) | Matheus | Pendente |
| — | — | Implementar Ajuste de Campo #3 (definido pós-teste de campo) | César / Maycon | Pendente |
| — | — | Consolidar documentação final e encerramento de pendências | Toda a equipe | Pendente |

### Critérios de Conclusão

* [ ] Exibir conectividade, última sincronização, fila e uso de disco na tela de diagnóstico
* [ ] Exportar relatórios em JSON e CSV com dados consolidados das partidas
* [ ] Aplicar e testar as três melhorias sugeridas pelos alunos no pátio
* [ ] Entregar documentação final e código validados

### Observações

> Os três ajustes de campo serão definidos após a análise dos dados coletados na Sprint 3.

---

## 8. Riscos e Dependências

| Item | Tipo | Impacto | Ação sugerida |
| --- | --- | --- | --- |
| Atributos de sandbox bloquearem comunicação postMessage com o iframe | Dependência técnica | Alto | Testar combinações de sandbox sem `allow-same-origin` mantendo troca de mensagens |
| Falha de conexão no envio de placares ao servidor central | Dependência externa | Alto | Gravar partidas em arquivos individuais na fila local com reenvio idempotente por `id_partida` |
| Queda de energia repentina corromper arquivos | Risco operacional | Alto | Usar arquivo temporário com renomeação atômica e formato append-only (`.jsonl`) |
| Poucos jogadores no teste de campo do pátio | Risco de validação | Médio | Marcar teste em dias movimentados (13 a 16/10) e organizar escala entre os integrantes |
| Jogo travar em tela preta ou durar tempo excessivo | Risco de uso | Médio | Adotar timeouts automáticos (15 s para carregar, 5 min de partida) com retorno ao painel |
| Falha física de tecla durante o uso no pátio | Risco de hardware | Médio | Manter tela de mapa e suporte a remapeamento persistente em `teclas.json` |

---

## 9. Revisão Geral

### O que foi concluído

* Protótipo navegável das 7 telas concluído no Figma Maker (Entrega E1).
* Viabilidade de execução em iframe sandbox com captura de postMessage comprovada em código.
* Servidor Fastify estruturado com rotas locais de suporte ao quiosque.
* Mapeamento dos 26 requisitos funcionais (RF-L01 a RF-L26) em 25 histórias de usuário.

### O que precisa ser replanejado

* Teste da fila offline com oscilações forçadas de rede junto à API do G1.
* Fechamento da lista de palavras bloqueadas para apelidos antes do teste no pátio.

### Próximos passos

* Finalizar o sincronizador de pacotes com conferência de hash sha256.
* Validar o fluxo completo da Entrega E2 (sincronizar, rodar, pontuar e reenviar offline).

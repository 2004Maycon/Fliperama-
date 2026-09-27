# Backlog do Produto — Fliperama Local (G3)

> Fonte de requisitos: [`docs-ref/contexto-g3.md`](../docs-ref/contexto-g3.md) e [`docs-ref/integracao-api.md`](../docs-ref/integracao-api.md)

---

## 1. Visão do produto

### O que é

O **Fliperama Local** é a estação física do projeto **Recreio Arcade** — um quiosque instalado no pátio do IFES que permite a alunos jogar jogos web educativos durante o recreio, sem necessidade de operador ou conexão contínua com a internet.

### O que faz

1. Sincroniza jogos aprovados com a Plataforma de Gestão central (mantida pelo G1).
2. Apresenta um painel de seleção navegável por teclado.
3. Executa cada jogo em iframe isolado, em tela cheia.
4. Captura placares via `postMessage`, coleta votos e sincroniza tudo com o servidor.
5. Opera de forma autônoma — energia na tomada é o único pré-requisito.

### Equipe

Grupo G3, composto por integrantes do curso de Sistemas de Informação do IFES, disciplina de Extensão (2026/2).

### Objetivo geral

Entregar um fliperama funcional que rode no pátio em modo kiosk, opere offline, resista a quedas de energia e forneça dados de campo para avaliação pedagógica dos jogos.

### Restrições da máquina

| Item | Valor |
| --- | --- |
| SO | Linux |
| RAM | 4 GB |
| Disco | 200 GB |
| Entrada | Teclado (sem mouse) |
| Tela | ≥ 1024×768, 4:3 |
| Execução | Chromium em modo kiosk |

---

## 2. Épicos e mapeamento de requisitos

### EPIC-01: Sincronização e Operação Autônoma Offline

Garantir que o fliperama baixe, armazene e mantenha jogos atualizados a partir do servidor central, e que continue operando normalmente sem conexão de rede.

| Requisito | Resumo |
| --- | --- |
| RF-L01 | Sincronizar com a gestão (download de pacotes, cache local) |
| RF-L02 | Operar offline (jogos já baixados continuam jogáveis) |
| RF-L08 | Fila de reenvio (persistir e reenviar placares com espera crescente, idempotência via `id_partida`) |
| RF-L15 | Persistência em disco (JSON/JSONL, escrita atômica) |
| RF-L19 | Boot automático (iniciar na tela de atração ao ligar) |
| RF-L20 | Arquivo de configuração (URL, token, intervalo de sync fora do código) |

### EPIC-02: Experiência do Jogador e Seleção de Jogos

Oferecer uma interface acessível, legível a distância e navegável inteiramente por teclado, desde a atração até a seleção do jogo.

| Requisito | Resumo |
| --- | --- |
| RF-L03 | Painel de seleção (nome, autores, controles, capa, busca/filtro) |
| RF-L04 | Identificação do jogador (apelido de até 9 caracteres) |
| RF-L09 | Retorno automático à atração (timeout sem interação) |
| RF-L11 | 100% teclado (setas + Enter, foco visual ativo) |
| RF-L13 | Mapa de teclas e remapeamento |
| RF-L14 | Resolução mínima (1024×768, 4:3, alto contraste) |
| RF-L18 | Ranking offline (exibição mesmo sem rede, indicando origem dos dados) |
| RF-L24 | Erros em linguagem de jogador (mensagens amigáveis) |
| RF-L26 | Barrar apelido ofensivo (lista de bloqueio configurável) |

### EPIC-03: Execução Segura e Captura de Placar

Executar jogos em ambiente isolado (sandbox), capturar placares de forma segura e garantir que o encerramento de cada partida libere recursos.

| Requisito | Resumo |
| --- | --- |
| RF-L05 | Execução do jogo (do cache, tela cheia, saída visível) |
| RF-L06 | Captura de placar (protocolo `postMessage` — `PLACAR`) |
| RF-L10 | Encerramento limpo do jogo (remoção do iframe, liberação de memória) |
| RF-L12 | Kiosk restrito (bloqueio de atalhos de saída) |
| RF-L16 | Dados somente-leitura para o jogo (apelido e recordes via SDK) |
| RF-L22 | Timeout de jogo (15 s para carga, 5 min para partida, com log) |
| RF-L23 | Mudo global (tecla única, estado retido entre partidas) |

### EPIC-04: Avaliação, Fila de Resultados e Métricas

Coletar feedback dos jogadores, manter histórico local de partidas e fornecer dados para análise e relatórios.

| Requisito | Resumo |
| --- | --- |
| RF-L07 | Voto ao fim da partida (nota 1–5, comentário opcional, pulável) |
| RF-L17 | Histórico de partidas em disco (ranking local combinando `partidas.jsonl` + ranking oficial) |
| RF-L21 | Tela de diagnóstico (combinação reservada de teclas: conectividade, sync, fila, disco) |
| RF-L25 | Exportar relatório da sessão (JSON/CSV para `docs/campo.md`) |

### Cobertura completa

Todos os 26 requisitos (RF-L01 a RF-L26) estão mapeados acima. Nenhum requisito ficou órfão.

---

## 3. Histórias de Usuário

### EPIC-01: Sincronização e Operação Autônoma Offline

#### US-01: Sincronizar catálogo de jogos

**Como** fliperama, **quero** consultar o catálogo da API (`GET /api/jogos`) e baixar pacotes novos ou atualizados, **para que** o painel sempre reflita os jogos aprovados.

Requisitos: RF-L01, RF-L15 (parcial)

**Critérios de aceitação:**

1. Ao iniciar a sincronização, consultar `GET /api/jogos` e comparar o `sha256` de cada jogo com o armazenado em disco.
2. Se o hash divergir ou o jogo não existir localmente, baixar o pacote via `pacote_url`, enviar `If-None-Match` com o hash local (aceitar `304` sem re-download).
3. Validar o hash `sha256` do zip recebido contra o cabeçalho `X-Sha256`; descartar se divergir.
4. Descompactar o pacote na pasta `jogos/<jogo-id>/<versao>/`, preservando `index.html` e `game.json` na raiz.
5. Atualizar `catalogo.json` via escrita atômica (arquivo temporário + renomeação).
6. Remover do disco jogos que não constam mais no catálogo remoto.
7. Se a rede estiver indisponível, o catálogo local existente permanece inalterado.

---

#### US-02: Operar offline com jogos em cache

**Como** jogador, **quero** continuar jogando mesmo sem internet, **para que** o fliperama funcione no pátio independentemente da rede.

Requisito: RF-L02

**Critérios de aceitação:**

1. Todos os jogos previamente baixados são listados no painel e executáveis sem conexão de rede.
2. A interface indica visualmente que o fliperama está offline.
3. Partidas jogadas offline geram placares que são armazenados localmente na fila de envio.

---

#### US-03: Reenviar placares pendentes com idempotência

**Como** fliperama, **quero** persistir placares não enviados em disco e reenviá-los com espera crescente, **para que** nenhuma partida se perca por falha de rede.

Requisito: RF-L08

**Critérios de aceitação:**

1. Cada placar pendente é salvo como arquivo individual em `fila/<id_partida>.json` via criação atômica.
2. O reenvio usa espera progressiva: 5 s → 15 s → 1 min → 5 min.
3. A requisição `POST /api/placares` inclui o mesmo `id_partida` para idempotência; resposta `200` com `duplicada: true` é tratada como sucesso.
4. Após confirmação (`201` ou `200`), o arquivo é movido para `enviadas/`.
5. Reenvios duplicados não geram registros duplicados no servidor.

---

#### US-04: Armazenar dados com integridade (persistência em disco)

**Como** fliperama, **quero** que os dados em disco sobrevivam a quedas de energia, **para que** nenhuma partida salva seja corrompida.

Requisito: RF-L15

**Critérios de aceitação:**

1. Arquivos de estado (`catalogo.json`, `ranking-oficial.json`, `teclas.json`) são gravados via arquivo temporário + renomeação atômica.
2. Partidas são adicionadas de forma incremental em `partidas.jsonl` (append-only).
3. Após desligamento repentino, o sistema reinicia sem perder partidas já registradas.

---

#### US-05: Iniciar automaticamente na tela de atração (boot automático)

**Como** operador, **quero** que o fliperama inicie direto na tela de atração ao ligar na tomada, **para que** não seja necessária nenhuma intervenção manual.

Requisito: RF-L19

**Critérios de aceitação:**

1. Ao ligar o computador, o sistema inicia o servidor Fastify e abre o Chromium em modo kiosk automaticamente.
2. A primeira tela exibida é a tela de atração.
3. Nenhum login, clique ou comando manual é necessário.

---

#### US-06: Carregar configuração externa

**Como** operador, **quero** definir URL do portal, token da estação e intervalo de sincronização em um arquivo de configuração, **para que** essas informações fiquem fora do código e do navegador.

Requisito: RF-L20

**Critérios de aceitação:**

1. Existe um arquivo de configuração (ex.: `config.json` ou variáveis de ambiente) com os campos: URL base da API, token de estação (`est_…`), e intervalo de sincronização em segundos.
2. O servidor lê a configuração ao iniciar e a utiliza em todas as operações de sync e envio.
3. Alterações no arquivo são aplicadas ao reiniciar o servidor, sem recompilar.

---

### EPIC-02: Experiência do Jogador e Seleção de Jogos

#### US-07: Exibir painel de seleção de jogos

**Como** jogador, **quero** ver uma grade de jogos com capa, nome, autores e controles, **para que** eu escolha rapidamente o que jogar.

Requisito: RF-L03

**Critérios de aceitação:**

1. O painel exibe os jogos do `catalogo.json` em formato de grade.
2. Cada card mostra: capa, nome, autores, controles.
3. É possível buscar/filtrar jogos.
4. A navegação funciona inteiramente por setas + Enter.
5. O card selecionado tem foco visual destacado.

---

#### US-08: Identificar o jogador por apelido

**Como** jogador, **quero** digitar um apelido de até 9 caracteres antes de jogar, **para que** meu placar apareça no ranking.

Requisitos: RF-L04, RF-L26

**Critérios de aceitação:**

1. A tela de identificação aceita apelido de até 9 caracteres (`A-Z`, `0-9`).
2. O apelido pode ser digitado livremente ou montado com setas.
3. Enter confirma; campo vazio gera `ANON`.
4. Apelidos presentes na lista de bloqueio (carregada do arquivo de configuração) são rejeitados com mensagem amigável.
5. Caracteres são convertidos para maiúsculas.

---

#### US-09: Retornar à atração por inatividade

**Como** fliperama, **quero** voltar à tela de atração após tempo sem interação, **para que** a máquina não fique presa em uma tela intermediária.

Requisito: RF-L09

**Critérios de aceitação:**

1. Após 60 s sem tecla no painel de seleção, a interface volta à tela de atração.
2. Após 20 s sem tecla na tela de fim de partida, volta à tela de atração.
3. O apelido é limpo ao retornar à atração.

---

#### US-10: Garantir navegação 100% por teclado

**Como** jogador, **quero** navegar por todo o fliperama usando apenas setas e Enter, **para que** eu não dependa de mouse.

Requisito: RF-L11

**Critérios de aceitação:**

1. Todas as telas são navegáveis por setas direcionais e Enter.
2. O foco visual está sempre visível em ao menos um elemento interativo.
3. Nenhuma ação do fluxo principal requer mouse.

---

#### US-11: Exibir mapa de teclas e permitir remapeamento

**Como** jogador/operador, **quero** ver quais teclas estão ativas e poder remapear uma tecla que falhou, **para que** o fliperama continue usável mesmo com tecla defeituosa.

Requisito: RF-L13

**Critérios de aceitação:**

1. A tela de atração inclui mapa visual do teclado indicando teclas ativas.
2. É possível remapear uma tecla para outra via interface ou configuração.
3. O remapeamento persiste em `teclas.json` e sobrevive a reinícios.

---

#### US-12: Garantir resolução e contraste mínimos

**Como** jogador, **quero** que a interface seja legível a 2 metros de distância sob iluminação externa, **para que** eu consiga usar o fliperama no pátio.

Requisito: RF-L14

**Critérios de aceitação:**

1. A interface funciona a partir de 1024×768 em proporção 4:3.
2. Elementos usam alto contraste.
3. Textos e ícones são dimensionados para leitura a 2 m de distância.

---

#### US-13: Exibir ranking offline

**Como** jogador, **quero** ver o ranking mesmo sem rede, **para que** eu saiba minha posição mesmo que o servidor esteja inacessível.

Requisito: RF-L18

**Critérios de aceitação:**

1. O ranking é exibido combinando `partidas.jsonl` (local) com `ranking-oficial.json` (última sincronização).
2. A interface indica claramente se os dados são oficiais ou locais.
3. Se a rede estiver disponível, o ranking oficial é atualizado na sincronização.

---

#### US-14: Exibir erros em linguagem de jogador

**Como** jogador, **quero** que mensagens de erro sejam amigáveis e sem termos técnicos, **para que** eu entenda o que aconteceu.

Requisito: RF-L24

**Critérios de aceitação:**

1. Nenhuma mensagem de erro exibe stack traces, códigos HTTP ou termos técnicos.
2. Cada cenário de erro tem uma mensagem amigável correspondente.
3. Detalhes técnicos são registrados apenas nos logs.

---

### EPIC-03: Execução Segura e Captura de Placar

#### US-15: Executar jogo em iframe isolado

**Como** jogador, **quero** que o jogo abra em tela cheia e eu saiba como sair, **para que** a experiência seja imersiva mas não me prenda.

Requisito: RF-L05

**Critérios de aceitação:**

1. O jogo é carregado do cache local em `<iframe sandbox>` sem `allow-same-origin`.
2. O jogo ocupa a tela inteira.
3. Uma instrução visível indica a tecla para sair.
4. Os arquivos do jogo são servidos pelo Fastify a partir do disco.

---

#### US-16: Capturar placar via postMessage

**Como** fliperama, **quero** receber o placar do jogo via `postMessage`, **para que** a pontuação seja registrada automaticamente ao fim da partida.

Requisito: RF-L06

**Critérios de aceitação:**

1. O fliperama escuta `window.addEventListener('message', …)`.
2. A mensagem só é processada se `event.source === iframe.contentWindow` e `event.data.jogo` corresponder ao jogo em execução.
3. Campos capturados: `pontos`, `duracao_s`, `acertos`, `erros`, `tema`.
4. O fliperama adiciona `jogador`, `id_partida` (UUID) e `jogado_em` antes de enviar ao servidor.

---

#### US-17: Encerrar jogo e liberar memória

**Como** fliperama, **quero** remover o iframe e liberar memória após cada partida, **para que** o consumo não cresça a cada jogo.

Requisito: RF-L10

**Critérios de aceitação:**

1. Ao fim da partida (placar recebido ou timeout), o iframe é removido do DOM.
2. Após 3 partidas consecutivas, o consumo de memória retorna ao nível de referência.

---

#### US-18: Bloquear atalhos de fuga (modo kiosk)

**Como** operador, **quero** que o jogador não consiga sair do fliperama via teclado, **para que** o pátio funcione sem supervisão.

Requisito: RF-L12

**Critérios de aceitação:**

1. Atalhos `Ctrl+W`, `Alt+F4`, `F11`, `Alt+Tab` são bloqueados ou sem efeito.
2. O jogador permanece dentro da interface do fliperama em todas as tentativas.
3. Reinício do navegador ocorre automaticamente em caso de falha.

---

#### US-19: Fornecer dados somente-leitura ao jogo

**Como** jogo (G4), **quero** receber apelido e recordes ao iniciar, **para que** eu possa personalizar a experiência.

Requisito: RF-L16

**Critérios de aceitação:**

1. Na inicialização da partida, o fliperama envia `ARCADE_INIT` via `postMessage` contendo apelido, estado do mudo e melhores pontuações.
2. O jogo recebe os dados mas não pode modificar o estado da plataforma.

---

#### US-20: Encerrar jogos por timeout

**Como** fliperama, **quero** encerrar automaticamente jogos que travaram ou duram demais, **para que** a máquina não fique presa.

Requisito: RF-L22

**Critérios de aceitação:**

1. Jogo que não carrega em 15 s é encerrado com retorno ao painel.
2. Partida que excede 5 min é encerrada.
3. O motivo do encerramento é registrado em log.
4. Mensagem amigável é exibida ao jogador.

---

#### US-21: Controlar mudo global

**Como** jogador, **quero** alternar o áudio com uma única tecla, **para que** eu possa silenciar o fliperama rapidamente.

Requisito: RF-L23

**Critérios de aceitação:**

1. Uma tecla dedicada alterna mudo on/off.
2. O estado é retido entre partidas.
3. Ao mudar o estado, o fliperama envia `ARCADE_MUDO` via `postMessage` ao jogo em execução.

---

### EPIC-04: Avaliação, Fila de Resultados e Métricas

#### US-22: Coletar voto ao fim da partida

**Como** jogador, **quero** dar uma nota de 1 a 5 e um comentário opcional após jogar, **para que** os jogos possam ser avaliados.

Requisito: RF-L07

**Critérios de aceitação:**

1. Após receber o placar, a tela de fim de partida exibe opção de votação (1–5) e campo de comentário.
2. É possível pular a votação com uma única tecla.
3. O voto é enviado junto com o placar no campo `feedback` do `POST /api/placares`.
4. Se o mesmo apelido votar de novo no mesmo jogo, o voto mais recente prevalece (conforme regra da API).

---

#### US-23: Manter histórico local de partidas

**Como** fliperama, **quero** registrar todas as partidas em `partidas.jsonl`, **para que** o ranking offline e os relatórios de campo tenham dados completos.

Requisito: RF-L17

**Critérios de aceitação:**

1. Cada partida é adicionada como uma linha em `partidas.jsonl` (append-only).
2. O ranking local combina `partidas.jsonl` com `ranking-oficial.json`.
3. Dados incluem: `id_partida`, `jogo`, `jogador`, `pontos`, `duracao_s`, `acertos`, `erros`, `jogado_em`.

---

#### US-24: Exibir tela de diagnóstico

**Como** operador, **quero** acessar uma tela de diagnóstico via combinação reservada de teclas, **para que** eu verifique o estado do fliperama sem acessar o terminal.

Requisito: RF-L21

**Critérios de aceitação:**

1. Combinação reservada de teclas abre a tela de diagnóstico.
2. A tela exibe: estado de conectividade, data/hora da última sincronização, itens na fila de envio e uso de disco.
3. A tela é fechada pela mesma combinação ou por Esc.

---

#### US-25: Exportar relatório da sessão

**Como** operador, **quero** exportar dados da sessão em JSON e CSV, **para que** os dados alimentem `docs/campo.md` e os relatórios das entregas.

Requisito: RF-L25

**Critérios de aceitação:**

1. É possível exportar os dados de sessão (partidas, jogadores, votos) em formato JSON e CSV.
2. Os dados são extraídos de `partidas.jsonl` e dos logs de sessão.
3. A exportação pode ser acionada pela tela de diagnóstico ou via comando no servidor.

---

## 4. Distribuição por Sprints

### Sprint 1 — Entrega E1 (até 31/08/2026)

**Objetivo:** protótipo navegável das 7 telas e prova de conceito técnica com iframe + `postMessage`.

| ID | História | Escopo na Sprint |
| --- | --- | --- |
| US-07 | Painel de seleção | Protótipo navegável no Figma Maker |
| US-08 | Identificação do jogador | Protótipo da tela de identificação |
| US-09 | Retorno à atração | Protótipo da tela de atração com transição |
| US-10 | Navegação 100% teclado | Fluxo clicável no protótipo |
| US-11 | Mapa de teclas | Protótipo da tela de mapa |
| US-12 | Resolução e contraste | Diretrizes visuais aplicadas ao protótipo |
| US-15 | Execução em iframe | **Demonstração técnica**: página web carregando jogo em `<iframe sandbox>` e capturando `postMessage` com o placar |
| US-16 | Captura de placar | Incluída na demonstração técnica acima |
| US-22 | Voto ao fim da partida | Protótipo da tela de fim de partida |

> **Nota:** a Sprint 1 é focada em Discovery e prototipação. A demonstração de iframe + `postMessage` é a única implementação funcional exigida. As demais histórias são cobertas no protótipo do Figma.

Referências de entrega: RE-03, RE-04, RE-05

---

### Sprint 2 — Entrega E2 (até 28/09/2026)

**Objetivo:** sincronização de jogos, execução local e ciclo completo de placar, incluindo resiliência a falhas de rede.

| ID | História | Escopo na Sprint |
| --- | --- | --- |
| US-01 | Sincronizar catálogo | Implementação completa (download, hash, descompactação, limpeza) |
| US-02 | Operar offline | Jogos em cache permanecem jogáveis sem rede |
| US-03 | Fila de reenvio | Persistência em disco + reenvio com espera crescente + idempotência |
| US-04 | Persistência em disco | Escrita atômica para todos os arquivos de estado |
| US-06 | Configuração externa | Arquivo de configuração com URL, token e intervalo de sync |
| US-07 | Painel de seleção | Implementação funcional (React) com dados do catálogo local |
| US-08 | Identificação do jogador | Implementação funcional da tela de apelido |
| US-10 | Navegação 100% teclado | Navegação funcional por setas e Enter em todas as telas implementadas |
| US-14 | Erros amigáveis | Mensagens de erro sem termos técnicos |
| US-15 | Execução em iframe | Implementação completa com sandbox e servimento do cache |
| US-16 | Captura de placar | Implementação com validação de origem e composição do payload |
| US-17 | Encerramento do jogo | Remoção do iframe e liberação de memória |
| US-19 | Dados somente-leitura | Envio de `ARCADE_INIT` ao jogo |

Referências de entrega: RE-10, RE-13

---

### Sprint 3 — Entrega E3 (até 26/10/2026)

**Objetivo:** modo kiosk restrito, coleta de votos, retorno por inatividade e teste de campo no pátio.

| ID | História | Escopo na Sprint |
| --- | --- | --- |
| US-05 | Boot automático | Iniciar na tela de atração ao ligar |
| US-09 | Retorno à atração | Implementação funcional dos timeouts de inatividade |
| US-11 | Mapa de teclas | Implementação funcional com remapeamento e persistência |
| US-12 | Resolução e contraste | Validação final na máquina de destino |
| US-13 | Ranking offline | Exibição combinando dados locais e oficiais |
| US-18 | Modo kiosk | Bloqueio de atalhos + reinício automático do navegador |
| US-20 | Timeout de jogo | Encerramento por carga lenta (15 s) e partida longa (5 min) |
| US-21 | Mudo global | Tecla de toggle + `ARCADE_MUDO` |
| US-22 | Voto ao fim da partida | Implementação funcional com envio no campo `feedback` |
| US-23 | Histórico local | Registro em `partidas.jsonl` e cálculo de ranking local |
| US-26 | Barrar apelido ofensivo | Já parte da US-08, validação contra lista de bloqueio |

> **Nota:** o teste de campo ocorre entre 06/10 e 16/10 (preferencialmente 13–16/10). Meta: ≥ 10 jogadores, ≥ 15 partidas, ≥ 60 min ininterruptos.

Referências de entrega: RE-16, RE-17

---

### Sprint 4 — Entrega E4 (até 30/11/2026)

**Objetivo:** três ajustes decorrentes do teste de campo, encerramento de pendências e documentação final.

| ID | História | Escopo na Sprint |
| --- | --- | --- |
| US-24 | Tela de diagnóstico | Implementação completa |
| US-25 | Exportar relatório | Exportação em JSON/CSV |
| — | Ajuste de campo #1 | A definir com base nos dados coletados na Sprint 3 |
| — | Ajuste de campo #2 | A definir com base nos dados coletados na Sprint 3 |
| — | Ajuste de campo #3 | A definir com base nos dados coletados na Sprint 3 |
| — | Documentação final | Encerramento de `docs/campo.md` e pendências |

> **Nota:** os 3 ajustes serão definidos após análise do relatório do teste de campo. Não é possível especificá-los antecipadamente.

Referências de entrega: RE-20, RE-21, RE-22

---

## 5. Detalhamento da Sprint 1

### Objetivo da Sprint

> Validar a experiência do jogador de ponta a ponta no protótipo e comprovar a viabilidade técnica da execução de jogos em iframe com captura de placar via `postMessage`.

### Período

Início da disciplina até **31/08/2026**.

### Entregáveis

1. **Protótipo navegável (Figma Maker)** — fluxo clicável cobrindo as 7 telas:
   - Atração → Identificação → Painel de seleção → Em jogo → Fim de partida → Sincronização → Mapa de teclas

2. **Demonstração técnica de iframe + postMessage** — página web funcional que:
   - Carrega um jogo de exemplo em `<iframe sandbox>`
   - Captura a mensagem `postMessage` com o placar
   - Exibe o placar capturado na tela

### Critérios de conclusão (Definition of Done)

| # | Critério | Verificação |
| --- | --- | --- |
| 1 | Protótipo cobre todas as 7 telas do G3 | Navegação completa no Figma sem telas faltando |
| 2 | Fluxo clicável do protótipo funciona de ponta a ponta | Atração → Identificação → Seleção → Jogo → Placar → Voto → Seleção, sem links quebrados |
| 3 | Demonstração de iframe funcional | Página HTML carrega jogo em `<iframe sandbox>` e o jogo roda |
| 4 | Captura de `postMessage` comprovada | Console ou interface exibe o objeto de placar recebido do iframe |
| 5 | Diretrizes visuais definidas | Resolução 1024×768, alto contraste e leitura a 2 m considerados no protótipo |
| 6 | Navegação por teclado esboçada | Protótipo indica visualmente quais teclas controlam cada tela |

### Riscos da Sprint 1

| Risco | Mitigação |
| --- | --- |
| Restrição de `sandbox` impede comunicação por `postMessage` | Testar combinações de atributos do `sandbox` logo no início da Sprint |
| Atraso na definição visual impacta o protótipo | Definir a paleta de cores e tipografia na primeira semana |
| Equipe sem experiência com Figma Maker | Reservar sessão de nivelamento na primeira semana |

### Alinhamento com checkpoints

- **CP1 (31/08):** cada membro deve justificar o público-alvo com base no PRD e demonstrar domínio sobre as telas do protótipo.

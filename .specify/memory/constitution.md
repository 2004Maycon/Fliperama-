<!--
SYNC IMPACT REPORT
==================
Version change: Template (0.0.0) → 1.0.0 (Initial Ratification)
Modified principles:
  - [PRINCIPLE_1_NAME] → I. Operação Offline-First e Autonomia Local (NON-NEGOTIABLE)
  - [PRINCIPLE_2_NAME] → II. Idempotência e Confiabilidade na Coleta de Placares
  - [PRINCIPLE_3_NAME] → III. Resiliência a Queda Abrupta de Energia (Atomic Persistence)
  - [PRINCIPLE_4_NAME] → IV. Isolamento Estrito de Jogos via Iframe (Security Sandbox)
  - [PRINCIPLE_5_NAME] → V. Testes Automatizados com Node Test Runner Nativo (Integration-First)
Added sections:
  - Restrições de UX e Hardware do Quiosque
  - Padrões de Performance e Arquitetura Local
  - Diretrizes de Resolução de Requisitos
Removed sections:
  - None (placeholders fully replaced by concrete product governance)
Follow-up TODOs:
  - None. All template placeholders resolved.
-->

# Fliperama Local (G3) Constitution

## Core Principles

### I. Operação Offline-First e Autonomia Local (NON-NEGOTIABLE)

O quiosque físico DEVE ser completamente funcional e autônomo mesmo na ausência de conexão de rede por tempo indeterminado. A execução dos jogos instalados, a navegação completa pela interface e a coleta/registro local de placares NUNCA dependem da disponibilidade da internet ou da API central (G1). Toda sincronização externa DEVE ocorrer de forma assíncrona em segundo plano, sem bloquear, degradar ou interromper a experiência do jogador.

### II. Idempotência e Confiabilidade na Coleta de Placares

Cada partida concluída DEVE receber um identificador universal único (UUID) e timestamp ISO 8601 no momento exato do término do jogo. O armazenamento na fila local e a transmissão para a API central DEVEM ser estritamente idempotentes: reenvios automáticos resultantes de falhas de rede, timeouts ou reinicializações do sistema NUNCA devem gerar duplicidade de placar na base central do Arcade-IFES.

### III. Resiliência a Queda Abrupta de Energia (Atomic Persistence)

Como quiosque físico instalado em espaço público sujeito a desligamentos inesperados da tomada, toda e qualquer escrita de estado persistente em disco (fila de placares, catálogo de jogos e arquivos de configuração) DEVE utilizar persistência atômica através da estratégia *write-then-rename* (gravação em arquivo temporário seguida de substituição atômica via `fs.rename`). O sistema DEVE garantir que nenhum arquivo de dados termine corrompido, vazio ou ilegível após cortes de energia.

### IV. Isolamento Estrito de Jogos via Iframe (Security Sandbox)

Todos os jogos web de desenvolvedores terceiros DEVEM ser executados dentro de elementos `<iframe>` isolados com atributo de sandbox restritivo (`allow-scripts`, sem permissão para navegação no contexto superior, acesso a popups ou execução de recursos não autorizados). A comunicação bidirecional entre o jogo e o quiosque DEVE ocorrer exclusivamente via `window.postMessage`, com validação rigorosa de esquema de dados para eventos de ciclo de vida e término de partida.

### V. Testes Automatizados com Node Test Runner Nativo (Integration-First)

A política de garantia de qualidade prioriza testes de integração focados nos contratos críticos da aplicação: comunicação `postMessage` com o iframe, endpoints locais do servidor Fastify e o ciclo de vida da fila offline de placares. Os testes DEVEM utilizar o executor nativo do Node.js (`node --test`), mantendo a suíte de testes leve, determinística, rápida e livre de dependências pesadas de teste.

## Restrições de UX e Hardware do Quiosque

- **Controle 100% por Teclado/Arcade:** A interface inteira do quiosque DEVE ser plenamente operável utilizando apenas teclas mapeadas para controles físicos de fliperama (direcionais, botões de ação e créditos). Nenhuma funcionalidade voltada ao jogador pode depender de mouse, cursor flutuante, teclado virtual em tela sensível ao toque ou combinações simultâneas complexas de teclas.
- **Visibilidade a 2 Metros e Proporção Arcade:** Layout, tipografia e contraste visual DEVEM ser legíveis a pelo menos 2 metros de distância sob iluminação natural/ambiente externa de corredores e pátios escolares. O design deve priorizar a proporção de tela 4:3 (padrão de monitores de arcade) e adaptar-se fluidamente a telas 16:9 sem distorção ou corte de controles interativos.
- **Modo de Atração e Timeout de Inatividade:** A interface DEVE possuir temporizador de inatividade configurável que retorne automaticamente à tela de atração (attract mode) após período de abandono, limpando dados transitórios de sessões incompletas para garantir a privacidade do usuário anterior e a prontidão para o próximo jogador.

## Padrões de Performance e Arquitetura Local

- **Separação Rígida Frontend/Backend Local:** O frontend React (Vite) é responsável estritamente pela camada visual, navegação de telas e hospedeiro do iframe; o backend Fastify atua como autoridade exclusiva de sistema operacional (acesso ao sistema de arquivos local, persistência da fila e comunicação HTTP externa).
- **Tempo de Prontidão e Responsividade:** O quiosque DEVE inicializar e estar pronto para interação em menos de 5 segundos. Transições entre telas e abertura de jogos instalados localmente devem ser imediatas, sem recarregar desnecessariamente o shell da aplicação.
- **Tratamento Gracioso de Erros:** Falhas no carregamento de jogos individuais (ex: timeout de 15 segundos) ou indisponibilidade de serviços externos NUNCA devem resultar em tela em branco, quebra de CSS ou travamento do quiosque. O sistema DEVE exibir mensagens claras em português (pt-BR) com opção imediata de retorno seguro ao catálogo.

## Governança de Produto e Regra de Não Proliferação

- **Aderência aos Requisitos Documentados:** Todo desenvolvimento DEVE ser rastreável aos requisitos funcionais e não-funcionais estabelecidos em `docs-ref/contexto-g3.md` e `docs/planejamento/`. É estritamente vedada a invenção de funcionalidades, regras de negócio ou telas que não estejam fundamentadas na documentação do projeto.
- **Resolução de Divergências via Clarificação:** Divergências entre a especificação documental e o código herdado (como formatos de mensagens, campos de identificação ou estratégias de fila) DEVEM ser submetidas ao ciclo formal de `/speckit-clarify` antes do planejamento técnico (`/speckit-plan`) e da implementação (`/speckit-implement`).

## Governance

Esta Constituição estabelece as diretrizes e princípios inegociáveis de produto para o Fliperama Local (G3). As convenções operacionais de repositório (regras de Git, branches, padrões de commit e linting) são governadas complementarmente pelo `AGENTS.md`.

Qualquer alteração neste documento requer:

1. Justificativa formal documentada detalhando a necessidade e o impacto no produto.
2. Incremento de versão seguindo o padrão de Versionamento Semântico (SemVer):
   - **MAJOR**: Remoção, inversão ou redefinição incompatível de princípios inegociáveis.
   - **MINOR**: Adição de novos princípios, critérios de qualidade ou restrições de arquitetura.
   - **PATCH**: Ajustes de redação, correções ortográficas ou esclarecimentos sem impacto normativo.
3. Atualização obrigatória dos campos de data e versão.

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-28

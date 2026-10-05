# Research: registro anônimo

## Divergências de documentação e código

- **Decision**: A matrícula torna-se opcional na rota local, mas, quando informada com apelido válido, conserva a regra dos 12 dígitos. Apelido vazio vira `ANON` e descarta matrícula.
- **Rationale**: Issue #17 solicita apelido sem matrícula, US-08 prevê matrícula de 12 dígitos e apelido vazio; `docs-ref/contexto-g3.md` coleta apenas apelido. Matrícula opcional satisfaz as três fontes. Hoje `Identificacao.tsx` e `server.ts` exigem ambos, contrariando a issue.
- **Alternatives considered**: Exigir matrícula sempre (bloqueia anônimos); ignorar validação quando preenchida (admite identificação malformada).

## Gravação e ranking

- **Decision**: Salvar `ANON` na fila atual mesmo sem rede; manter o formato de envio do G3, sem matrícula. Deixar a exclusão do ranking para o contrato oficial G1.
- **Rationale**: `envioResultadosService.ts` já exclui matrícula do payload; `docs-ref/integracao-api.md` especifica que `ANON` pode votar e não compõe o ranking oficial. O botão pular da US-08 é interpretado conforme a issue #17: não informar dados, mas preservar a partida.
- **Alternatives considered**: Descartar resultado ao pular (perde pontuação e avaliação); filtrar `ANON` no envio (perde o voto).

## Testabilidade da rota

- **Decision**: Mover o registro de `POST /resultados` para `server/routes/resultados.ts` e usar `Fastify.inject` em testes Node.
- **Rationale**: A entrada de `server.ts` inicia servidor, sincronização e temporizador ao importar, impedindo um teste determinístico do HTTP e da fila.
- **Alternatives considered**: Testar apenas uma função pura (não prova o contrato HTTP); iniciar servidor real (porta/rede e temporizadores).

## Fronteira de escopo

- **Decision**: Não alterar o layout de persistência da fila, o cálculo do ranking, o protocolo de jogos nem a autenticação da API G1 nesta issue.
- **Rationale**: #15 e #16 já foram integradas à `main`: a fila grava `data/fila/<id>.json` de forma atômica e o iframe envia `ARCADE_INIT`. A #17 só altera a identificação depois do jogo.
- **Alternatives considered**: Alterar a fila ou a inicialização do jogo aqui (duplica trabalho integrado e amplia o PR).

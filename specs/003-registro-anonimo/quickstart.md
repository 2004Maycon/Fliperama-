# Verificar a issue #17

Para continuar o fluxo Spec Kit em outra cópia da branch, defina `SPECIFY_FEATURE_DIRECTORY=specs/003-registro-anonimo` no ambiente (PowerShell: `$env:SPECIFY_FEATURE_DIRECTORY = 'specs/003-registro-anonimo'`). O arquivo local `.specify/feature.json` não é versionado.

1. Na pasta `fliperama-local`, execute `npm ci`, `npm test`, `npm run build` e `npm run lint`.
2. Abra dois terminais nessa pasta; execute `npm run server` e `npm run dev`. Abra o endereço impresso pelo Vite.
3. Jogue até chegar ao resultado, avalie, avance para a identificação, use Tab até **JOGAR SEM IDENTIFICAÇÃO** e Enter. A tela volta à atração e o novo arquivo `data/fila/<id>.json` registra `apelido: "ANON"`, `matricula: ""`, pontuação e avaliação.
4. Repita informando apenas apelido; confirme que a matrícula fica vazia. Repita com apelido vazio; confirme `ANON`. Matrícula parcial com apelido válido deve exibir erro, sem sair da tela.
5. Com a API externa desligada, a partida fica na fila e o jogo continua utilizável. A classificação oficial de `ANON` é definida pelo G1; não há ranking local neste fluxo.

O servidor local grava um arquivo por partida em `fliperama-local/data/fila`; evite versionar esses arquivos gerados.

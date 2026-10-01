# Guia de Contribuição — Fliperama Local (G3)

> Diretrizes de desenvolvimento no fork, padrão de commits, mapa de versões e fluxo de integração com o repositório central.

---

## 1. Fluxo de branches

### No fork (`nribjoaovictor/Fliperama-`)

| Branch | Propósito |
| --- | --- |
| `main` | Código estável, pronto para envio à organização |
| `feature/<nome>` | Uma branch por funcionalidade nova, criada a partir de `main` |
| `fix/<nome>` | Uma branch por correção, criada a partir de `main` |

**Regras:**

- Cada tarefa tem sua própria branch (`feature/` ou `fix/`).
- A integração com `main` é feita exclusivamente via pull request com CI verde.
- Nunca faça commit direto na `main`.

```text
main ─────────────────────────────────────── main
  └── feature/sincronizacao ──── PR ──────┘
  └── fix/escrita-atomica ────── PR ──────┘
```

### Envio para a organização (`Arcade-IFES/Fliperama-`)

| Origem | Destino | Observação |
| --- | --- | --- |
| `nribjoaovictor/Fliperama-:main` | `Arcade-IFES/Fliperama-:dev` | A organização não recebe PR direto na `main` |

**Passos:**

1. Garantir que `main` do fork está estável e com CI verde.
2. Abrir PR de `nribjoaovictor/Fliperama-:main` → `Arcade-IFES/Fliperama-:dev`.
3. Aguardar revisão e merge pela organização.

---

## 2. Padrão de commits (Conventional Commits)

Todos os commits seguem o formato:

```text
<tipo>: <descrição curta>
```

### Prefixos

| Prefixo | Quando usar |
| --- | --- |
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Alteração em documentação |
| `chore:` | Tarefas de manutenção (dependências, CI, configs) |
| `refactor:` | Reestruturação de código sem mudar comportamento |

### Exemplos práticos

```text
feat: implementar sincronização de catálogo com a API
feat: adicionar tela de identificação do jogador
fix: corrigir escrita atômica do catalogo.json em queda de energia
fix: tratar timeout de 15s para jogos que não carregam
docs: documentar fluxo de reenvio da fila de placares
chore: atualizar dependências do Fastify para v5.13
refactor: extrair máquina de estados da sessão para módulo próprio
```

### Regras

- Descrição em português, letra minúscula, sem ponto final.
- Primeira linha com no máximo 72 caracteres.
- Corpo opcional para explicar o "porquê" quando não for óbvio.

---

## 3. Mapa de versões (SemVer 2.0.0)

O projeto segue [Semantic Versioning 2.0.0](https://semver.org/lang/pt-BR/): `MAJOR.MINOR.PATCH`.

| Versão | Marco | Escopo |
| --- | --- | --- |
| `v0.1.0` | Primeira versão navegável | Quiosque funcional com fila local e sincronização com a API |
| `v0.1.1` | Correções iniciais | Ajustes na fila offline ou correções de layout |
| `v0.2.0` | Funcionalidades incrementais | Ordenação de catálogo ou tela de configurações locais |
| `v1.0.0` | Homologação final | Integração física final do quiosque e homologação em produção |

### Regras de incremento

| Componente | Quando incrementar |
| --- | --- |
| **PATCH** (`0.1.x`) | Correções de bugs que não alteram a interface ou o comportamento público |
| **MINOR** (`0.x.0`) | Novas funcionalidades retrocompatíveis |
| **MAJOR** (`x.0.0`) | Mudanças que quebram compatibilidade ou marco de produção |

> Enquanto a versão for `0.x.y`, mudanças de interface são esperadas e permitidas em incrementos MINOR.

---

## 4. Desenvolvimento com Spec-Kit

O projeto utiliza Spec-Driven Development para especificar, planejar e criar issues antes de implementar código. Consulte o guia detalhado em [`docs/referencia/spec-kit.md`](docs/referencia/spec-kit.md) para o passo a passo e a relação de comandos disponíveis.

---

## 5. Resumo rápido

```text
1. Crie branch: git checkout -b feature/<nome> main
2. Especifique e planeje com Spec-Kit (/speckit-specify, /speckit-plan, /speckit-tasks)
3. Desenvolva e faça commits: feat: descrição curta
4. Abra PR para main do fork (CI deve passar)
5. Após merge, abra PR do fork para Arcade-IFES/Fliperama-:dev
```

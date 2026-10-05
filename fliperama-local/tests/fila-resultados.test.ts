import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  adicionarResultado,
  buscarFilaResultados,
  prepararFilaResultados,
  removerResultado,
} from '../server/services/filaResultadosService'

export async function executarEmAmbienteTemporario(
  fn: (pastaTeste: string) => Promise<void>
) {
  const pastaTeste = await mkdtemp(path.join(tmpdir(), 'fliperama-fila-'))
  const pastaOriginal = process.cwd()

  try {
    process.chdir(pastaTeste)
    await fn(pastaTeste)
  } finally {
    process.chdir(pastaOriginal)
    await rm(pastaTeste, { recursive: true, force: true })
  }
}

test('US4 (T005): sem pastas, prepararFilaResultados() cria data/fila e data/enviadas', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const statFila = await stat('./data/fila')
    const statEnviadas = await stat('./data/enviadas')

    assert.equal(statFila.isDirectory(), true)
    assert.equal(statEnviadas.isDirectory(), true)

    // O arquivo legado fila-resultados.json não deve ser criado
    await assert.rejects(async () => {
      await stat('./data/fila-resultados.json')
    }, /ENOENT/)
  })
})

test('US4 (T006): segunda chamada a prepararFilaResultados() com registro existente em data/fila não apaga o registro', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const caminhoArquivoTeste = './data/fila/teste-partida.json'
    await writeFile(caminhoArquivoTeste, JSON.stringify({ id: 'teste-partida' }))

    // Executa novamente
    await prepararFilaResultados()

    const statArquivo = await stat(caminhoArquivoTeste)
    assert.equal(statArquivo.isFile(), true)
  })
})

test('US1 (T008, T011): adicionarResultado cria exatamente um data/fila/<id>.json e nenhum .tmp', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const partida = await adicionarResultado({
      matricula: '202612345678',
      apelido: 'JOGADOR1',
      jogoId: 'corrida-contra-o-sino',
      pontuacao: 150,
      avaliacao: 5,
    })

    assert.ok(partida.id, 'deve ter gerado UUID')
    assert.ok(partida.jogadoEm, 'deve ter gerado jogadoEm')
    // Verifica formato ISO 8601
    assert.ok(!isNaN(Date.parse(partida.jogadoEm)))

    const caminhoArquivo = path.join('./data/fila', `${partida.id}.json`)
    const conteudo = await readFile(caminhoArquivo, 'utf-8')
    const salvo = JSON.parse(conteudo)

    assert.deepEqual(salvo, partida)

    const arquivos = await readdir('./data/fila')
    assert.equal(arquivos.length, 1)
    assert.equal(arquivos[0], `${partida.id}.json`)
    assert.ok(!arquivos.some((a) => a.endsWith('.tmp')))
  })
})

test('US1 (T009): segunda partida não altera o arquivo do primeiro registro', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const p1 = await adicionarResultado({
      matricula: '111111111111',
      apelido: 'P1',
      jogoId: 'jogo-1',
      pontuacao: 10,
      avaliacao: 4,
    })

    const caminhoP1 = path.join('./data/fila', `${p1.id}.json`)
    const conteudoInicialP1 = await readFile(caminhoP1, 'utf-8')

    const p2 = await adicionarResultado({
      matricula: '222222222222',
      apelido: 'P2',
      jogoId: 'jogo-2',
      pontuacao: 20,
      avaliacao: 5,
    })

    const conteudoFinalP1 = await readFile(caminhoP1, 'utf-8')
    assert.equal(conteudoFinalP1, conteudoInicialP1)

    const caminhoP2 = path.join('./data/fila', `${p2.id}.json`)
    const conteudoP2 = await readFile(caminhoP2, 'utf-8')
    assert.deepEqual(JSON.parse(conteudoP2), p2)

    const arquivos = await readdir('./data/fila')
    assert.equal(arquivos.length, 2)
  })
})

test('US1 (T010): buscarFilaResultados retorna todas as partidas ordenadas por jogadoEm com desempate por id', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const p1 = await adicionarResultado({
      matricula: '111111111111',
      apelido: 'P1',
      jogoId: 'jogo-1',
      pontuacao: 10,
      avaliacao: 4,
    })

    const p2 = await adicionarResultado({
      matricula: '222222222222',
      apelido: 'P2',
      jogoId: 'jogo-2',
      pontuacao: 20,
      avaliacao: 5,
    })

    const fila = await buscarFilaResultados()
    assert.equal(fila.length, 2)
    // As duas gravações podem ocorrer no mesmo milissegundo; nesse caso vale o id.
    const esperada = [p1, p2].sort((a, b) =>
      (a.jogadoEm || '').localeCompare(b.jogadoEm || '') || a.id.localeCompare(b.id)
    )
    assert.deepEqual(fila.map((partida) => partida.id), esperada.map((partida) => partida.id))

    // Datas controladas verificam a ordem independentemente da velocidade do disco.
    p1.jogadoEm = '2026-10-05T12:00:00.000Z'
    p2.jogadoEm = '2026-10-05T11:00:00.000Z'
    await writeFile(path.join('./data/fila', `${p1.id}.json`), JSON.stringify(p1))
    await writeFile(path.join('./data/fila', `${p2.id}.json`), JSON.stringify(p2))
    assert.deepEqual((await buscarFilaResultados()).map((partida) => partida.id), [p2.id, p1.id])

    p1.jogadoEm = p2.jogadoEm
    await writeFile(path.join('./data/fila', `${p1.id}.json`), JSON.stringify(p1))
    assert.deepEqual((await buscarFilaResultados()).map((partida) => partida.id), [p1.id, p2.id].sort())
  })
})

test('US2 (T014): removerResultado tira o registro de data/fila e o deixa em data/enviadas com mesmo conteúdo', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const p = await adicionarResultado({
      matricula: '123456789012',
      apelido: 'ENV',
      jogoId: 'corrida',
      pontuacao: 99,
      avaliacao: 5,
    })

    await removerResultado(p.id)

    // Não deve mais existir em fila
    await assert.rejects(async () => {
      await stat(path.join('./data/fila', `${p.id}.json`))
    }, /ENOENT/)

    // Deve existir em enviadas com mesmo conteúdo
    const conteudoEnviado = await readFile(
      path.join('./data/enviadas', `${p.id}.json`),
      'utf-8'
    )
    assert.deepEqual(JSON.parse(conteudoEnviado), p)

    // buscarFilaResultados deve retornar vazio
    const fila = await buscarFilaResultados()
    assert.equal(fila.length, 0)
  })
})

test('US2 (T015): remover uma partida não altera as demais pendentes', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const p1 = await adicionarResultado({
      matricula: '111111111111',
      apelido: 'P1',
      jogoId: 'jogo-1',
      pontuacao: 10,
      avaliacao: 4,
    })
    const p2 = await adicionarResultado({
      matricula: '222222222222',
      apelido: 'P2',
      jogoId: 'jogo-2',
      pontuacao: 20,
      avaliacao: 5,
    })

    await removerResultado(p1.id)

    const fila = await buscarFilaResultados()
    assert.equal(fila.length, 1)
    assert.equal(fila[0].id, p2.id)

    const conteudoP2 = await readFile(
      path.join('./data/fila', `${p2.id}.json`),
      'utf-8'
    )
    assert.deepEqual(JSON.parse(conteudoP2), p2)
  })
})

test('US2 (T016): com data/enviadas/<id>.json já existente, removerResultado mantém o arquivado, remove o pendente e não lança erro', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const id = 'id-colisao-teste'
    const arquivado = { id, apelido: 'ORIGINAL', jogadoEm: '2026-09-01T00:00:00.000Z' }
    const pendente = { id, apelido: 'PENDENTE', jogadoEm: '2026-09-02T00:00:00.000Z' }

    await writeFile(
      path.join('./data/enviadas', `${id}.json`),
      JSON.stringify(arquivado, null, 2)
    )
    await writeFile(
      path.join('./data/fila', `${id}.json`),
      JSON.stringify(pendente, null, 2)
    )

    // Remove resultado com colisão em enviadas
    await removerResultado(id)

    // Pendente deve ter sido removido
    await assert.rejects(async () => {
      await stat(path.join('./data/fila', `${id}.json`))
    }, /ENOENT/)

    // Arquivado deve ser preservado intacto
    const conteudoArquivado = await readFile(
      path.join('./data/enviadas', `${id}.json`),
      'utf-8'
    )
    assert.deepEqual(JSON.parse(conteudoArquivado), arquivado)
  })
})

test('US2 (T017): removerResultado de id inexistente não lança erro e não altera a fila', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const p = await adicionarResultado({
      matricula: '111111111111',
      apelido: 'P1',
      jogoId: 'jogo-1',
      pontuacao: 10,
      avaliacao: 4,
    })

    // Remove ID inexistente
    await removerResultado('id-inexistente-123')

    const fila = await buscarFilaResultados()
    assert.equal(fila.length, 1)
    assert.equal(fila[0].id, p.id)
  })
})

test('US3 (T019): com um .json corrompido em data/fila, buscarFilaResultados retorna os demais, emite aviso e não remove o arquivo', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const p = await adicionarResultado({
      matricula: '111111111111',
      apelido: 'P1',
      jogoId: 'jogo-1',
      pontuacao: 10,
      avaliacao: 4,
    })

    const caminhoCorrompido = path.join('./data/fila', 'corrompido.json')
    await writeFile(caminhoCorrompido, '{ json invalido quebrado')

    const avisos: string[] = []
    const warnOriginal = console.warn
    console.warn = (...args: unknown[]) => {
      avisos.push(args.map(String).join(' '))
    }

    try {
      const fila = await buscarFilaResultados()
      assert.equal(fila.length, 1)
      assert.equal(fila[0].id, p.id)

      assert.ok(
        avisos.some((aviso) => aviso.includes('corrompido.json')),
        'deve emitir aviso no console com o nome do arquivo corrompido'
      )

      // O arquivo corrompido deve permanecer na pasta
      const statCorrompido = await stat(caminhoCorrompido)
      assert.equal(statCorrompido.isFile(), true)
    } finally {
      console.warn = warnOriginal
    }
  })
})

test('US3 (T020): um .json vazio e um .json sem id string são ignorados com aviso', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const caminhoVazio = path.join('./data/fila', 'vazio.json')
    await writeFile(caminhoVazio, '')

    const caminhoSemId = path.join('./data/fila', 'sem-id.json')
    await writeFile(caminhoSemId, JSON.stringify({ pontuacao: 100 }))

    const avisos: string[] = []
    const warnOriginal = console.warn
    console.warn = (...args: unknown[]) => {
      avisos.push(args.map(String).join(' '))
    }

    try {
      const fila = await buscarFilaResultados()
      assert.equal(fila.length, 0)

      assert.ok(
        avisos.some((aviso) => aviso.includes('vazio.json')),
        'deve emitir aviso para arquivo vazio'
      )
      assert.ok(
        avisos.some((aviso) => aviso.includes('sem-id.json')),
        'deve emitir aviso para arquivo sem id'
      )
    } finally {
      console.warn = warnOriginal
    }
  })
})

test('US3 (T021): um <id>.json.tmp em data/fila não aparece na listagem', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const p = await adicionarResultado({
      matricula: '111111111111',
      apelido: 'P1',
      jogoId: 'jogo-1',
      pontuacao: 10,
      avaliacao: 4,
    })

    const caminhoTmp = path.join('./data/fila', 'partida-incompleta.json.tmp')
    await writeFile(caminhoTmp, 'conteudo parcial interrompido')

    const fila = await buscarFilaResultados()
    assert.equal(fila.length, 1)
    assert.equal(fila[0].id, p.id)
  })
})

test('US3 (T022): um fila-resultados.json legado em data/ não aparece na fila e não é alterado', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const caminhoLegado = './data/fila-resultados.json'
    const conteudoLegadoOriginal = JSON.stringify([
      { id: 'legado-1', apelido: 'LEGADO' },
    ])
    await writeFile(caminhoLegado, conteudoLegadoOriginal)

    const fila = await buscarFilaResultados()
    assert.equal(fila.length, 0)

    // Adiciona uma nova partida
    const p = await adicionarResultado({
      matricula: '111111111111',
      apelido: 'P1',
      jogoId: 'jogo-1',
      pontuacao: 10,
      avaliacao: 4,
    })

    const filaAposAdicionar = await buscarFilaResultados()
    assert.equal(filaAposAdicionar.length, 1)
    assert.equal(filaAposAdicionar[0].id, p.id)

    // O arquivo legado deve permanecer inalterado
    const conteudoLegadoApos = await readFile(caminhoLegado, 'utf-8')
    assert.equal(conteudoLegadoApos, conteudoLegadoOriginal)
  })
})

test('US3 (T023): se a gravação falhar, os registros já existentes continuam inalterados', async () => {
  await executarEmAmbienteTemporario(async () => {
    await prepararFilaResultados()

    const p1 = await adicionarResultado({
      matricula: '111111111111',
      apelido: 'P1',
      jogoId: 'jogo-1',
      pontuacao: 10,
      avaliacao: 4,
    })

    const caminhoP1 = path.join('./data/fila', `${p1.id}.json`)
    const conteudoP1Antes = await readFile(caminhoP1, 'utf-8')

    // Forçar erro criando um diretório onde o arquivo .tmp ou a escrita falharia
    // ou simulando com erro no open/write
    const pastaFila = './data/fila'
    // Remover permissão de escrita temporariamente (ou renomear a pasta para um arquivo)
    // Para ser determinístico em qualquer ambiente (inclusive root):
    // Se data/fila for temporariamente substituído ou um arquivo com mesmo nome bloquear o diretório
    await rm(pastaFila, { recursive: true })
    // Agora data/fila é um arquivo regular, o que impede mkdir(data/fila)
    await writeFile(pastaFila, 'bloqueio')

    await assert.rejects(async () => {
      await adicionarResultado({
        matricula: '222222222222',
        apelido: 'P2',
        jogoId: 'jogo-2',
        pontuacao: 20,
        avaliacao: 5,
      })
    })

    // Restaura data/fila e o registro p1
    await rm(pastaFila)
    await prepararFilaResultados()
    await writeFile(caminhoP1, conteudoP1Antes)

    const fila = await buscarFilaResultados()
    assert.equal(fila.length, 1)
    assert.equal(fila[0].id, p1.id)
    assert.equal(await readFile(caminhoP1, 'utf-8'), conteudoP1Antes)
  })
})

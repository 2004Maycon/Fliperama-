import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import Fastify from 'fastify'
import { registrarRotaResultados } from '../server/routes/resultados'
import { buscarFilaResultados, prepararFilaResultados } from '../server/services/filaResultadosService'
import { formatarPlacar } from '../server/services/envioResultadosService'

test('POST /resultados salva ANON sem matrícula para envio posterior', async () => {
  const pastaTeste = await mkdtemp(path.join(tmpdir(), 'fliperama-anon-'))
  const pastaOriginal = process.cwd()
  const fastify = Fastify()

  try {
    process.chdir(pastaTeste)
    await prepararFilaResultados()
    await fastify.register(registrarRotaResultados)

    const resposta = await fastify.inject({
      method: 'POST',
      url: '/resultados',
      payload: {
        matricula: '',
        apelido: 'ANON',
        jogoId: 'corrida-contra-o-sino',
        pontuacao: 42,
        avaliacao: 4,
      },
    })

    assert.equal(resposta.statusCode, 200)
    const [partida] = await buscarFilaResultados()
    assert.equal(partida?.apelido, 'ANON')
    assert.equal(partida?.matricula, '')
    assert.equal(partida?.pontuacao, 42)
    assert.equal(partida?.avaliacao, 4)
    assert.equal(partida?.id, resposta.json().resultado.id)
    const arquivoPartida = await readFile(path.join('data/fila', `${partida.id}.json`), 'utf-8')
    assert.deepEqual(JSON.parse(arquivoPartida), partida)
    assert.equal(formatarPlacar(partida).jogador, 'ANON')
    assert.equal(formatarPlacar(partida).id_partida, partida.id)
    assert.equal('matricula' in formatarPlacar(partida), false)
  } finally {
    await fastify.close()
    process.chdir(pastaOriginal)
    await rm(pastaTeste, { recursive: true, force: true })
  }
})

test('POST /resultados permite apelido sem matrícula e normaliza apelido vazio', async () => {
  const pastaTeste = await mkdtemp(path.join(tmpdir(), 'fliperama-apelido-'))
  const pastaOriginal = process.cwd()
  const fastify = Fastify()
  const dados = {
    jogoId: 'corrida-contra-o-sino',
    pontuacao: 120,
    avaliacao: 5,
  }

  try {
    process.chdir(pastaTeste)
    await prepararFilaResultados()
    await fastify.register(registrarRotaResultados)

    const somenteApelido = await fastify.inject({
      method: 'POST', url: '/resultados',
      payload: { ...dados, matricula: '', apelido: 'Bia2' },
    })
    assert.equal(somenteApelido.statusCode, 200)
    assert.equal(somenteApelido.json().resultado.apelido, 'BIA2')
    assert.equal(somenteApelido.json().resultado.matricula, '')

    const apelidoVazio = await fastify.inject({
      method: 'POST', url: '/resultados',
      payload: { ...dados, matricula: '202612345678', apelido: '   ' },
    })
    assert.equal(apelidoVazio.statusCode, 200)
    assert.equal(apelidoVazio.json().resultado.apelido, 'ANON')
    assert.equal(apelidoVazio.json().resultado.matricula, '')

    const identificado = await fastify.inject({
      method: 'POST', url: '/resultados',
      payload: { ...dados, matricula: '202612345678', apelido: 'Bia3' },
    })
    assert.equal(identificado.statusCode, 200)
    assert.equal(identificado.json().resultado.matricula, '202612345678')

    for (const payload of [
      { matricula: '123', apelido: 'BIA' },
      { matricula: '', apelido: 'A-B' },
      { matricula: '', apelido: '1234567890' },
    ]) {
      const invalido = await fastify.inject({
        method: 'POST', url: '/resultados', payload: { ...dados, ...payload },
      })
      assert.equal(invalido.statusCode, 400)
    }

    assert.equal((await buscarFilaResultados()).length, 3)
  } finally {
    await fastify.close()
    process.chdir(pastaOriginal)
    await rm(pastaTeste, { recursive: true, force: true })
  }
})

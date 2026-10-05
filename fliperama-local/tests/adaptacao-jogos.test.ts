import assert from 'node:assert/strict'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'
import { adaptarHtmlDoJogo } from '../server/services/adaptacaoJogosService'
import { extrairPontuacao } from '../src/pages/Jogo/extrairPontuacao'

for (const jogo of [
  { id: 'orbita-do-saber', funcao: 'async function fim()', estado: 'estado', fim: 'fim', pontos: 'g: { pontos: 321 }', chamada: 'fim()' },
  { id: 'logica-em-dungeon', funcao: 'function gameOver()', estado: 'state', fim: 'gameover', pontos: 'game: { score: 321 }', chamada: 'gameOver()' },
]) {
  for (const hospedado of [true, false]) {
    test(`${jogo.id}: ${hospedado ? 'envia o placar uma vez sem pedir nome' : 'preserva o fim de partida fora do fliperama'}`, async () => {
      const mensagens: unknown[] = []
      const self = {}
      const contexto = {
        window: { self, parent: hospedado ? { postMessage: (mensagem: unknown) => mensagens.push(mensagem) } : self },
        musica: { parar() {} },
        ...runInNewContext(`({ ${jogo.pontos} })`),
        [jogo.estado]: 'playing',
        pedidosDeNome: 0,
      }
      const original = `${jogo.funcao} { pedidosDeNome++; }`
      const adaptado = adaptarHtmlDoJogo(original, jogo.id)
      await runInNewContext(`${adaptado}\n${jogo.chamada}`, contexto)
      await runInNewContext(jogo.chamada, contexto)

      assert.equal(contexto.pedidosDeNome, hospedado ? 0 : 2)
      assert.equal(mensagens.length, hospedado ? 1 : 0)
      if (hospedado) {
        assert.equal(extrairPontuacao(mensagens[0], jogo.id), 321)
        assert.equal(contexto[jogo.estado], jogo.fim)
        contexto[jogo.estado] = 'playing'
        await runInNewContext(jogo.chamada, contexto)
        assert.equal(mensagens.length, 2, 'uma nova partida pode enviar seu placar')
      }
      assert.equal(adaptarHtmlDoJogo(adaptado, jogo.id), adaptado)
    })
  }
}

test('mantém Corrida Contra o Sino e rejeita alterações inesperadas nos jogos adaptados', () => {
  const html = '<html>jogo com integração própria</html>'
  assert.equal(adaptarHtmlDoJogo(html, 'corrida-contra-o-sino'), html)
  assert.throws(() => adaptarHtmlDoJogo(html, 'orbita-do-saber'), /função de fim alterada/)
  assert.throws(() => adaptarHtmlDoJogo('function gameOver() {} function gameOver() {}', 'logica-em-dungeon'), /função de fim alterada/)
})

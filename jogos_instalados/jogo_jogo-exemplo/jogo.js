// Quiz Invaders (exemplo): 10 questões por partida, 15 s cada.
// No fim, pede o apelido do jogador e envia a mensagem PLACAR ao fliperama.

const JOGO = 'jogo-exemplo'
const VERSAO = '1.1.0'
const QUESTOES_POR_PARTIDA = 10
const SEGUNDOS_POR_QUESTAO = 15

// Regra do apelido no Recreio Arcade: A-Z e 0-9, até 9 caracteres.
const CARACTERES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const TAMANHO_APELIDO = 9

const $ = (id) => document.getElementById(id)
const tela = $('tela')

let banco = null
let partida = null
let posicao = 0
let bloqueado = true
let relogio = null
// Enquanto não for null, a tela de apelido está aberta.
let apelido = null

async function carregar() {
  try {
    const resposta = await fetch('questoes.json')
    banco = await resposta.json()
  } catch {
    $('resultado').textContent = 'Não foi possível carregar questoes.json.'
  }
}

function embaralhar(lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function iniciar() {
  if (!banco) return
  partida = {
    questoes: embaralhar(banco.questoes).slice(0, QUESTOES_POR_PARTIDA),
    indice: 0,
    pontos: 0,
    acertos: 0,
    erros: 0,
    inicio: Date.now(),
  }
  $('painel').classList.add('escondido')
  mostrarQuestao()
}

function mostrarQuestao() {
  const questao = partida.questoes[partida.indice]
  $('enunciado').textContent = questao.enunciado
  $('progresso').textContent = `Questão ${partida.indice + 1}/${partida.questoes.length}`
  $('mensagem').textContent = ''
  $('alvos').innerHTML = questao.alternativas
    .slice(0, 4)
    .map((texto) => `<div class="alvo">${texto}</div>`)
    .join('')
  posicao = 0
  moverNave()
  bloqueado = false

  let restante = SEGUNDOS_POR_QUESTAO
  $('tempo').textContent = `${restante}s`
  clearInterval(relogio)
  relogio = setInterval(() => {
    restante -= 1
    $('tempo').textContent = `${restante}s`
    if (restante <= 0) responder(null)
  }, 1000)
}

function centroDoAlvo(i) {
  const alvo = $('alvos').children[i]
  const caixaTela = tela.getBoundingClientRect()
  const caixa = alvo.getBoundingClientRect()
  return { x: caixa.left + caixa.width / 2 - caixaTela.left, base: caixa.bottom - caixaTela.top }
}

function moverNave() {
  $('nave').style.left = `${centroDoAlvo(posicao).x}px`
}

function atirar() {
  const { x, base } = centroDoAlvo(posicao)
  const nave = $('nave').getBoundingClientRect()
  const tiro = $('tiro')
  tiro.style.left = `${x}px`
  tiro.style.top = `${base}px`
  tiro.style.height = `${nave.top - tela.getBoundingClientRect().top - base}px`
  tiro.style.display = 'block'
  setTimeout(() => (tiro.style.display = 'none'), 150)
  responder(posicao)
}

function responder(escolha) {
  if (bloqueado) return
  bloqueado = true
  clearInterval(relogio)

  const questao = partida.questoes[partida.indice]
  const alvos = [...$('alvos').children]
  alvos.forEach((alvo, i) => alvo.classList.add(i === questao.correta ? 'certo' : 'errado'))

  if (escolha === questao.correta) {
    const segundos = Number.parseInt($('tempo').textContent, 10) || 0
    partida.pontos += 100 + segundos * 10
    partida.acertos += 1
    $('mensagem').textContent = `Acertou! ${questao.explicacao}`
  } else {
    partida.erros += 1
    $('mensagem').textContent = `${escolha === null ? 'Tempo esgotado.' : 'Errou.'} ${questao.explicacao}`
  }
  $('placar').textContent = `Pontos: ${partida.pontos}`

  setTimeout(() => {
    partida.indice += 1
    if (partida.indice < partida.questoes.length) mostrarQuestao()
    else terminar()
  }, 2200)
}

function terminar() {
  // A duração conta só as questões, não o tempo digitando o apelido.
  partida.duracao_s = Math.round((Date.now() - partida.inicio) / 1000)
  apelido = { letras: [''], cursor: 0 }
  $('pontos-finais').textContent = partida.pontos
  $('apelido').classList.remove('escondido')
  desenharApelido()
}

function desenharApelido() {
  $('letras').innerHTML = Array.from({ length: TAMANHO_APELIDO }, (_, i) => {
    const letra = apelido.letras[i] ?? ''
    return `<span class="${i === apelido.cursor ? 'atual' : ''}">${letra || '&nbsp;'}</span>`
  }).join('')
}

// `letras` guarda uma posição por caractere; '' é a posição vazia onde está o cursor.
function editarApelido(evento) {
  const { letras } = apelido
  const tecla = evento.key.length === 1 ? evento.key.toUpperCase() : evento.key
  const atual = letras[apelido.cursor]

  if (tecla === 'Enter') {
    const jogador = letras.join('')
    if (jogador) enviarPlacar(jogador)
    return evento.preventDefault()
  }

  if (tecla === 'ArrowUp' || tecla === 'ArrowDown') {
    // Pelo joystick: gira a letra da posição atual (começa em A).
    const passo = tecla === 'ArrowUp' ? 1 : -1
    const indice = atual ? CARACTERES.indexOf(atual) : passo === 1 ? -1 : 0
    letras[apelido.cursor] = CARACTERES[(indice + passo + CARACTERES.length) % CARACTERES.length]
  } else if (tecla === 'ArrowRight') {
    if (atual && letras.length < TAMANHO_APELIDO) avancar()
  } else if (tecla === 'ArrowLeft' || tecla === 'Backspace') {
    if (atual) letras[apelido.cursor] = ''
    else if (letras.length > 1) {
      letras.pop()
      apelido.cursor -= 1
      letras[apelido.cursor] = ''
    }
  } else if (CARACTERES.includes(tecla)) {
    // Com as 9 posições cheias, ignora o que for digitado a mais.
    if (atual) return evento.preventDefault()
    letras[apelido.cursor] = tecla
    if (letras.length < TAMANHO_APELIDO) avancar()
  } else {
    return
  }
  evento.preventDefault()
  desenharApelido()
}

function avancar() {
  apelido.letras.push('')
  apelido.cursor = apelido.letras.length - 1
}

function enviarPlacar(jogador) {
  const placar = {
    tipo: 'PLACAR',
    jogo: JOGO,
    versao: VERSAO,
    jogador,
    pontos: partida.pontos,
    duracao_s: partida.duracao_s,
    acertos: partida.acertos,
    erros: partida.erros,
    tema: banco.tema,
  }
  // O fliperama roda o jogo num iframe, recebe o placar por postMessage e o envia à API.
  if (window.parent !== window) window.parent.postMessage(placar, '*')
  console.log('PLACAR', placar)

  $('apelido').classList.add('escondido')
  $('resultado').textContent = `${jogador}: ${placar.pontos} pontos · ${placar.acertos} acertos · ${placar.erros} erros`
  $('painel').classList.remove('escondido')
  apelido = null
  partida = null
}

document.addEventListener('keydown', (evento) => {
  if (apelido) return editarApelido(evento)
  if (!partida) {
    if (evento.key === 'Enter') iniciar()
    return
  }
  if (bloqueado) return
  if (evento.key === 'ArrowLeft') posicao = Math.max(0, posicao - 1)
  else if (evento.key === 'ArrowRight') posicao = Math.min(3, posicao + 1)
  else if (evento.key === ' ' || evento.key === 'Enter') return atirar()
  else return
  evento.preventDefault()
  moverNave()
})

window.addEventListener('resize', () => partida && moverNave())

carregar()

import { mkdir, open, readdir, readFile, rename, rm, stat } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

function obterPastaFila() {
  return './data/fila'
}

function obterPastaEnviadas() {
  return './data/enviadas'
}

function caminhoArquivoFila(id: string) {
  return path.join(obterPastaFila(), `${id}.json`)
}

function caminhoArquivoEnviada(id: string) {
  return path.join(obterPastaEnviadas(), `${id}.json`)
}

async function gravarArquivoAtomico(
  caminhoDestino: string,
  conteudo: string
): Promise<void> {
  const caminhoTmp = `${caminhoDestino}.tmp`
  let handle
  try {
    handle = await open(caminhoTmp, 'w')
    await handle.writeFile(conteudo, 'utf-8')
    await handle.sync()
  } catch (erro) {
    if (handle) {
      await handle.close().catch(() => {})
    }
    await rm(caminhoTmp, { force: true }).catch(() => {})
    throw erro
  }
  await handle.close()

  try {
    await rename(caminhoTmp, caminhoDestino)
  } catch (erro) {
    await rm(caminhoTmp, { force: true }).catch(() => {})
    throw erro
  }
}

export type ResultadoPartida = {
  id: string
  matricula: string
  apelido: string
  jogoId: string
  pontuacao: number
  avaliacao: number
  jogadoEm?: string
}

export async function prepararFilaResultados() {
  await mkdir(obterPastaFila(), { recursive: true })
  await mkdir(obterPastaEnviadas(), { recursive: true })
}

export async function buscarFilaResultados() {
  const pastaFila = obterPastaFila()
  let entradas: string[]
  try {
    entradas = await readdir(pastaFila)
  } catch (erro: unknown) {
    if ((erro as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw erro
  }

  const resultados: ResultadoPartida[] = []

  for (const entrada of entradas) {
    if (!entrada.endsWith('.json')) {
      continue
    }

    const caminhoArquivo = path.join(pastaFila, entrada)
    try {
      const conteudo = await readFile(caminhoArquivo, 'utf-8')
      const parsed = JSON.parse(conteudo)
      if (parsed && typeof parsed === 'object' && typeof parsed.id === 'string') {
        resultados.push(parsed as ResultadoPartida)
      } else {
        console.warn(`Arquivo inválido na fila de resultados: ${entrada}`)
      }
    } catch {
      console.warn(`Erro ao ler arquivo da fila de resultados: ${entrada}`)
    }
  }

  resultados.sort((a, b) => {
    const tempoA = a.jogadoEm || ''
    const tempoB = b.jogadoEm || ''
    if (tempoA !== tempoB) {
      return tempoA.localeCompare(tempoB)
    }
    return a.id.localeCompare(b.id)
  })

  return resultados
}

export async function removerResultado(id: string) {
  const pastaEnviadas = obterPastaEnviadas()

  const caminhoOrigem = caminhoArquivoFila(id)
  const caminhoDestino = caminhoArquivoEnviada(id)

  try {
    await stat(caminhoOrigem)
  } catch (erro: unknown) {
    if ((erro as NodeJS.ErrnoException).code === 'ENOENT') {
      return
    }
    throw erro
  }

  await mkdir(pastaEnviadas, { recursive: true })

  let jaExisteEmEnviadas = false
  try {
    await stat(caminhoDestino)
    jaExisteEmEnviadas = true
  } catch (erro: unknown) {
    if ((erro as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw erro
    }
  }

  if (jaExisteEmEnviadas) {
    await rm(caminhoOrigem, { force: true })
  } else {
    await rename(caminhoOrigem, caminhoDestino)
  }
}

export async function adicionarResultado(
  resultado: Omit<ResultadoPartida, 'id' | 'jogadoEm'>
) {
  const pastaFila = obterPastaFila()
  await mkdir(pastaFila, { recursive: true })

  const id = randomUUID()
  const novoResultado: ResultadoPartida = {
    id,
    ...resultado,
    jogadoEm: new Date().toISOString(),
  }

  const caminhoDestino = caminhoArquivoFila(id)
  await gravarArquivoAtomico(
    caminhoDestino,
    JSON.stringify(novoResultado, null, 2)
  )

  return novoResultado
}

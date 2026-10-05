import { readFile, writeFile } from 'node:fs/promises'

// Compatibilidade das cópias locais: os repositórios dos jogos não são alterados.
const ADAPTACOES: Record<string, { funcao: RegExp; codigo: string }> = {
  'orbita-do-saber': {
    funcao: /async\s+function\s+fim\s*\(\s*\)\s*\{/g,
    codigo: `
  if (window.parent !== window.self) {
    if (estado === "fim") return;
    estado = "fim";
    musica.parar();
    window.parent.postMessage({
      type: "PLACAR", jogo: "orbita-do-saber", payload: { pontos: g.pontos }
    }, "*");
    return;
  }
`,
  },
  'logica-em-dungeon': {
    funcao: /function\s+gameOver\s*\(\s*\)\s*\{/g,
    codigo: `
  if (window.parent !== window.self) {
    if (state === "gameover") return;
    state = "gameover";
    window.parent.postMessage({
      type: "PLACAR", jogo: "logica-em-dungeon", payload: { pontos: game.score }
    }, "*");
    return;
  }
`,
  },
}

const MARCADOR = '/* fliperama: placar da copia local */'

export function adaptarHtmlDoJogo(html: string, jogoId: string): string {
  const adaptacao = ADAPTACOES[jogoId]
  if (!adaptacao || html.includes(MARCADOR)) return html

  const funcoes = [...html.matchAll(adaptacao.funcao)]
  if (funcoes.length !== 1) {
    throw new Error(`Não foi possível integrar o placar de ${jogoId}: função de fim alterada.`)
  }

  return html.replace(adaptacao.funcao, (funcao) => `${funcao}\n${MARCADOR}${adaptacao.codigo}`)
}

export async function adaptarArquivoDoJogo(caminho: string, jogoId: string) {
  const html = await readFile(caminho, 'utf-8')
  const adaptado = adaptarHtmlDoJogo(html, jogoId)
  if (adaptado !== html) await writeFile(caminho, adaptado, 'utf-8')
}

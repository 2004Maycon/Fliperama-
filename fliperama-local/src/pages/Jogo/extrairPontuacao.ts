function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function extrairPontuacao(mensagem: unknown, jogoEsperado: string): number | null {
  if (!isRecord(mensagem) || mensagem.jogo !== jogoEsperado || !isRecord(mensagem.payload)) {
    return null
  }

  const campoPontuacao = mensagem.type === 'PLACAR'
    ? 'pontos'
    : mensagem.type === 'GAME_OVER'
      ? 'score'
      : null

  if (campoPontuacao === null) return null

  const pontuacao = mensagem.payload[campoPontuacao]
  return typeof pontuacao === 'number' && Number.isFinite(pontuacao) && pontuacao >= 0
    ? pontuacao
    : null
}

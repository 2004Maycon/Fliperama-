import { useEffect, useRef, type SyntheticEvent } from 'react'
import './Jogo.css'
import type { Jogo as TipoJogo } from '../../types/Jogo'
import { GameFrame } from './GameFrame'
import { extrairPontuacaoDaMensagemAtiva, sendArcadeInitMessage } from './arcadeMessages'

type JogoProps = {
  jogo: TipoJogo
  onFinalizar: (pontuacao: number)=> void
  onVoltarInicio: () => void
}

function Jogo({ jogo, onFinalizar, onVoltarInicio }: JogoProps) {
  const iframe = useRef<HTMLIFrameElement>(null)
  const finalizado = useRef(false)

  useEffect(() => {
    finalizado.current = false

    function receberMensagem(event: MessageEvent) {
      if (finalizado.current) return

      const pontuacao = extrairPontuacaoDaMensagemAtiva(
        event.source,
        iframe.current,
        jogo.id,
        event.data,
      )
      if (pontuacao === null) return

      finalizado.current = true
      onFinalizar(pontuacao)
    }

    window.addEventListener('message', receberMensagem)

    return () => {
      window.removeEventListener('message', receberMensagem)
    }
  }, [jogo.id, onFinalizar])

  function inicializarJogo(event: SyntheticEvent<HTMLIFrameElement>) {
    sendArcadeInitMessage(event.currentTarget, iframe.current)
  }

  return (
    <main className="jogo-screen">
        <header className="jogo-header">
          <h1>JOGO EM EXECUÇÃO</h1>

          <p>Jogo selecionado: {jogo.nome}</p>

          <button
            className="botao-inicio"
            onClick={onVoltarInicio}
          >
            VOLTAR AO INÍCIO
          </button>
        </header>

        <section className="game-container">
        <GameFrame
          iframeRef={iframe}
          src={jogo.caminho}
          title={jogo.nome}
          onLoad={inicializarJogo}
        />
        </section>
    </main>
    )
}

export default Jogo

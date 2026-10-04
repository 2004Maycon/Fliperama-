import { extrairPontuacao } from './extrairPontuacao'

export const ARCADE_IFRAME_SANDBOX = 'allow-scripts'

export type ArcadeInitMessage = {
  type: 'ARCADE_INIT'
  mudo: false
  recordes: []
}

export type IframeMessageTarget = {
  isConnected: boolean
  contentWindow: {
    postMessage(message: ArcadeInitMessage, targetOrigin: string): void
  } | null
}

const initializedFrames = new WeakSet<object>()

export function sendArcadeInitMessage(
  loadedFrame: IframeMessageTarget | null,
  activeFrame: IframeMessageTarget | null,
): boolean {
  if (
    loadedFrame === null ||
    loadedFrame !== activeFrame ||
    !loadedFrame.isConnected ||
    loadedFrame.contentWindow === null ||
    initializedFrames.has(loadedFrame)
  ) return false

  loadedFrame.contentWindow.postMessage({
    type: 'ARCADE_INIT',
    mudo: false,
    recordes: [],
  }, '*')
  initializedFrames.add(loadedFrame)
  return true
}

export function extrairPontuacaoDaMensagemAtiva(
  source: unknown,
  activeFrame: IframeMessageTarget | null,
  activeGameId: string,
  data: unknown,
): number | null {
  if (
    activeFrame === null ||
    !activeFrame.isConnected ||
    activeFrame.contentWindow === null ||
    source !== activeFrame.contentWindow
  ) return null

  return extrairPontuacao(data, activeGameId)
}

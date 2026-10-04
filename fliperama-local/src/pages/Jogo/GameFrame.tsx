import { createElement, type ReactEventHandler, type Ref } from 'react'
import { ARCADE_IFRAME_SANDBOX } from './arcadeMessages'

type GameFrameProps = {
  src: string
  title: string
  iframeRef?: Ref<HTMLIFrameElement>
  onLoad?: ReactEventHandler<HTMLIFrameElement>
}

export function GameFrame({ src, title, iframeRef, onLoad }: GameFrameProps) {
  return createElement('iframe', {
    ref: iframeRef,
    src,
    title,
    className: 'game-frame',
    sandbox: ARCADE_IFRAME_SANDBOX,
    onLoad,
  })
}

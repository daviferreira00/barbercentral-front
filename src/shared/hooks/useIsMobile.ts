"use client"

import { useSyncExternalStore } from "react"

// Celulares e tablets usam a experiência em formato de app. O desktop completo
// só entra quando há largura suficiente para sidebar e conteúdo lado a lado.
const MOBILE_QUERY = "(max-width: 1199px)"

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches

// No servidor / primeiro render de hidratação ainda não sabemos o tamanho da tela
const getServerSnapshot = () => null

/**
 * Retorna `null` antes do primeiro paint no cliente (renderize um fallback),
 * depois `true` (<1200px) ou `false` (>=1200px), reagindo a resize/rotação.
 */
export function useIsMobile(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, getSnapshot, getServerSnapshot)
}

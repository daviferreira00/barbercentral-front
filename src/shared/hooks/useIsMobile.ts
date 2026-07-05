"use client"

import { useSyncExternalStore } from "react"

// Mesmo breakpoint do `md:` do Tailwind — abaixo de 768px é experiência mobile
const MOBILE_QUERY = "(max-width: 767px)"

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
 * depois `true` (<768px) ou `false` (>=768px), reagindo a resize/rotação.
 */
export function useIsMobile(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, getSnapshot, getServerSnapshot)
}

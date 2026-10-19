import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskPhone(value: string): string {
  if (!value) return ""
  const digits = value.replace(/\D/g, "")
  const cleanDigits = digits.substring(0, 11)
  
  if (cleanDigits.length <= 2) {
    return cleanDigits.length > 0 ? `(${cleanDigits}` : ""
  }
  if (cleanDigits.length <= 6) {
    return `(${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2)}`
  }
  if (cleanDigits.length <= 10) {
    return `(${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 6)}-${cleanDigits.substring(6)}`
  }
  return `(${cleanDigits.substring(0, 2)}) ${cleanDigits.substring(2, 7)}-${cleanDigits.substring(7)}`
}

/**
 * Normaliza URLs de imagem para garantir exibição correta em produção e local.
 * Se a URL contiver referências a localhost, 127.0.0.1 ou host.docker.internal
 * (com qualquer porta) seguido de /uploads/..., converte para o caminho relativo "/uploads/...".
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return ""
  if (/^https?:\/\/(localhost|127\.0\.0\.1|host\.docker\.internal)(:\d+)?\/uploads\//i.test(url)) {
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1|host\.docker\.internal)(:\d+)?/i, "")
  }
  return url
}

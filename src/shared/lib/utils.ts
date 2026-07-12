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

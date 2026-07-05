// Feedback tátil leve em toques importantes (Android; iOS Safari ignora)
export function haptic(pattern: number | number[] = 12) {
  if (typeof navigator !== "undefined") navigator.vibrate?.(pattern)
}

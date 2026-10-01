// Bound the canvas allocation even on high-DPI phones and when zoomed in.
export function canvasPixelRatio(width, height, deviceRatio = 1) {
  return Math.min(Math.max(deviceRatio, 1), 2, Math.sqrt(4_000_000 / (width * height)))
}

export function safePdfLink(value) {
  if (typeof value !== 'string') return ''
  try {
    const url = new URL(value)
    return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

export function requestedPage(value, count) {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 && page <= count ? page : null
}

export function pinchZoom(startZoom, startDistance, distance) {
  if (!Number.isFinite(startZoom) || startZoom <= 0) return 1
  if (![startDistance, distance].every(Number.isFinite) || startDistance <= 0 || distance <= 0) return startZoom
  return Math.round(Math.min(3, Math.max(1, startZoom * distance / startDistance)) * 100) / 100
}

export function anchoredScroll(contentStart, fraction, length, viewportPoint) {
  return Math.max(0, contentStart + fraction * length - viewportPoint)
}

// Native, non-passive Touch listeners handle two fingers. Single-finger scrolling
// stays with the browser; no application-wide touch or page zoom is disabled.
export function attachPdfPinch({ host, surface, page, ready, getZoom, commit }) {
  let gesture = null
  let frame = 0
  let suppressClickUntil = 0
  const midpoint = (a, b) => ({ x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 })
  const distance = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  const clearPreview = () => {
    surface.style.width = ''
    surface.style.height = ''
    page.style.transform = ''
    page.style.willChange = ''
  }
  const cancel = () => {
    cancelAnimationFrame(frame)
    frame = 0
    gesture = null
    clearPreview()
  }
  const focus = (anchor, width, height) => {
    const hostRect = host.getBoundingClientRect()
    const rect = surface.getBoundingClientRect()
    host.scrollLeft = anchoredScroll(rect.left - hostRect.left + host.scrollLeft, anchor.x, width, anchor.viewportX)
    host.scrollTop = anchoredScroll(rect.top - hostRect.top + host.scrollTop, anchor.y, height, anchor.viewportY)
  }
  const apply = () => {
    frame = 0
    if (!gesture) return
    const scale = gesture.zoom / gesture.startZoom
    const width = gesture.width * scale
    const height = gesture.height * scale
    surface.style.width = `${width}px`
    surface.style.height = `${height}px`
    page.style.transform = `scale(${scale})`
    focus(gesture.anchor, width, height)
  }
  const start = (event) => {
    if (gesture || event.touches.length < 2 || !ready()) return
    const [a, b] = event.touches
    const initialDistance = distance(a, b)
    if (initialDistance < 8) return
    const center = midpoint(a, b)
    const hostRect = host.getBoundingClientRect()
    const pageRect = page.getBoundingClientRect()
    if (!pageRect.width || !pageRect.height) return
    gesture = {
      ids: [a.identifier, b.identifier], startZoom: getZoom(), zoom: getZoom(),
      distance: initialDistance, width: pageRect.width, height: pageRect.height,
      anchor: {
        x: Math.min(1, Math.max(0, (center.x - pageRect.left) / pageRect.width)),
        y: Math.min(1, Math.max(0, (center.y - pageRect.top) / pageRect.height)),
        viewportX: center.x - hostRect.left, viewportY: center.y - hostRect.top,
      },
    }
    page.style.willChange = 'transform'
    if (event.cancelable) event.preventDefault()
  }
  const pair = (touches) => gesture?.ids.map((id) => [...touches].find((touch) => touch.identifier === id))
  const move = (event) => {
    if (!gesture) return
    const [a, b] = pair(event.touches)
    if (!a || !b) return
    if (event.cancelable) event.preventDefault()
    gesture.zoom = pinchZoom(gesture.startZoom, gesture.distance, distance(a, b))
    const center = midpoint(a, b)
    const rect = host.getBoundingClientRect()
    gesture.anchor.viewportX = center.x - rect.left
    gesture.anchor.viewportY = center.y - rect.top
    if (!frame) frame = requestAnimationFrame(apply)
  }
  const end = (event) => {
    if (!gesture) return
    if (pair(event.touches).every(Boolean)) return
    cancelAnimationFrame(frame)
    apply()
    const completed = gesture
    gesture = null
    suppressClickUntil = Date.now() + 500
    if (completed.zoom === completed.startZoom) {
      clearPreview()
      focus(completed.anchor, completed.width, completed.height)
    } else {
      // Keep the preview until the high-quality render replaces it.
      commit(completed.zoom, completed.anchor)
    }
  }
  const click = (event) => {
    if (Date.now() >= suppressClickUntil) return
    event.preventDefault()
    event.stopPropagation()
  }
  host.addEventListener('touchstart', start, { passive: false })
  host.addEventListener('touchmove', move, { passive: false })
  host.addEventListener('touchend', end)
  host.addEventListener('touchcancel', cancel)
  host.addEventListener('click', click, true)
  return {
    cancel,
    focus,
    isActive: () => Boolean(gesture),
    destroy() {
      cancel()
      host.removeEventListener('touchstart', start)
      host.removeEventListener('touchmove', move)
      host.removeEventListener('touchend', end)
      host.removeEventListener('touchcancel', cancel)
      host.removeEventListener('click', click, true)
    },
  }
}

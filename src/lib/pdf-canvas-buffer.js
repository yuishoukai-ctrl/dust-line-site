import { canvasPixelRatio } from './pdf-viewer.js'

// Keep the visible page (including its pinch preview) intact while PDF.js paints.
// Only one temporary canvas is allocated, capped at the same pixel limit.
export async function renderBufferedPage({
  page, viewport, visibleCanvas, deviceRatio, isActive,
  onTask, beforeCommit, createCanvas = () => document.createElement('canvas'),
}) {
  const buffer = createCanvas()
  const ratio = canvasPixelRatio(viewport.width, viewport.height, deviceRatio)
  buffer.width = Math.floor(viewport.width * ratio)
  buffer.height = Math.floor(viewport.height * ratio)
  try {
    const task = page.render({
      canvasContext: buffer.getContext('2d'), viewport,
      transform: [ratio, 0, 0, ratio, 0, 0],
    })
    onTask(task)
    await task.promise
    if (!isActive()) return null
    const annotations = await page.getAnnotations()
    if (!isActive()) return null
    const context = visibleCanvas.getContext('2d')
    if (!context) throw new Error('Canvas display context is unavailable')
    // Resizing clears a canvas. Resize and copy in the same synchronous turn,
    // after the replacement is complete, so there is no empty painted frame.
    beforeCommit()
    visibleCanvas.width = buffer.width
    visibleCanvas.height = buffer.height
    visibleCanvas.style.width = `${viewport.width}px`
    visibleCanvas.style.height = `${viewport.height}px`
    context.drawImage(buffer, 0, 0)
    return annotations
  } finally {
    buffer.width = 0
    buffer.height = 0
  }
}

import test from 'node:test'
import assert from 'node:assert/strict'
import { renderBufferedPage } from '../src/lib/pdf-canvas-buffer.js'

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
function fixture() {
  const render = deferred(), annotations = deferred(), annotationRequested = deferred()
  const events = []
  const visible = { width: 100, height: 200, pixels: 'old page', style: { width: '100px', height: '200px' } }
  const buffer = { width: 0, height: 0, pixels: 'replacement page', getContext: () => ({}) }
  visible.getContext = () => ({ drawImage(source) { events.push('copy'); visible.pixels = source.pixels } })
  let active = true, task
  const page = {
    render() { return { promise: render.promise } },
    getAnnotations() { annotationRequested.resolve(); return annotations.promise },
  }
  const start = (viewport = { width: 300, height: 600 }, deviceRatio = 1) => renderBufferedPage({
    page, viewport, visibleCanvas: visible, deviceRatio,
    isActive: () => active, onTask: (value) => { task = value },
    beforeCommit: () => { events.push('commit'); assert.equal(visible.pixels, 'old page') },
    createCanvas: () => buffer,
  })
  const oldPage = () => assert.deepEqual(
    { width: visible.width, height: visible.height, pixels: visible.pixels, style: visible.style },
    { width: 100, height: 200, pixels: 'old page', style: { width: '100px', height: '200px' } },
  )
  const freed = () => { assert.equal(buffer.width, 0); assert.equal(buffer.height, 0) }
  return { render, annotations, annotationRequested, visible, buffer, events, start, oldPage, freed,
    deactivate: () => { active = false }, getTask: () => task }
}

test('zoom preserves the visible page until both replacement pixels and links are ready', async () => {
  const f = fixture(), pending = f.start()
  f.oldPage()
  assert.equal(f.getTask().promise, f.render.promise)
  f.render.resolve()
  await f.annotationRequested.promise
  f.oldPage()
  assert.deepEqual(f.events, [])
  const links = [{ subtype: 'Link' }]
  f.annotations.resolve(links)
  assert.deepEqual(await pending, links)
  assert.deepEqual(f.events, ['commit', 'copy'])
  assert.equal(f.visible.pixels, 'replacement page')
  assert.equal(f.visible.width, 300)
  assert.equal(f.visible.height, 600)
  assert.deepEqual(f.visible.style, { width: '300px', height: '600px' })
  f.freed()
})

test('a superseded render cannot overwrite the current visible page', async () => {
  const f = fixture(), pending = f.start()
  f.deactivate()
  f.render.resolve()
  assert.equal(await pending, null)
  f.oldPage(); f.freed()
  assert.deepEqual(f.events, [])
})

test('navigation while annotations are loading also discards stale replacement pixels', async () => {
  const f = fixture(), pending = f.start()
  f.render.resolve()
  await f.annotationRequested.promise
  f.deactivate()
  f.annotations.resolve([])
  assert.equal(await pending, null)
  f.oldPage(); f.freed()
})

test('cancelled or failed PDF painting retains old pixels and releases temporary memory', async () => {
  const f = fixture(), pending = f.start()
  const failure = new Error('cancelled')
  failure.name = 'RenderingCancelledException'
  const rejected = assert.rejects(pending, { name: 'RenderingCancelledException' })
  f.render.reject(failure)
  await rejected
  f.oldPage(); f.freed()
  assert.deepEqual(f.events, [])
})

test('annotation failure never clears a successfully displayed page', async () => {
  const f = fixture(), pending = f.start()
  f.render.resolve()
  await f.annotationRequested.promise
  const rejected = assert.rejects(pending, /annotations unavailable/)
  f.annotations.reject(new Error('annotations unavailable'))
  await rejected
  f.oldPage(); f.freed()
})

test('the temporary high-density zoom canvas stays within four million pixels', async () => {
  const f = fixture(), pending = f.start({ width: 3000, height: 4000 }, 3)
  assert.ok(f.buffer.width * f.buffer.height <= 4_000_000)
  f.render.resolve(); f.annotations.resolve([])
  await pending
  assert.ok(f.visible.width * f.visible.height <= 4_000_000)
  assert.deepEqual(f.visible.style, { width: '3000px', height: '4000px' })
  f.freed()
})

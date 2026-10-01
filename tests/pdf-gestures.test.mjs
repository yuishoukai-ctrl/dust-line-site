import test from 'node:test'
import assert from 'node:assert/strict'
import { anchoredScroll, attachPdfPinch, pinchZoom } from '../src/lib/pdf-gestures.js'

test('pinch follows the original finger span rather than compounding every move', () => {
  assert.equal(pinchZoom(1.5, 100, 200), 3)
  assert.equal(pinchZoom(1, 100, 200), 2)
  assert.equal(pinchZoom(1, 100, 250), 2.5)
  assert.equal(pinchZoom(2, 200, 150), 1.5)
})
test('zoom bounds and malformed finger spans cannot allocate an unbounded canvas', () => {
  assert.equal(pinchZoom(1, 10, 1000), 3)
  assert.equal(pinchZoom(2, 100, 1), 1)
  for (const value of [0, -1, NaN, Infinity]) assert.equal(pinchZoom(1.5, 100, value), 1.5)
  assert.equal(pinchZoom(NaN, 100, 200), 1)
})
test('reading point stays under the finger midpoint as the page grows', () => {
  const scroll = anchoredScroll(12, .46, 600, 150)
  assert.equal(scroll, 138)
  assert.equal(12 + .46 * 600 - scroll, 150)
  assert.equal(anchoredScroll(12, 0, 300, 100), 0)
})

function fixture(run) {
  const oldRequest = globalThis.requestAnimationFrame
  const oldCancel = globalThis.cancelAnimationFrame
  const frames = new Map()
  let nextFrame = 0
  globalThis.requestAnimationFrame = (callback) => { frames.set(++nextFrame, callback); return nextFrame }
  globalThis.cancelAnimationFrame = (id) => frames.delete(id)
  const listeners = new Map()
  const host = {
    scrollLeft: 0, scrollTop: 0,
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    addEventListener: (type, handler, options) => listeners.set(type, { handler, options }),
    removeEventListener: (type) => listeners.delete(type),
  }
  const surface = {
    style: {},
    getBoundingClientRect: () => ({ left: 12 - host.scrollLeft, top: 12 - host.scrollTop }),
  }
  const page = { style: {}, getBoundingClientRect: () => ({ left: 12, top: 12, width: 300, height: 400 }) }
  const commits = []
  let allowed = true
  const pinch = attachPdfPinch({ host, surface, page, ready: () => allowed, getZoom: () => 1, commit: (...args) => commits.push(args) })
  const touch = (identifier, clientX, clientY = 100) => ({ identifier, clientX, clientY })
  const send = (type, touches) => {
    const event = { touches, cancelable: true, prevented: false, stopped: false,
      preventDefault() { this.prevented = true }, stopPropagation() { this.stopped = true } }
    listeners.get(type).handler(event)
    return event
  }
  const flush = () => { const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback() }
  try { run({ host, surface, page, commits, listeners, frames, pinch, touch, send, flush, setReady: (value) => { allowed = value } }) }
  finally { pinch.destroy(); globalThis.requestAnimationFrame = oldRequest; globalThis.cancelAnimationFrame = oldCancel }
}

test('one finger retains browser scrolling and does not change zoom', () => fixture(({ send, touch, commits }) => {
  assert.equal(send('touchstart', [touch(1, 100)]).prevented, false)
  assert.equal(send('touchmove', [touch(1, 120)]).prevented, false)
  assert.equal(commits.length, 0)
}))
test('two fingers preview smoothly and commit only once after release', () => fixture(({ send, touch, flush, commits, page, host, surface, pinch }) => {
  assert.equal(send('touchstart', [touch(1, 100), touch(2, 200)]).prevented, true)
  assert.equal(pinch.isActive(), true)
  assert.equal(send('touchmove', [touch(2, 250), touch(1, 50)]).prevented, true)
  flush()
  assert.equal(page.style.transform, 'scale(2)')
  assert.equal(surface.style.width, '600px')
  assert.equal(surface.style.height, '800px')
  assert.equal(host.scrollLeft, 138)
  assert.equal(host.scrollTop, 88)
  assert.equal(commits.length, 0)
  send('touchend', [touch(2, 250)])
  assert.equal(commits.length, 1)
  assert.equal(commits[0][0], 2)
  assert.equal(pinch.isActive(), false)
  send('touchend', [])
  assert.equal(commits.length, 1)
}))
test('loading or rendering pages do not start a pinch against stale canvas geometry', () => fixture(({ send, touch, commits, pinch, setReady }) => {
  setReady(false)
  assert.equal(send('touchstart', [touch(1, 100), touch(2, 200)]).prevented, false)
  assert.equal(pinch.isActive(), false)
  send('touchmove', [touch(1, 50), touch(2, 250)])
  send('touchend', [])
  assert.equal(commits.length, 0)
}))
test('pinching over a link does not accidentally open it after the fingers lift', () => fixture(({ send, touch }) => {
  send('touchstart', [touch(1, 100), touch(2, 200)])
  send('touchmove', [touch(1, 50), touch(2, 250)])
  send('touchend', [])
  const click = send('click', [])
  assert.equal(click.prevented, true)
  assert.equal(click.stopped, true)
}))
test('cancel and unmount discard pending previews and remove all listeners', () => fixture(({ send, touch, pinch, frames, page, surface, listeners, commits }) => {
  send('touchstart', [touch(1, 100), touch(2, 200)])
  send('touchmove', [touch(1, 50), touch(2, 250)])
  assert.equal(frames.size, 1)
  send('touchcancel', [])
  assert.equal(frames.size, 0)
  assert.equal(page.style.transform, '')
  assert.equal(surface.style.width, '')
  assert.equal(commits.length, 0)
  pinch.destroy()
  assert.equal(listeners.size, 0)
}))

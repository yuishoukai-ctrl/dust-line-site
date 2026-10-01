import test from 'node:test'
import assert from 'node:assert/strict'
import { canvasPixelRatio, requestedPage, safePdfLink } from '../src/lib/pdf-viewer.js'

test('high-DPI and zoomed canvases stay under the phone memory bound', () => {
  for (const [width, height, deviceRatio] of [[366, 518, 3], [2200, 3113, 3], [4000, 5657, 4]]) {
    const ratio = canvasPixelRatio(width, height, deviceRatio)
    assert.ok(width * height * ratio * ratio <= 4_000_001)
    assert.ok(ratio <= 2)
  }
})
test('PDF annotation links cannot execute scripts or point at local files', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,example', 'file:///C:/private', '/account/', undefined]) {
    assert.equal(safePdfLink(value), '')
  }
  assert.equal(safePdfLink('https://dustline.jp/garage/'), 'https://dustline.jp/garage/')
  assert.equal(safePdfLink('mailto:info@example.com'), 'mailto:info@example.com')
})
test('page jump rejects fractional, non-numeric and out-of-issue pages', () => {
  for (const value of ['', 'abc', '0', '-1', '1.5', '131']) assert.equal(requestedPage(value, 130), null)
  assert.equal(requestedPage('130', 130), 130)
  assert.equal(requestedPage('1', 130), 1)
})

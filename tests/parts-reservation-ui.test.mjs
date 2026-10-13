import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { transformWithOxc } from 'vite'
import * as library from '../src/lib/parts-reservation.js'

async function markup(enabled = true, slug = 'f450gs-radiator-guard') {
  const source = await readFile(new URL('../src/PartsReservationForm.jsx', import.meta.url), 'utf8')
  const transformed = await transformWithOxc(source, 'PartsReservationForm.jsx', { jsx: { runtime: 'automatic' } })
  const context = vm.createContext({})
  const imports = { react: React, 'react/jsx-runtime': jsxRuntime, './TurnstileChallenge': { default: () => null }, './lib/parts-reservation-config': { partsReservationConfig: { enabled } }, './lib/parts-reservation': library, './parts-reservation.css': {} }
  const module = new vm.SourceTextModule(transformed.code, { context })
  await module.link(specifier => {
    const values = imports[specifier]; assert.ok(values)
    return new vm.SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value) }, { context })
  })
  await module.evaluate()
  return renderToStaticMarkup(React.createElement(module.namespace.default, { product: { slug, name: '対象商品', priceLabel: '12,800円', priceNote: '税込・販売予定価格' }, contactUrl: 'https://example.invalid/contact' }))
}
test('only the two selected products expose a form and disabled feature stays closed', async () => {
  assert.equal(await markup(false), '')
  assert.equal(await markup(true, 'f450gs-hose-guard'), '')
  assert.ok((await markup(true, 'f450gs-rear-master-cylinder-guard')).includes('無料で、仮予約する。'))
})
test('guest reservation requires consent and avoids payment/address/password collection', async () => {
  const html = await markup()
  assert.match(html, /会員登録は不要/); assert.match(html, /自動で請求しません/)
  assert.match(html, /送料未定/); assert.match(html, /数量の追加として扱いません/)
  assert.match(html, /<button[^>]*disabled[^>]*>無料仮予約を送信する/)
  assert.doesNotMatch(html, /name="(?:password|address|card_number)"/)
  assert.match(html, /href="\/privacy\/"/)
})

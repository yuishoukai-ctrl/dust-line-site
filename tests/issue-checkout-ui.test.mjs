import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import vm from 'node:vm'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import {renderToStaticMarkup} from 'react-dom/server'
import {transformWithOxc} from 'vite'
import * as checkout from '../src/lib/issue-checkout.js'
import * as navigation from '../src/lib/member-navigation.js'

async function markup({enabled=false,search=''}={}) {
  const source=await readFile(new URL('../src/IssueCheckout.jsx',import.meta.url),'utf8')
  const transformed=await transformWithOxc(source,'IssueCheckout.jsx',{jsx:{runtime:'automatic'}})
  const context=vm.createContext({window:{location:{search}},URLSearchParams})
  const imports={react:React,'react/jsx-runtime':jsxRuntime,'./lib/supabaseClient':{supabase:null},'./lib/issue-checkout':checkout,'./lib/member-navigation':navigation,'./issue-checkout.css':{}}
  const module=new vm.SourceTextModule(transformed.code,{context,initializeImportMeta:meta=>{meta.env={VITE_ISSUE_PAYMENTS_ENABLED:enabled?'true':'false',DEV:false}}})
  await module.link(specifier=>{const values=imports[specifier];assert.ok(values,`unexpected dependency ${specifier}`);return new vm.SyntheticModule(Object.keys(values),function(){for(const [key,value] of Object.entries(values))this.setExport(key,value)},{context})})
  await module.evaluate()
  return renderToStaticMarkup(React.createElement(module.namespace.default))
}

test('closed sales show a disabled purchase and keep library/terms links',async()=>{
  const html=await markup()
  assert.match(html,/<button[^>]*disabled[^>]*>現在は購入できません<\/button>/)
  assert.doesNotMatch(html,/type="checkbox"|1,480円で購入手続きへ|決済接続テスト用/)
  for(const href of ['/library/','/refund-policy/','/digital-delivery/','/commercial-disclosure/'])assert.ok(html.includes(`href="${href}"`))
})

test('an existing checkout return can read its status while new sales are closed',async()=>{
  const html=await markup({search:'?checkout=return&order_id=11111111-1111-4111-8111-111111111111'})
  assert.match(html,/決済結果を確認しています/)
  assert.match(html,/購入状態を再確認/)
  assert.doesNotMatch(html,/1,480円で購入手続きへ|type="checkbox"/)
})

test('enabled sales still require the purchase-conditions checkbox',async()=>{
  const html=await markup({enabled:true})
  assert.match(html,/type="checkbox"/)
  assert.match(html,/<button[^>]*disabled[^>]*>1,480円で購入手続きへ<\/button>/)
  assert.match(html,/自動更新なし/)
})

const record={id:'issue-02',issue_number:2,title:'DUST LINE 第2号',status:'published',price_jpy:1480,published_at:'2026-12-01T00:00:00Z'}
test('paid metadata never publishes an upcoming, malformed or free issue',()=>{
  assert.equal(checkout.paidIssueMetadata({...record,status:'upcoming'}),null)
  assert.equal(checkout.paidIssueMetadata({...record,id:'../private'}),null)
  assert.equal(checkout.paidIssueMetadata({...record,price_jpy:0}),null)
  assert.equal(checkout.paidIssueMetadata(record).readerPath,'/issues/issue-02/')
})

test('library reads only the requested member rights, filters expired rights and deduplicates issues',async()=>{
  const calls=[]
  const client={from(table){calls.push(['table',table]);return {select(){return {eq(column,value){calls.push(['eq',column,value]);return {async eq(){return {data:[{issue_id:'issue-02',expires_at:null},{issue_id:'issue-02',expires_at:null},{issue_id:'issue-03',expires_at:'2000-01-01T00:00:00Z'}],error:null}}}},async in(column,ids){calls.push(['in',column,ids]);return {data:[record],error:null}}}}}}}
  const result=await checkout.loadPurchasedIssues(client,'member-a',Date.parse('2026-10-06T00:00:00Z'))
  assert.equal(result.length,1)
  assert.deepEqual(calls.filter(c=>c[0]==='eq'),[['eq','user_id','member-a']])
  assert.deepEqual(calls.find(c=>c[0]==='in'),['in','id',['issue-02']])
})

test('failed purchase lookup is reported as failure rather than an empty library',async()=>{
  const failure=new Error('database unavailable')
  const client={from(){return {select(){return {eq(){return {async eq(){return {data:null,error:failure}}}}}}}}}
  await assert.rejects(checkout.loadPurchasedIssues(client,'member-a'),error=>error===failure)
})

test('checkout errors expose only an allowed public error code',async()=>{
  for(const [raw,expected] of [['SALES_CLOSED','SALES_CLOSED'],['internal secret error','UNAVAILABLE']]){
    const client={functions:{async invoke(){return {error:{context:{async json(){return {error:raw}}}}}}}}
    await assert.rejects(checkout.callIssueCheckout(client,{action:'checkout',issue_id:'issue-02'}),error=>error.code===expected&&error.message===expected)
  }
})

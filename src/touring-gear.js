// The default is the public Store ID supplied by the site owner.
// Vite's environment configuration can override it for another approved site.
const associateTag = (import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'dustline1941-22').trim()

function taggedAmazonUrl(url) {
  if (/^[a-zA-Z0-9_-]+-22$/.test(associateTag)) url.searchParams.set('tag', associateTag)
  return url.toString()
}

export function amazonGearSearch(query) {
  const url = new URL('https://www.amazon.co.jp/s')
  url.searchParams.set('k', query)
  return taggedAmazonUrl(url)
}

export function amazonGearProduct(asin) {
  return taggedAmazonUrl(new URL(`https://www.amazon.co.jp/dp/${encodeURIComponent(asin)}`))
}

// Selected by the editorial team; no firsthand usage comments were supplied.
export const recommendedMirror = {
  name: 'ボールジョイント式バイクミラー',
  brand: 'Tewgug',
  asin: 'B0CNSZ3CBD',
  set: '左右セット',
  description: 'ミラー位置を調整できるボールジョイントを備え、左右2個のミラーと取り付け用部品がセットになっています。',
  mounting: '商品説明では、8mm／10mmの正ネジ用部品と、7/8インチのハンドルバー用クランプが案内されています。',
  fitNote: '購入前に、車両側のネジ径・ネジ方向・ピッチ、必要なアダプターをご確認ください。',
}

export const repairGear = [
  {
    name: 'DRC PROタイヤレバー 260mm',
    detail: '幅広のスプーン部を持つタイヤレバー。260mmを携行用の購入候補に。収納場所と、作業に必要な本数を確認したい。',
    query: 'DRC PRO タイヤレバー 260mm F8095',
    source: 'https://www.dirtbikeplus.jp/products/detail/719',
  },
  {
    name: 'マルニ ワンパッチキット 10120',
    detail: 'チューブ用パッチ、エコ・セメント、サンドペーパーのセット。タイヤレバーや空気入れは別に準備する。',
    query: 'マルニ パンク修理 キット MA10120 10120',
    source: 'https://maruni-ind.co.jp/products/10120/',
  },
  {
    name: 'DRC C302 ミニフロアポンプ',
    detail: 'フロア式の携帯ポンプ。ホースの取り回しと車両のバルブへの接続、バッグに収まる寸法を確認して選ぶ。',
    query: 'DRC C302 ミニフロアポンプ D9981',
    source: 'https://www.dirtbikeplus.jp/products/detail/6075',
  },
]

export const packingGear = [
  {
    name: 'タナックス キャンピングシートバッグ2',
    detail: 'キャンプ道具をまとめる大型バッグの候補。ブラックはMFK-102。車体への固定方法、積載上限、レインカバーの使用条件を確かめたい。',
    query: 'タナックス キャンピングシートバッグ2 MFK-102',
    source: 'https://www.tanax.co.jp/motofizz/seat_bag/mfk-102/',
  },
]

export const campingGear = [
  {
    name: 'コールマン ツーリングドーム/ST',
    detail: '高さのある前室を備えたテント。メーカー公表の収納サイズは約φ19×49cm、重量は約4kg。積載スペースと重さを確認して選ぶ。',
    query: 'コールマン ツーリングドーム ST 2000038141',
    source: 'https://ec.coleman.co.jp/ext/pickup_touring_dome_st.html',
  },
  {
    name: 'GENTOS EX-334D',
    detail: '単3形アルカリ電池4本を使うLEDランタン。白色・昼白色・暖色への切り替えと、無段階の調光ができる。',
    query: 'GENTOS EX-334D ランタン',
    source: 'https://store.gentos.jp/products/ex-334d',
  },
]

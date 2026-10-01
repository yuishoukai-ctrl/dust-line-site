// Public journal metadata only. PDF paths and access rights remain in Supabase.
export const journal = Object.freeze({
  title: 'DUST LINE',
  onlineIssn: '2761-0659',
  issnLabel: 'ISSN 2761-0659 (Online)',
  path: '/offroad-bike-magazine/',
  publisherPath: '/company/',
})

export const issues = Object.freeze([
  Object.freeze({
    slug: 'issue-01',
    issueNumber: 'ISSUE 01',
    title: 'DUST LINE 創刊号',
    subtitle: 'BEYOND THE PAVEMENT',
    releaseDate: '2026-10-01',
    releaseDateLabel: '2026年10月1日',
    // Release is an editorial action; the calendar must not publish a PDF.
    publicationStatus: 'published',
    previewAvailable: false,
    priceLabel: '無料',
    accessLabel: '無料会員登録で閲覧',
    statusLabel: '創刊号・無料公開中',
    description: '創刊号を無料公開中。旅、車両製作、カスタム、整備からショップ・イベント紹介まで、全130ページをお届けします。',
    previewLabel: '試し読み（仮公開）',
    previewDescription: '本誌は2026年10月1日公開予定です。現在は会員向けの試し読み版を掲載しています。',
    coverImage: 'cover-issue-01-r1200gs.webp',
    readerPath: '/issues/issue-01/',
    contents: Object.freeze([
      'ガードファクトリー製 BMW R1200GS',
      'KTM 990 ADVENTURE S／TRIUMPH TIGER 800 XCX',
      '新型 BMW F 450 GS',
      'KTM 1190 ADVENTUREで北海道・離島へ',
      'KLR650 世界一周仕様の車両製作',
      'アドベンチャーラリーの軌跡と2027年開催予定',
      'BONSAI MOTO／モトラッド静岡',
      '粉体塗装／サイドスタンド加工',
      'ジェベル250XC用ガードの開発',
    ]),
  }),
])

export const firstIssue = issues[0]

export function getIssue(slug, catalog = issues) {
  return catalog.find((issue) => issue.slug === slug) ?? null
}

export function getIssueSlug(pathname) {
  const match = /^\/issues\/([a-z0-9]+(?:-[a-z0-9]+)*)\/$/.exec(pathname)
  return match?.[1] ?? null
}

export function canReadIssue(issue) {
  return Boolean(issue && (issue.publicationStatus === 'published' || (issue.publicationStatus === 'planned' && issue.previewAvailable)))
}

export function getIssueDateLabel(issue) {
  return issue.publicationStatus === 'published' ? '発行日' : '公開予定'
}

export function getIssueReadLabel(issue) {
  return issue.publicationStatus === 'published' ? '本誌を読む' : '試し読みを読む'
}

export function getIssueEditionLabel(issue) {
  return issue.publicationStatus === 'published' ? '本誌' : issue.previewLabel
}

export function getIssueDescription(issue) {
  return issue.publicationStatus === 'published' ? issue.description : (issue.previewDescription ?? issue.description)
}

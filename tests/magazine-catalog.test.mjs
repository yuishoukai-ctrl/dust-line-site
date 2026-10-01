import test from 'node:test'
import assert from 'node:assert/strict'
import { issues, firstIssue, getIssue, getIssueSlug, canReadIssue, getIssueReadLabel } from '../src/member-content.js'

test('existing issue URL remains stable when another issue is added', () => {
  const second = { ...firstIssue, slug: 'issue-02', readerPath: '/issues/issue-02/', publicationStatus: 'published' }
  const catalog = [...issues, second]
  for (const issue of catalog) assert.equal(getIssue(getIssueSlug(issue.readerPath), catalog), issue)
  assert.equal(getIssue('issue-01', catalog), firstIssue)
  assert.equal(getIssue('does-not-exist', catalog), null)
  for (const path of ['/issues/', '/issues/issue-01/extra/', '/issues/%69ssue-01/']) assert.equal(getIssueSlug(path), null)
})
test('a scheduled date alone never exposes a full issue', () => {
  const planned = { ...firstIssue, publicationStatus: 'planned', releaseDate: '2000-01-01', previewAvailable: false }
  assert.equal(canReadIssue(planned), false)
  assert.equal(canReadIssue({ ...planned, publicationStatus: 'published' }), true)
  assert.equal(canReadIssue({ ...planned, previewAvailable: true }), true)
  assert.equal(canReadIssue({ ...planned, publicationStatus: 'withdrawn', previewAvailable: true }), false)
  assert.equal(canReadIssue(null), false)
  assert.equal(getIssueReadLabel(planned), '試し読みを読む')
  assert.equal(getIssueReadLabel(firstIssue), '本誌を読む')
})


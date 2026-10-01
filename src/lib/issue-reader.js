import { canReadIssue } from '../member-content.js'

export const PDF_URL_TTL_SECONDS = 600

export class IssueReaderError extends Error {
  constructor(code) {
    super(code)
    this.name = 'IssueReaderError'
    this.code = code
  }
}

function validPdfPath(path, slug) {
  return typeof path === 'string'
    && path.startsWith(`${slug}/`)
    && /\.pdf$/i.test(path)
    && !/[\\\x00-\x1f?#%]/.test(path)
    && path.split('/').every((segment) => segment && segment !== '.' && segment !== '..')
}

export async function loadIssuePdf(client, issue) {
  if (!canReadIssue(issue)) throw new IssueReaderError('NOT_READY')
  if (!client) throw new IssueReaderError('UNAVAILABLE')

  // Verify the user with Auth before requesting an issue. Storage RLS remains
  // the final authority; this check never grants a purchase or entitlement.
  const { data: auth, error: authError } = await client.auth.getUser()
  if (authError || !auth?.user) throw new IssueReaderError('AUTH_REQUIRED')
  if (!auth.user.email_confirmed_at) throw new IssueReaderError('EMAIL_UNCONFIRMED')

  const { data: record, error: issueError } = await client
    .from('issues')
    .select('id, storage_path, status')
    .eq('id', issue.slug)
    .maybeSingle()

  if (issueError) throw new IssueReaderError('UNAVAILABLE')
  if (!record) throw new IssueReaderError('NO_ACCESS')
  if (record.status !== 'published') throw new IssueReaderError('NOT_READY')
  if (record.id !== issue.slug || !validPdfPath(record.storage_path, issue.slug)) {
    throw new IssueReaderError('UNAVAILABLE')
  }

  const { data, error } = await client.storage
    .from('magazines')
    .createSignedUrl(record.storage_path, PDF_URL_TTL_SECONDS)
  if (error || !data?.signedUrl) throw new IssueReaderError('NO_ACCESS')
  const url = new URL(data.signedUrl)
  if (!['https:', 'http:'].includes(url.protocol)) throw new IssueReaderError('UNAVAILABLE')
  return url.href
}

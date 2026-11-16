import { englishTranslationUrl } from './lib/english-translation.js'
import './english-link.css'

export default function EnglishLink({ className = '', onClick }) {
  const href = englishTranslationUrl(typeof window === 'undefined' ? {} : window.location)
  if (!href) return null
  return (
    <a className={`english-link notranslate ${className}`.trim()} href={href}
      target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"
      lang="en" translate="no" onClick={onClick}
      aria-label="Read this page in English with Google Translate (opens in a new tab)"
      title="English · Google Translate (new tab)">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c5 5 5 13 0 18M12 3c-5 5-5 13 0 18" /></svg>
      <span>English</span><span className="english-link__external" aria-hidden="true">↗</span>
    </a>
  )
}

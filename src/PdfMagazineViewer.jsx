import { useEffect, useRef, useState } from 'react'
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'
import { requestedPage, safePdfLink } from './lib/pdf-viewer.js'
import { attachPdfPinch } from './lib/pdf-gestures.js'
import { renderBufferedPage } from './lib/pdf-canvas-buffer.js'

const pdfAssetRoot = '/pdfjs/6.3.289/'

// The PDF stays between this browser and the original private Storage URL.
// No external viewer/proxy receives the signed URL or the magazine.
export default function PdfMagazineViewer({ url, title }) {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const surfaceRef = useRef(null)
  const pageRef = useRef(null)
  const pinchRef = useRef(null)
  const pendingFocusRef = useRef(null)
  const gestureStateRef = useRef({ zoom: 1, ready: false })
  const renderCycleRef = useRef(null)
  const [pdf, setPdf] = useState(null)
  const [count, setCount] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [displayedPageNumber, setDisplayedPageNumber] = useState(0)
  const [pageInput, setPageInput] = useState('1')
  const [zoom, setZoom] = useState(1)
  const [width, setWidth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [pageError, setPageError] = useState('')
  const [links, setLinks] = useState([])
  const [attempt, setAttempt] = useState(0)
  gestureStateRef.current = { zoom, ready: Boolean(pdf && displayedPageNumber && !loading && !rendering && !error && !pageError) }

  useEffect(() => {
    const pinch = attachPdfPinch({
      host: hostRef.current, surface: surfaceRef.current, page: pageRef.current,
      ready: () => gestureStateRef.current.ready,
      getZoom: () => gestureStateRef.current.zoom,
      commit: (value, anchor) => {
        pendingFocusRef.current = anchor
        setWidth(Math.max(1, hostRef.current.clientWidth - 24))
        setZoom(value)
      },
    })
    pinchRef.current = pinch
    return () => { pinch.destroy(); pinchRef.current = null }
  }, [])

  useEffect(() => {
    let active = true
    let task
    let timeout
    pinchRef.current?.cancel()
    pendingFocusRef.current = null
    setLoading(true)
    setPdf(null)
    setDisplayedPageNumber(0)
    setCount(0)
    setProgress(0)
    setError('')
    // A stalled request must not leave a permanently blank reading area.
    const watchForStall = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (!active) return
        active = false
        task?.destroy().catch(() => {})
        setLoading(false)
        setError('誌面の読み込みに時間がかかっています。通信を確認し、「誌面を再読み込み」を押してください。')
      }, 90_000)
    }
    watchForStall()
    async function load() {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
        if (!active) return
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
        task = pdfjs.getDocument({
          url,
          // Once loaded, later page turns never request an expired signed URL.
          // Keep only one rendered page in memory, not 130 canvases.
          disableRange: true,
          isEvalSupported: false,
          cMapUrl: new URL(`${pdfAssetRoot}cmaps/`, window.location.origin).href,
          cMapPacked: true,
          standardFontDataUrl: new URL(`${pdfAssetRoot}standard_fonts/`, window.location.origin).href,
          wasmUrl: new URL(`${pdfAssetRoot}wasm/`, window.location.origin).href,
        })
        task.onProgress = ({ loaded, total }) => {
          if (!active) return
          watchForStall()
          if (total > 0) setProgress(Math.min(100, Math.round(100 * loaded / total)))
        }
        const document = await task.promise
        if (!active) return
        setPdf(document)
        setCount(document.numPages)
        setPageNumber((page) => Math.min(page, document.numPages))
        setLoading(false)
        clearTimeout(timeout)
      } catch {
        if (!active) return
        clearTimeout(timeout)
        setLoading(false)
        setError('このブラウザーで誌面を読み込めませんでした。「誌面を再読み込み」をお試しください。XやLINEから開いた場合は、メニューからSafariまたはChromeで開く方法もあります。')
      }
    }
    load()
    return () => {
      active = false
      clearTimeout(timeout)
      task?.destroy().catch(() => {})
    }
  }, [url])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const measure = () => {
      // A scrollbar appearing during the live preview must not cancel a pinch.
      if (!pinchRef.current?.isActive()) setWidth(Math.max(1, host.clientWidth - 24))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    pinchRef.current?.cancel()
    pendingFocusRef.current = null
    hostRef.current.scrollLeft = 0
    hostRef.current.scrollTop = 0
    setPageInput(String(pageNumber))
  }, [pageNumber])

  useEffect(() => {
    if (!pdf || !width) return undefined
    let active = true
    let page
    let task
    setRendering(true)
    setPageError('')
    setLinks([])
    async function render() {
      try {
        page = await pdf.getPage(pageNumber)
        if (!active) { page.cleanup(); return }
        // Resize/zoom/page changes can arrive before a cancelled render settles.
        // Keep at most one temporary render buffer alive at a time.
        await renderCycleRef.current?.catch(() => {})
        if (!active) { page.cleanup(); return }
        const original = page.getViewport({ scale: 1 })
        const viewport = page.getViewport({ scale: width / original.width * zoom })
        const bufferedRender = renderBufferedPage({
          page, viewport, visibleCanvas: canvasRef.current,
          deviceRatio: window.devicePixelRatio,
          isActive: () => active,
          onTask: (current) => { task = current },
          beforeCommit: () => pinchRef.current?.cancel(),
        })
        renderCycleRef.current = bufferedRender
        const annotations = await bufferedRender
        if (!active || annotations === null) return
        setLinks(annotations.filter((item) => item.subtype === 'Link' && (safePdfLink(item.url) || item.dest))
          .map((item) => {
            const [x1, y1] = viewport.convertToViewportPoint(item.rect[0], item.rect[1])
            const [x2, y2] = viewport.convertToViewportPoint(item.rect[2], item.rect[3])
            return {
              id: item.id, href: safePdfLink(item.url), dest: item.dest,
              style: {
                left: `${Math.min(x1, x2) / viewport.width * 100}%`,
                top: `${Math.min(y1, y2) / viewport.height * 100}%`,
                width: `${Math.abs(x2 - x1) / viewport.width * 100}%`,
                height: `${Math.abs(y2 - y1) / viewport.height * 100}%`,
              },
            }
          }))
        if (pendingFocusRef.current) {
          pinchRef.current?.focus(pendingFocusRef.current, viewport.width, viewport.height)
          pendingFocusRef.current = null
        }
        setDisplayedPageNumber(pageNumber)
        setRendering(false)
      } catch (failure) {
        if (!active || failure?.name === 'RenderingCancelledException') return
        if (import.meta.env.DEV) console.warn('PDF page rendering failed:', failure?.name, String(failure?.message).replace(/https?:\/\/\S+/g, '[URL]'))
        pinchRef.current?.cancel()
        pendingFocusRef.current = null
        setRendering(false)
        setPageError('このページを表示できませんでした。もう一度表示するか、PDFを直接開いてください。')
      }
    }
    render()
    return () => {
      active = false
      task?.cancel()
      // Wait for rendering to stop before releasing the page's image/font data.
      if (task) task.promise.catch(() => {}).finally(() => page?.cleanup())
      else page?.cleanup()
    }
  }, [pdf, pageNumber, width, zoom, attempt])

  const changeZoom = (event) => {
    pendingFocusRef.current = null
    pinchRef.current?.cancel()
    hostRef.current.scrollLeft = 0
    hostRef.current.scrollTop = 0
    setZoom(Number(event.target.value))
  }
  const zoomPresets = [1, 1.5, 2, 3]

  const goToPage = (event) => {
    event.preventDefault()
    const target = requestedPage(pageInput, count)
    if (target === null) { setPageInput(String(pageNumber)); return }
    setPageNumber(target)
  }
  const followDestination = async (destination) => {
    try {
      const dest = typeof destination === 'string' ? await pdf.getDestination(destination) : destination
      if (!dest?.length) return
      const index = Number.isInteger(dest[0]) ? dest[0] : await pdf.getPageIndex(dest[0])
      if (index >= 0 && index < count) setPageNumber(index + 1)
    } catch { setPageError('リンク先のページを開けませんでした。ページ番号から移動してください。') }
  }
  const pageControls = (position) => (
    <div className="pdf-reader__toolbar" aria-label={`${position}ページ操作`}>
      <button type="button" disabled={!pdf || pageNumber <= 1 || loading} onClick={() => setPageNumber((value) => value - 1)}>前のページ</button>
      <span aria-live="polite">{pageNumber} / {count || '—'}</span>
      <button type="button" disabled={!pdf || pageNumber >= count || loading} onClick={() => setPageNumber((value) => value + 1)}>次のページ</button>
    </div>
  )
  return (
    <div className="pdf-reader">
      {pageControls('上部')}
      <div className="pdf-reader__settings">
        <form onSubmit={goToPage}>
          <label>ページ <input aria-label="移動先のページ" inputMode="numeric" type="number" min="1" max={count || 1} value={pageInput} onChange={(event) => setPageInput(event.target.value)} disabled={!pdf} /></label>
          <button type="submit" disabled={!pdf}>移動</button>
        </form>
        <label>表示倍率 <select value={zoom} onChange={changeZoom} disabled={!pdf}>
          <option value="1">幅に合わせる</option>
          <option value="1.5">150%</option>
          <option value="2">200%</option>
          <option value="3">300%</option>
          {!zoomPresets.includes(zoom) && <option value={zoom}>{Math.round(zoom * 100)}%</option>}
        </select></label>
      </div>
      <p className="pdf-reader__gesture-help">2本指で拡大・縮小できます。拡大した誌面は指で動かせます。「幅に合わせる」で元に戻ります。</p>
      <div ref={hostRef} className="pdf-reader__viewport" aria-busy={loading || rendering}>
        {loading && <p className="pdf-reader__status" role="status">誌面を読み込んでいます{progress ? `… ${progress}%` : '…'}<small>初回はデータの読み込みに時間がかかる場合があります。</small></p>}
        {error && <p className="pdf-reader__status member-message--error" role="alert">{error}</p>}
        {rendering && !loading && (!displayedPageNumber || displayedPageNumber !== pageNumber) && <p className="pdf-reader__render-status" role="status">{pageNumber}ページを表示しています…</p>}
        <div ref={surfaceRef} className="pdf-reader__surface">
        <div ref={pageRef} className="pdf-reader__page" hidden={loading || !displayedPageNumber || Boolean(error) || Boolean(pageError)}>
          <canvas ref={canvasRef} role="img" aria-label={`${title} ${displayedPageNumber || pageNumber}ページ`} />
          <div className="pdf-reader__links">
            {links.map((link) => link.href
              ? <a key={link.id} style={link.style} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`誌面内のリンク：${link.href}`} />
              : <button type="button" key={link.id} style={link.style} aria-label="誌面内の参照ページへ" onClick={() => followDestination(link.dest)} />)}
          </div>
        </div>
        </div>
        {pageError && <div className="pdf-reader__status" role="alert"><p>{pageError}</p><button type="button" onClick={() => setAttempt((value) => value + 1)}>このページをもう一度表示</button></div>}
      </div>
      {pageControls('下部')}
    </div>
  )
}

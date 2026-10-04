import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import SmartImage from './SmartImage'

function Frame({ src, alt, onClick, priority, width = 900 }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white" onClick={onClick}>
      <SmartImage
        src={src}
        alt={alt}
        width={width}
        priority={priority}
        imgClassName="h-full w-full object-cover"
        fallback={(
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 to-slate-200 px-6 text-center text-base font-semibold text-slate-500">
            {alt}
          </div>
        )}
      />
    </div>
  )
}

export default function Gallery({ images, alt, badge }) {
  const { t, isRTL } = useStore()
  const Prev = isRTL ? ChevronRight : ChevronLeft
  const Next = isRTL ? ChevronLeft : ChevronRight
  const list = (images || []).filter(Boolean)
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [scale, setScale] = useState(1)
  const start = useRef(null)

  const n = list.length
  const go = (d) => setI((v) => (n ? (v + d + n) % n : 0))

  useEffect(() => { if (i >= n) setI(0) }, [n, i])
  useEffect(() => {
    if (!zoom) return
    const onKey = (e) => {
      if (e.key === 'Escape') setZoom(false)
      if (e.key === 'ArrowRight') go(isRTL ? -1 : 1)
      if (e.key === 'ArrowLeft') go(isRTL ? 1 : -1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoom, n])

  const onTouchStart = (e) => { start.current = e.touches[0]?.clientX ?? null }
  const onTouchEnd = (e) => {
    if (start.current == null) return
    const dx = (e.changedTouches[0]?.clientX ?? 0) - start.current
    start.current = null
    const dir = isRTL ? -1 : 1
    if (Math.abs(dx) > 45 && n > 1) go((dx < 0 ? 1 : -1) * dir)
  }

  if (n === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-100 to-slate-200 ring-1 ring-white/10">
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-base font-semibold text-slate-500">{alt}</div>
      </div>
    )
  }

  return (
    <div>
      <div
        className="rise relative aspect-square w-full select-none overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_-20px_rgba(2,10,30,.7)] ring-1 ring-white/10"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Frame src={list[i]} alt={alt} priority onClick={() => { setScale(1); setZoom(true) }} />

        {badge && (
          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-900/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-sky-300 backdrop-blur">
            {badge}
          </span>
        )}

        <button
          onClick={() => { setScale(1); setZoom(true) }}
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-2xl bg-slate-900/70 text-white backdrop-blur transition hover:bg-slate-900"
          aria-label={t('enlarge')}
        >
          <ZoomIn size={18} />
        </button>

        {n > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white"
              aria-label={t('prevImage')}
            >
              <Prev size={20} />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-slate-900 shadow-lg transition hover:bg-white"
              aria-label={t('nextImage')}
            >
              <Next size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-slate-900/60 px-2.5 py-1.5 backdrop-blur">
              {list.map((_, k) => (
                <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-5 bg-sky-400' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((src, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white ring-2 transition ${k === i ? 'ring-sky-400' : 'ring-white/10 hover:ring-white/40'}`}
            >
              <Frame src={src} alt={`${alt} ${k + 1}`} width={160} />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div className="fixed inset-0 z-40 flex flex-col bg-slate-950/95 pt-[env(safe-area-inset-top)] backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">
              {i + 1} / {n}
            </span>
            <button onClick={() => setZoom(false)} className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white" aria-label={t('close')}>
              <X size={18} />
            </button>
          </div>

          <div
            className="flex-1 min-h-0 overflow-auto"
            onTouchStart={onTouchStart}
            onTouchEnd={(e) => { if (scale === 1) onTouchEnd(e) }}
          >
            <div className="flex min-h-full min-w-full items-center justify-center p-2">
              <img
                src={list[i]}
                alt={alt}
                decoding="async"
                onClick={() => setScale((s) => (s === 1 ? 2.2 : 1))}
                style={{ transform: `scale(${scale})` }}
                className="max-h-[70vh] max-w-full origin-center cursor-zoom-in rounded-2xl object-contain transition-transform duration-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-2">
            {n > 1 && (
              <button onClick={() => { setScale(1); go(-1) }} aria-label={t('prevImage')} className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white">
                <Prev size={20} />
              </button>
            )}
            <button
              onClick={() => setScale((s) => (s === 1 ? 2.2 : 1))}
              className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white"
            >
              {scale === 1 ? t('zoomIn') : t('zoomOut')}
            </button>
            {n > 1 && (
              <button onClick={() => { setScale(1); go(1) }} aria-label={t('nextImage')} className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white">
                <Next size={20} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

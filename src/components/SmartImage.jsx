import { useEffect, useState } from 'react'

/**
 * Optimised product image:
 *  - requests a WebP, resized, compressed variant when the host supports it
 *  - lazy-loads off-screen images (native browser lazy loading)
 *  - shows a shimmer skeleton while loading, and a styled fallback on error
 *  - silently falls back to the original URL if the optimised variant fails
 */

function withParams(url, params) {
  try {
    const u = new URL(url)
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, String(v)))
    return u.toString()
  } catch {
    return url
  }
}

// Returns an optimised URL, or null when the host offers no transformation.
export function optimizedUrl(src, width, quality = 72) {
  if (!src || typeof src !== 'string') return null
  if (src.startsWith('data:') || src.startsWith('blob:')) return null

  // Unsplash: native on-the-fly resize + WebP
  if (/images\.unsplash\.com/i.test(src)) {
    return withParams(src, { w: width, q: quality, fm: 'webp', auto: 'format' })
  }

  // Platform storage: image rendering endpoint (negotiates WebP automatically)
  if (src.includes('/storage/v1/object/public/')) {
    const rendered = src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
    return withParams(rendered, { width, quality, resize: 'contain' })
  }

  return null
}

export default function SmartImage({
  src,
  alt = '',
  width = 640,
  priority = false,
  imgClassName = '',
  fallback = null,
  skeletonClassName = '',
}) {
  // 0 = optimised variant, 1 = original URL, 2 = give up
  const [step, setStep] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setStep(0)
    setLoaded(false)
  }, [src])

  if (!src) return fallback

  const opt = optimizedUrl(src, width)
  const candidates = opt ? [opt, src] : [src]
  const current = candidates[step]
  const failed = step >= candidates.length

  const srcSet =
    !failed && opt && step === 0
      ? `${optimizedUrl(src, width)} 1x, ${optimizedUrl(src, Math.round(width * 2))} 2x`
      : undefined

  return (
    <>
      {!failed && (
        <img
          key={`${src}-${step}`}
          src={current}
          srcSet={srcSet}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : 'low'}
          onLoad={() => setLoaded(true)}
          onError={() => setStep((s) => s + 1)}
          className={`${imgClassName} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {!failed && !loaded && (
        <div className={`absolute inset-0 img-skeleton ${skeletonClassName}`} aria-hidden="true" />
      )}
      {failed && fallback}
    </>
  )
}

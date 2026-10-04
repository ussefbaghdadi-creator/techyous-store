import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ShoppingCart, ShieldCheck, Truck, MessageCircle } from 'lucide-react'
import { db } from '../lib/db'
import { useStore, money } from '../hooks/useStore'
import Gallery from '../components/Gallery'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, nameOf, descOf, catLabel, addToCart, setCartOpen, isRTL } = useStore()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    db.getShared('products', id)
      .then((r) => { if (alive) { setProduct(r || null); setLoading(false) } })
      .catch(() => { if (alive) { setProduct(null); setLoading(false) } })
    return () => { alive = false }
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pb-40 md:px-8">
        <div className="h-72 animate-pulse rounded-3xl bg-white/10" />
        <div className="mt-4 h-8 w-2/3 animate-pulse rounded-full bg-white/10" />
        <div className="mt-3 h-24 animate-pulse rounded-3xl bg-white/10" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-24 text-center md:px-8">
        <p className="display text-lg font-bold text-white">{t('productNotFound')}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-white"
        >
          {t('back')}
        </button>
      </div>
    )
  }

  const gallery = (Array.isArray(product.images) && product.images.length
    ? product.images
    : [product.image, product.image2, product.image3]
  ).filter((u) => typeof u === 'string' && u.trim())

  const out = Number(product.stock || 0) <= 0
  const low = !out && Number(product.stock) <= 5

  const onAdd = () => {
    if (out) return
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  const buyNow = () => {
    if (out) return
    addToCart(product)
    setCartOpen(true)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-44 md:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
      >
        {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t('back')}
      </button>

      <div className="grid gap-5 md:grid-cols-2 md:gap-8 lg:gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Gallery images={gallery} alt={nameOf(product)} badge={catLabel(product.cat)} />
        </div>

        <div className="rise" style={{ animationDelay: '90ms' }}>
          <h1 className="display text-2xl font-bold leading-tight text-white md:text-3xl">{nameOf(product)}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {out ? (
              <span className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold text-white">{t('out')}</span>
            ) : low ? (
              <span className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900">{t('low')}</span>
            ) : (
              <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white">{t('inStock')}</span>
            )}
            {product.sku && (
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-300">{t('ref')} {product.sku}</span>
            )}
          </div>

          <div className="display mt-4 text-3xl font-bold text-sky-400 md:text-4xl">{money(product.price)}</div>

          <div className="mt-5 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
            <h2 className="text-xs font-semibold uppercase tracking-[.18em] text-slate-400">{t('description')}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-200">
              {descOf(product)
                ? descOf(product)
                : `${nameOf(product)} — ${catLabel(product.cat)}. ${t('descFallback')}`}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-3 text-xs font-medium text-slate-300 ring-1 ring-white/10">
              <ShieldCheck size={16} className="text-sky-400" /> {t('warranty')}
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-3 text-xs font-medium text-slate-300 ring-1 ring-white/10">
              <Truck size={16} className="text-sky-400" /> {t('fastDelivery')}
            </div>
          </div>

          {product.credit && <p className="mt-3 text-[11px] text-slate-500">{t('photoBy')} {product.credit}</p>}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button
              onClick={onAdd}
              disabled={out}
              className={`flex min-h-[52px] items-center justify-center gap-2 rounded-2xl text-sm font-bold transition active:scale-[.98] ${
                out ? 'cursor-not-allowed bg-white/10 text-slate-500' : added ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              {added ? <Check size={18} /> : <ShoppingCart size={18} />}
              {added ? t('addedToCart') : t('add')}
            </button>
            <button
              onClick={buyNow}
              disabled={out}
              className={`flex min-h-[52px] items-center justify-center gap-2 rounded-2xl text-sm font-bold transition active:scale-[.98] ${
                out ? 'cursor-not-allowed bg-white/10 text-slate-500' : 'bg-sky-500 text-white hover:bg-sky-400'
              }`}
            >
              <MessageCircle size={18} /> {t('buyNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Check } from 'lucide-react'
import { useStore, money } from '../hooks/useStore'
import SmartImage from './SmartImage'

export default function ProductCard({ product, index = 0 }) {
  const { t, nameOf, addToCart, catLabel } = useStore()
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)
  const out = Number(product.stock || 0) <= 0
  const low = !out && Number(product.stock) <= 5

  const open = () => navigate(`/p/${encodeURIComponent(product.id || product.sku)}`)

  const onAdd = (e) => {
    e.stopPropagation()
    if (out) return
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const promo = String(product.discount_text || '').trim()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } }}
      className="rise group flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-white text-left shadow-[0_10px_30px_-12px_rgba(2,10,30,.5)] ring-1 ring-white/10 transition hover:-translate-y-1 hover:shadow-[0_20px_45px_-14px_rgba(56,189,248,.45)] active:scale-[.99]"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <SmartImage
          src={product.image}
          alt={nameOf(product)}
          width={480}
          priority={index < 2}
          imgClassName="h-full w-full object-cover duration-500 group-hover:scale-105"
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-100 to-slate-200 px-3 text-center text-sm font-semibold text-slate-500">
              {nameOf(product)}
            </div>
          )}
        />
        {promo && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-slate-900 shadow-lg shadow-amber-500/30">
            {promo}
          </span>
        )}
        <span className={`absolute left-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-300 backdrop-blur ${promo ? 'bottom-3' : 'top-3'}`}>
          {catLabel(product.cat)}
        </span>
        {out ? (
          <span className="absolute right-3 top-3 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white">{t('out')}</span>
        ) : low ? (
          <span className="absolute right-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-slate-900">{t('low')}</span>
        ) : (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">{t('inStock')}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="display text-[15px] font-semibold leading-snug text-slate-900 md:text-base">{nameOf(product)}</h3>
        {product.credit && (
          <p className="mt-1 text-[10px] text-slate-400">{t('photoBy')} {product.credit}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="display text-lg font-bold text-slate-900 md:text-xl">{money(product.price)}</div>
          <button
            onClick={onAdd}
            disabled={out}
            className={`flex min-h-[44px] items-center gap-1.5 rounded-2xl px-3.5 text-sm font-semibold transition active:scale-95 ${
              out
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : added
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-900 text-white hover:bg-sky-500'
            }`}
          >
            {added ? <Check size={16} /> : <ShoppingCart size={16} />}
            <span className="hidden sm:inline">{added ? t('added') : t('add')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

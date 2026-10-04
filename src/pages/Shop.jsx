import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLiveShared } from '../lib/useLive'
import { useStore, CATS } from '../hooks/useStore'
import ProductCard from '../components/ProductCard'
import InstallBanner from '../components/InstallBanner'

export default function Shop() {
  const { t, query, catLabel } = useStore()
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('default')
  const { data: products, loading } = useLiveShared('products', { limit: 200, order: '-createdAt' })

  const newestKey = (p) => String(p.createdAt || p.created_at || p.updatedAt || '')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (products || [])
      .filter((p) => (cat === 'all' ? true : p.cat === cat))
      .filter((p) => (!q ? true : `${p.nameFr || ''} ${p.nameAr || ''} ${p.nameEn || ''} ${p.sku || ''}`.toLowerCase().includes(q)))
      .sort((a, b) => {
        const stockDiff = Number(b.stock > 0) - Number(a.stock > 0)
        if (stockDiff) return stockDiff
        if (sort === 'asc') return Number(a.price || 0) - Number(b.price || 0)
        if (sort === 'desc') return Number(b.price || 0) - Number(a.price || 0)
        return newestKey(b).localeCompare(newestKey(a))
      })
  }, [products, cat, query, sort])

  return (
    <div className="pb-2">
      <InstallBanner />

      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 md:px-8">
        <div className="flex flex-col gap-2 pb-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                cat === c.key
                  ? 'bg-white text-slate-900 shadow-lg shadow-sky-500/20'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {catLabel(c.key)}
            </button>
          ))}
        </div>

          <div className="relative shrink-0 self-start md:self-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label={t('sortLabel')}
              className="appearance-none rounded-full bg-white/10 py-2.5 ps-4 pe-9 text-sm font-semibold text-slate-100 outline-none transition hover:bg-white/20 focus:bg-white/20"
            >
              <option className="text-slate-900" value="default">{t('sortDefault')}</option>
              <option className="text-slate-900" value="asc">{t('sortAsc')}</option>
              <option className="text-slate-900" value="desc">{t('sortDesc')}</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-300" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/10" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="display text-lg font-bold text-white">{t('noResults')}</p>
            <p className="mt-1 text-sm text-slate-400">{t('noResultsHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {list.map((p, i) => (
              <ProductCard key={p.id || p.sku} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

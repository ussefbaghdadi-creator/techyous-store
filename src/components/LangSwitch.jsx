import { Languages } from 'lucide-react'
import { useStore } from '../hooks/useStore'

const OPTIONS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'ar', label: 'ع' },
]

export default function LangSwitch({ compact = false, className = '' }) {
  const { lang, setLang, t, isRTL } = useStore()
  const index = Math.max(0, OPTIONS.findIndex((o) => o.code === lang))
  const shift = `${(isRTL ? -100 : 100) * index}%`

  const btn = (code) =>
    `relative z-10 min-w-[36px] rounded-xl px-2 py-1.5 text-[12px] font-bold transition ${
      lang === code ? 'text-slate-900' : 'text-slate-300 hover:text-white'
    }`

  return (
    <div
      role="group"
      aria-label={t('lang')}
      title={t('lang')}
      className={`h-11 items-center gap-1 rounded-2xl bg-white/10 p-1 ring-1 ring-white/10 ${compact ? '' : 'ps-2'} ${className || 'flex'}`}
    >
      {!compact && <Languages size={15} className="shrink-0 text-slate-400" />}
      <div className="relative flex items-center">
        <span
          aria-hidden="true"
          style={{ transform: `translateX(${shift})` }}
          className="absolute inset-y-0 start-0 w-1/3 rounded-xl bg-white shadow transition-transform duration-300"
        />
        {OPTIONS.map((o) => (
          <button
            key={o.code}
            type="button"
            onClick={() => setLang(o.code)}
            aria-pressed={lang === o.code}
            className={`${btn(o.code)} ${o.code === 'ar' ? 'font-ar text-[14px]' : ''}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

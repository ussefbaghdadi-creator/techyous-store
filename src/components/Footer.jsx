import { Instagram, Youtube } from 'lucide-react'
import { useStore } from '../hooks/useStore'

function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.3 2.2 1.6 3.6 3.8 3.8v2.6c-1.3.1-2.6-.2-3.8-.9v5.9c0 3.7-2.7 6.1-6 6.1-3.1 0-5.6-2.4-5.6-5.6 0-3.3 2.8-5.9 6.3-5.4v2.8c-.4-.1-.8-.2-1.2-.2-1.6 0-2.8 1.2-2.8 2.8 0 1.6 1.2 2.8 2.8 2.8 1.6 0 2.9-1.2 2.9-3V3h3.6z" />
    </svg>
  )
}

const LINKS = [
  { label: 'Instagram Boutique', href: 'https://www.instagram.com/techyous', icon: Instagram, cls: 'hover:bg-pink-500/20 hover:text-pink-300' },
  { label: 'Instagram Personnel', href: 'https://www.instagram.com/ussefbaghdadi', icon: Instagram, cls: 'hover:bg-fuchsia-500/20 hover:text-fuchsia-300' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@ussefbaghdadi', icon: TikTokIcon, cls: 'hover:bg-white/20 hover:text-white' },
  { label: 'YouTube', href: 'https://youtube.com/@ussefbaghdadi', icon: Youtube, cls: 'hover:bg-red-500/20 hover:text-red-300' },
]

export default function Footer() {
  const { t } = useStore()
  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-950/40">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 pt-8 pb-[calc(9rem+env(safe-area-inset-bottom,0px))] md:px-8 md:pt-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <p className="display text-xl font-bold tracking-tight text-white">
              TECH<span className="text-sky-400">YOUS</span>
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[.18em] text-slate-500">{t('followUs')}</p>
          </div>

          <div className="flex items-center gap-3">
            {LINKS.map((l) => {
              const Icon = l.icon
              return (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={l.label}
                  aria-label={l.label}
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-slate-200 transition active:scale-95 ${l.cls}`}
                >
                  <Icon size={20} />
                </a>
              )
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500 md:text-right">
          © {new Date().getFullYear()} TechYous — {t('rights')}
        </p>
      </div>
    </footer>
  )
}

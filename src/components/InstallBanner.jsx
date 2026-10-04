import { useEffect, useRef, useState } from 'react'
import { Download, X, Share, MoreVertical, Info } from 'lucide-react'
import { push } from '../lib/push'
import { useStore } from '../hooks/useStore'

const KEY = 'techyous_install_dismissed'

function platformHint(lang) {
  const ua = navigator.userAgent || ''
  if (lang === 'ar') {
    if (/SamsungBrowser/i.test(ua)) return 'قائمة المتصفح (☰) ← « إضافة الصفحة إلى » ← « الشاشة الرئيسية ».'
    if (/Firefox|FxiOS/i.test(ua)) return 'قائمة المتصفح (⋮) ← « تثبيت » أو « إضافة إلى الشاشة الرئيسية ».'
    if (/Android|Mobile/i.test(ua)) return 'قائمة المتصفح (⋮ أعلى اليمين) ← « تثبيت التطبيق » أو « إضافة إلى الشاشة الرئيسية ».'
    return 'اضغط على أيقونة التثبيت (⊕) في شريط العنوان، أو قائمة ⋮ ← « تثبيت TechYous ».'
  }
  if (lang === 'en') {
    if (/SamsungBrowser/i.test(ua)) return 'Browser menu (☰) → “Add page to” → “Home screen”.'
    if (/Firefox|FxiOS/i.test(ua)) return 'Browser menu (⋮) → “Install” or “Add to Home screen”.'
    if (/Android|Mobile/i.test(ua)) return 'Browser menu (⋮ top right) → “Install app” or “Add to Home screen”.'
    return 'Click the install icon (⊕) in the address bar, or menu ⋮ → “Install TechYous”.'
  }
  const isAndroid = /Android/i.test(ua)
  const isSamsung = /SamsungBrowser/i.test(ua)
  const isFirefox = /Firefox|FxiOS/i.test(ua)
  const isMobile = isAndroid || /Mobile/i.test(ua)
  if (isSamsung) return "Menu du navigateur (☰) → « Ajouter la page à » → « Écran d'accueil »."
  if (isFirefox) return "Menu du navigateur (⋮) → « Installer » ou « Ajouter à l'écran d'accueil »."
  if (isAndroid || isMobile) return "Menu du navigateur (⋮ en haut à droite) → « Installer l'application » ou « Ajouter à l'écran d'accueil »."
  return "Cliquez sur l'icône d'installation (⊕) à droite de la barre d'adresse, ou menu ⋮ → « Installer TechYous »."
}

export default function InstallBanner() {
  const { t, lang } = useStore()
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)
  const [ready, setReady] = useState(false)
  const [hint, setHint] = useState('')
  const timers = useRef([])

  useEffect(() => {
    if (localStorage.getItem(KEY)) return
    const d = push.diagnose()
    if (d.installed || d.embedded) return
    setIos(d.ios)
    setReady(push.canInstall())
    const show1 = setTimeout(() => setShow(true), 1200)
    timers.current.push(show1)
    // beforeinstallprompt can fire after mount (Chrome evaluates the manifest +
    // service worker asynchronously), so keep checking for a while.
    const poll = setInterval(() => {
      if (push.canInstall()) {
        setReady(true)
        clearInterval(poll)
      }
    }, 700)
    const stop = setTimeout(() => clearInterval(poll), 20000)
    timers.current.push(stop)
    const onInstalled = () => {
      localStorage.setItem(KEY, '1')
      setShow(false)
    }
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      clearInterval(poll)
      timers.current.forEach(clearTimeout)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!show) return null

  const dismiss = () => {
    localStorage.setItem(KEY, '1')
    setShow(false)
  }

  const install = async () => {
    if (ios) {
      setHint(t('iosInstall'))
      return
    }
    if (!push.canInstall()) {
      setHint(platformHint(lang))
      return
    }
    const r = await push.promptInstall()
    if (r === 'accepted') {
      dismiss()
      return
    }
    if (r === 'unavailable') {
      setReady(false)
      setHint(platformHint(lang))
    }
  }

  return (
    <div className="mx-auto mb-4 w-full max-w-7xl 2xl:max-w-[1600px] px-4 md:px-8">
      <div className="rise rounded-3xl border border-sky-400/30 bg-white/10 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-400/20 text-sky-300">
            {ios ? <Share size={20} /> : <Download size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="display text-sm font-bold text-white">{t('installTitle')}</p>
            <p className="mt-0.5 text-xs text-slate-300">{ios ? t('iosInstall') : t('installBody')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={install}
              className="rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-sky-300 active:scale-95"
            >
              {ios ? t('iosHow') : ready ? t('install') : t('installHow')}
            </button>
            <button
              onClick={dismiss}
              aria-label={t('close')}
              className="grid h-11 w-11 place-items-center rounded-2xl text-slate-300 transition hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {hint && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-900/50 p-3 text-xs leading-relaxed text-slate-200">
            {ios ? <Share size={15} className="mt-0.5 shrink-0 text-sky-300" /> : <MoreVertical size={15} className="mt-0.5 shrink-0 text-sky-300" />}
            <span>{hint}</span>
          </div>
        )}
        {!ios && !ready && !hint && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info size={12} className="shrink-0" />
            {t('installManual')}
          </p>
        )}
      </div>
    </div>
  )
}

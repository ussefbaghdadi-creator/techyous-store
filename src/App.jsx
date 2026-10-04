import { useEffect, useRef, useState } from 'react'
import { HashRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, MessageCircle, ShoppingBag } from 'lucide-react'
import { db } from './lib/db'
import { auth } from './lib/auth'
import { StoreProvider, useStore, money } from './hooks/useStore'
import Shop from './pages/Shop'
import Orders from './pages/Orders'
import Admin from './pages/Admin'
import Product from './pages/Product'
import CartDrawer from './components/CartDrawer'
import LangSwitch from './components/LangSwitch'
import Footer from './components/Footer'

function ScrollReset({ scrollRef }) {
  const { pathname } = useLocation()
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0 }, [pathname])
  return null
}

function Header() {
  const { t, query, setQuery, count, setCartOpen } = useStore()
  const navigate = useNavigate()
  const goHome = (e) => {
    if (e) e.preventDefault()
    setQuery('')
    navigate('/')
    try {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }
  const linkCls = ({ isActive }) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-white text-slate-900' : 'text-slate-200 hover:bg-white/10'}`

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <a
            href="#/"
            onClick={goHome}
            onPointerUp={goHome}
            role="link"
            className="relative z-30 block min-w-0 flex-1 cursor-pointer rounded-2xl py-1 transition hover:opacity-90 active:scale-[.98]"
            aria-label="TechYous — home"
          >
            <h1 className="display pointer-events-none text-2xl font-bold leading-none tracking-tight text-white md:text-3xl">
              TECH<span className="text-sky-400">YOUS</span>
            </h1>
            <p className="pointer-events-none mt-1 truncate text-[11px] uppercase tracking-[.18em] text-slate-400">{t('tagline')}</p>
          </a>

          <div className="hidden flex-[1.2] items-center gap-2 rounded-2xl bg-white px-4 shadow-lg shadow-sky-500/10 md:flex">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkCls}>{t('shop')}</NavLink>
            <NavLink to="/orders" className={linkCls}>{t('orders')}</NavLink>
          </nav>

          <LangSwitch compact className="hidden md:flex" />
          <button
            onClick={() => auth.signIn()}
            title={t('signIn')}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-slate-100 transition hover:bg-white/20"
          >
            <User size={18} />
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative grid h-11 w-11 place-items-center rounded-2xl bg-sky-400 text-slate-900 transition hover:bg-sky-300"
          >
            <ShoppingCart size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-slate-900 px-1 text-[11px] font-bold text-white ring-2 ring-slate-950">
                {count}
              </span>
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 md:hidden">
          <div className="flex min-w-[150px] flex-1 items-center gap-2 rounded-2xl bg-white px-4 shadow-lg shadow-sky-500/10">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkCls}>{t('shop')}</NavLink>
            <NavLink to="/orders" className={linkCls}>{t('orders')}</NavLink>
          </nav>
          <LangSwitch compact />
        </div>
      </div>
    </header>
  )
}

function CheckoutBar() {
  const { t, count, total, setCartOpen, setMethod } = useStore()
  if (count === 0) return null
  const go = (m) => { setMethod(m); setCartOpen(true) }
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-slate-950/90 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 py-3 md:flex md:items-center md:justify-end md:gap-5 md:px-8">
        <div className="mb-2 flex items-center justify-between md:mb-0 md:mr-auto md:gap-3">
          <span className="text-xs uppercase tracking-wide text-slate-400">{count} {t('items')}</span>
          <span className="display text-lg font-bold text-white md:text-xl">{money(total)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:gap-3">
          <button onClick={() => go('whatsapp')} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-400 active:scale-[.98] md:px-7">
            <MessageCircle size={18} /> {t('whatsapp')}
          </button>
          <button onClick={() => go('direct')} className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3.5 text-sm font-bold text-white transition hover:bg-sky-400 active:scale-[.98] md:px-7">
            <ShoppingBag size={18} /> {t('direct')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Shell() {
  const scrollRef = useRef(null)
  const [shopPhone, setShopPhone] = useState('')

  useEffect(() => {
    db.getShared('shopinfo', 'main')
      .then((r) => { if (r?.whatsapp) setShopPhone(String(r.whatsapp)) })
      .catch(() => {})
  }, [])

  return (
    <div className="glow-bg flex h-full flex-col">
      <Header />
      <main ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto pt-4">
        <ScrollReset scrollRef={scrollRef} />
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/orders" element={<Orders shopPhone={shopPhone} onShopPhone={setShopPhone} />} />
          <Route path="/p/:id" element={<Product />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
      </main>
      <CheckoutBar />
      <CartDrawer shopPhone={shopPhone} />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </StoreProvider>
  )
}

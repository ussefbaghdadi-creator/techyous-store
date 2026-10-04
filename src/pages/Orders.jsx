import { useEffect, useState } from 'react'
import { Bell, BellRing, Phone, LogIn, Package, Boxes, ChevronRight, Trash2, X, Check, Ban, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { auth } from '../lib/auth'
import { db } from '../lib/db'
import { push } from '../lib/push'
import { triggers } from '../lib/triggers'
import { useLiveShared } from '../lib/useLive'
import { useStore, money } from '../hooks/useStore'

export default function Orders({ shopPhone, onShopPhone }) {
  const { t, lang } = useStore()
  const [user, setUser] = useState(auth.getCurrentUser())
  const [owner, setOwner] = useState(false)
  const [phone, setPhone] = useState(shopPhone || '')
  const [savedMsg, setSavedMsg] = useState('')
  const [alertState, setAlertState] = useState('idle')
  const [alertMsg, setAlertMsg] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [statusBusy, setStatusBusy] = useState(null)
  const [statusErrs, setStatusErrs] = useState({})
  const [deleting, setDeleting] = useState(false)
  const [deleteErr, setDeleteErr] = useState('')
  const { data: orders, loading } = useLiveShared('orders', { order: '-createdAt', limit: 200 })

  useEffect(() => auth.onAuthChange((u) => { setUser(u); setOwner(auth.isAppOwner()) }), [])
  useEffect(() => { setPhone(shopPhone || '') }, [shopPhone])

  const savePhone = async () => {
    const clean = phone.replace(/[^0-9]/g, '')
    await db.upsertShared('shopinfo', { whatsapp: clean }, 'main')
    onShopPhone?.(clean)
    setPhone(clean)
    setSavedMsg(t('saved'))
    setTimeout(() => setSavedMsg(''), 2000)
  }

  const enableAlerts = async () => {
    setAlertState('working')
    setAlertMsg('')
    try {
      const d = push.diagnose()
      if (!d.canSchedule && d.reason === 'preview') {
        setAlertMsg("Publiez l'application puis ouvrez-la depuis son propre lien pour activer les alertes.")
        setAlertState('idle')
        return
      }
      const perm = await push.requestPermission()
      if (perm !== 'granted') {
        setAlertMsg(d.hint || 'Notifications refusées.')
        setAlertState('idle')
        return
      }
      await push.subscribe()
      const me = auth.getCurrentUser()
      const existing = await triggers.list().catch(() => [])
      for (const tr of existing || []) {
        if (tr.collection === 'orders') await triggers.remove(tr.id).catch(() => {})
      }
      await triggers.create({
        collection: 'orders',
        on: ['insert'],
        action: 'push',
        title: '🛒 Nouvelle commande TechYous',
        body: '{{customerName}} — {{total}} MAD',
        url: '#/orders',
        target: { userId: me?.id },
      })
      setAlertState('on')
      setAlertMsg("Vous recevrez une notification à chaque nouvelle commande (application publiée + installée).")
    } catch (e) {
      setAlertState('idle')
      setAlertMsg(e?.message || 'Impossible d’activer les alertes.')
    }
  }

  const deleteOrder = async (id) => {
    setDeleting(true)
    setDeleteErr('')
    try {
      await db.deleteShared('orders', id)
      setConfirmId(null)
    } catch (e) {
      setDeleteErr(e?.message || t('deleteFail'))
    } finally {
      setDeleting(false)
    }
  }

  const setStatus = async (id, status) => {
    setStatusBusy(id)
    setStatusErrs((s) => ({ ...s, [id]: '' }))
    try {
      await db.updateShared('orders', id, { status })
    } catch (e) {
      setStatusErrs((s) => ({ ...s, [id]: e?.message || t('statusFail') }))
    } finally {
      setStatusBusy(null)
    }
  }

  const statusOf = (o) => (o?.status === 'confirmee' || o?.status === 'annulee' ? o.status : 'nouvelle')

  const statusStyle = (s) =>
    s === 'confirmee'
      ? 'bg-emerald-100 text-emerald-700'
      : s === 'annulee'
        ? 'bg-rose-100 text-rose-700'
        : 'bg-amber-100 text-amber-800'

  const statusText = (s) => (s === 'confirmee' ? t('statusConfirmed') : s === 'annulee' ? t('statusCancelled') : t('statusNew'))

  const confirmOrder = orders?.find((o) => o.id === confirmId)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-40 md:px-8">
      {owner && (
        <section className="rise mb-6 rounded-3xl border border-sky-400/25 bg-white/10 p-5 backdrop-blur">
          <h2 className="display text-lg font-bold text-white">{t('admin')}</h2>

          <Link
            to="/admin"
            className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-bold text-slate-900 transition active:scale-[.99]"
          >
            <Boxes size={18} className="text-sky-600" />
            <span className="flex-1 text-left">{t('manageProducts')}</span>
            <ChevronRight size={17} className="text-slate-400" />
          </Link>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-sky-300">{t('shopNumber')}</label>
          <div className="mt-2 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-2xl bg-white/10 px-3">
              <Phone size={16} className="text-slate-300" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="212600000000"
                className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>
            <button onClick={savePhone} className="rounded-2xl bg-sky-400 px-4 text-sm font-bold text-slate-900">
              {savedMsg || t('save')}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">{t('phoneFormatHint')}</p>

          <button
            onClick={enableAlerts}
            disabled={alertState === 'working'}
            className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
              alertState === 'on' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900'
            }`}
          >
            {alertState === 'on' ? <BellRing size={16} /> : <Bell size={16} />}
            {alertState === 'on' ? t('alertsOn') : t('alerts')}
          </button>
          {alertMsg && <p className="mt-2 text-xs text-slate-300">{alertMsg}</p>}
        </section>
      )}

      <h2 className="display mb-3 text-xl font-bold text-white">{owner ? t('allOrders') : t('myOrders')}</h2>

      {!user && !owner && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-3xl bg-white/10 p-4">
          <p className="text-sm text-slate-200">{t('signInHint')}</p>
          <button onClick={() => auth.signIn()} className="flex items-center gap-2 rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-900">
            <LogIn size={16} /> {t('signIn')}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-3xl bg-white/10" />)}
        </div>
      ) : !orders?.length ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 py-16 text-center">
          <Package size={40} className="mx-auto text-slate-500" />
          <p className="display mt-3 font-bold text-white">{t('noOrders')}</p>
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-3xl bg-white p-4 shadow-lg shadow-slate-950/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="display font-bold text-slate-900">{o.customerName || t('client')}</p>
                  <p className="text-xs text-slate-500">
                    {o.customerPhone} · {o.createdAt ? new Date(o.createdAt).toLocaleString(lang === 'ar' ? 'ar-MA' : lang === 'en' ? 'en-GB' : 'fr-FR') : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${statusStyle(statusOf(o))}`}>
                    {statusText(statusOf(o))}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${o.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                    {o.channel === 'whatsapp' ? 'WhatsApp' : t('direct')}
                  </span>
                  {owner && (
                    <button
                      onClick={() => { setDeleteErr(''); setConfirmId(o.id) }}
                      aria-label={t('deleteOrder')}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100 active:scale-95"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm text-slate-600">
                {(o.items || []).map((it, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="truncate">{it.name} × {it.qty}</span>
                    <span className="shrink-0 font-medium text-slate-800">{money(it.qty * Number(it.price || 0))}</span>
                  </li>
                ))}
              </ul>
              {(o.city || o.address) && (
                <p className="mt-2 text-xs text-slate-500">
                  {[o.city, o.address].filter(Boolean).join(' · ')}
                </p>
              )}
              {!o.city && o.note && <p className="mt-2 text-xs text-slate-500">{o.note}</p>}
              {o.shipping != null && (
                <div className="mt-3 flex justify-between text-xs text-slate-500">
                  <span>{t('shipping')}</span>
                  <span>{money(o.shipping)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-slate-100 pt-3">
                <span className="text-sm font-medium text-slate-500">{t('total')}</span>
                <span className="display text-lg font-bold text-slate-900">{money(o.total)}</span>
              </div>

              {owner && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  {statusOf(o) === 'nouvelle' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setStatus(o.id, 'confirmee')}
                        disabled={statusBusy === o.id}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white transition active:scale-[.98] disabled:opacity-60"
                      >
                        <Check size={16} /> {t('doConfirm')}
                      </button>
                      <button
                        onClick={() => setStatus(o.id, 'annulee')}
                        disabled={statusBusy === o.id}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700 transition active:scale-[.98] disabled:opacity-60"
                      >
                        <Ban size={16} /> {t('doCancel')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setStatus(o.id, 'nouvelle')}
                      disabled={statusBusy === o.id}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition active:scale-[.98] disabled:opacity-60"
                    >
                      <RotateCcw size={15} /> {t('reopen')}
                    </button>
                  )}
                  {statusErrs[o.id] && <p className="mt-2 text-xs font-medium text-rose-600">{statusErrs[o.id]}</p>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {confirmOrder && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-slate-950/60 p-4 backdrop-blur-sm md:items-center"
          style={{ height: 'var(--visual-height, 100dvh)' }}
          onClick={() => !deleting && setConfirmId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
            style={{ maxHeight: 'calc(var(--visual-height, 100dvh) - 3rem)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="display text-lg font-bold text-slate-900">{t('deleteOrderQ')}</h3>
              <button onClick={() => !deleting && setConfirmId(null)} className="rounded-full p-1 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {confirmOrder.customerName || t('client')} — {money(confirmOrder.total)}
            </p>
            <p className="mt-1 text-xs text-slate-400">{t('permanent')}</p>
            {deleteErr && <p className="mt-2 text-xs font-medium text-rose-600">{deleteErr}</p>}
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmId(null)}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => deleteOrder(confirmOrder.id)}
                disabled={deleting}
                className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {deleting ? '…' : t('del')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { X, Minus, Plus, Trash2, MessageCircle, ShoppingBag, CheckCircle2 } from 'lucide-react'
import { db } from '../lib/db'
import { auth } from '../lib/auth'
import { share } from '../lib/share'
import { useStore, money } from '../hooks/useStore'
import SmartImage from './SmartImage'

const INFO_KEY = 'techyous_customer'
const MIN_ORDER = 100

export default function CartDrawer({ shopPhone }) {
  const { t, lang, nameOf, cart, cartOpen, setCartOpen, setQty, clearCart, total, count, method, setMethod } = useStore()
  const [info, setInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem(INFO_KEY) || '{}') } catch { return {} }
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!cartOpen) { setDone(false); setErr('') }
  }, [cartOpen])

  if (!cartOpen) return null

  const update = (k, v) => {
    const next = { ...info, [k]: v }
    setInfo(next)
    localStorage.setItem(INFO_KEY, JSON.stringify(next))
  }

  const zone = info.zone === 'other' ? 'other' : 'kenitra'
  const shipping = zone === 'kenitra' ? 20 : 30
  const cityValue = zone === 'kenitra' ? 'Kénitra' : (info.city || '')
  const grandTotal = total + shipping
  const belowMin = total < MIN_ORDER
  const missing = Math.max(0, MIN_ORDER - total)

  const itemLabel = (i) => {
    const fr = (i.nameFr || '').trim()
    const ar = (i.nameAr || '').trim()
    return ar && ar !== fr ? `${fr} / ${ar}` : fr
  }

  const summaryText = () =>
    '🛒 Nouvelle commande TechYous / طلب جديد من TechYous\n' +
    '\nProduits / المنتجات :\n' +
    cart.map((i) => `• ${itemLabel(i)} ×${i.qty} — ${i.qty * Number(i.price)} MAD`).join('\n') +
    `\n\nSous-total / المجموع الفرعي : ${total} MAD` +
    `\nLivraison / التوصيل (${cityValue}) : ${shipping} MAD` +
    `\nTOTAL à payer / المجموع الإجمالي : ${grandTotal} MAD` +
    `\n\nClient / الزبون : ${info.name || ''}` +
    `\nTéléphone / الهاتف : ${info.phone || ''}` +
    `\nVille de livraison / مدينة التسليم : ${cityValue}` +
    `\nAdresse / العنوان : ${info.address || ''}` +
    '\nPaiement à la livraison / الدفع عند التسليم'

  const record = () => ({
    items: cart.map((i) => ({ sku: i.sku, name: i.nameFr, qty: i.qty, price: Number(i.price) })),
    subtotal: total,
    shipping,
    total: grandTotal,
    customerName: info.name || '',
    customerPhone: info.phone || '',
    city: cityValue,
    address: info.address || '',
    payment: 'cod',
    note: info.address || '',
    channel: method,
    status: 'nouvelle',
  })

  const submit = async () => {
    if (belowMin) { setErr(`${t('minOrder')} — ${t('minOrderHint').replace('{x}', String(missing))}`); return }
    if (!info.name?.trim() || !info.phone?.trim() || !cityValue.trim() || !info.address?.trim()) { setErr(t('required')); return }
    setErr('')
    if (method === 'whatsapp') {
      if (!shopPhone) { setErr(t('noWhatsapp')); return }
      share.whatsappOrder({
        phone: shopPhone,
        text: summaryText(),
        record: record(),
        collection: 'orders',
      })
      clearCart()
      setDone(true)
      return
    }
    setBusy(true)
    try {
      await db.insertShared('orders', record(), undefined, {
        groupId: 'key:orders',
        visibleTo: 'creator-and-admin',
      })
      clearCart()
      setDone(true)
    } catch (e) {
      setErr(e?.message || t('sendError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm md:items-center"
      style={{ height: 'var(--visual-height, 100dvh)' }}
      onClick={() => setCartOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl md:rounded-[28px]"
        style={{ maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)' }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="display text-lg font-bold text-slate-900">
            {done ? t('orderSent') : t('cart')}
            {!done && count > 0 && <span className="ms-2 text-sm font-medium text-slate-400">{count} {t('items')}</span>}
          </h2>
          <button onClick={() => setCartOpen(false)} className="grid h-11 w-11 place-items-center rounded-full text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {done ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 size={56} className="text-emerald-500" />
              <p className="display mt-4 text-xl font-bold text-slate-900">{t('orderSent')}</p>
              <p className="mt-1 text-sm text-slate-500">{t('orderSentHint')}</p>
              <button onClick={() => setCartOpen(false)} className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
                {t('back')}
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <ShoppingBag size={48} className="text-slate-300" />
              <p className="display mt-4 text-lg font-bold text-slate-800">{t('empty')}</p>
              <p className="mt-1 text-sm text-slate-500">{t('emptyHint')}</p>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {cart.map((i) => (
                  <li key={i.sku} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                      <SmartImage src={i.image} alt="" width={112} imgClassName="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{nameOf(i)}</p>
                      <p className="text-sm text-sky-600">{money(i.price)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setQty(i.sku, i.qty - 1)} className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-600 shadow-sm">
                        {i.qty === 1 ? <Trash2 size={15} /> : <Minus size={15} />}
                      </button>
                      <span className="w-7 text-center text-sm font-bold text-slate-900">{i.qty}</span>
                      <button onClick={() => setQty(i.sku, i.qty + 1)} className="grid h-9 w-9 place-items-center rounded-xl bg-white text-slate-600 shadow-sm">
                        <Plus size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('method')}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMethod('whatsapp')}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition ${method === 'whatsapp' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                  <button
                    onClick={() => setMethod('direct')}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition ${method === 'direct' ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <ShoppingBag size={16} /> {t('direct')}
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('delivery')}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => update('zone', 'kenitra')}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${zone === 'kenitra' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {t('zoneKenitra')}
                  </button>
                  <button
                    onClick={() => update('zone', 'other')}
                    className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${zone === 'other' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {t('zoneOther')}
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <input
                  value={info.name || ''}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder={t('name')}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
                <input
                  value={info.phone || ''}
                  onChange={(e) => update('phone', e.target.value)}
                  inputMode="tel"
                  placeholder={t('phone')}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
                {zone === 'kenitra' ? (
                  <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                    {t('city')} : {t('kenitra')}
                  </div>
                ) : (
                  <input
                    value={info.city || ''}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder={t('cityPlaceholder')}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                  />
                )}
                <textarea
                  value={info.address || ''}
                  onChange={(e) => update('address', e.target.value)}
                  rows={2}
                  placeholder={t('addressPlaceholder')}
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
                />
              </div>
              {err && <p className="mt-2 text-sm font-medium text-rose-600">{err}</p>}
              {!auth.isAuthenticated() && (
                <p className="mt-2 text-xs text-slate-400">{t('signInHint')}</p>
              )}
            </>
          )}
        </div>

        {!done && cart.length > 0 && (
          <div className="border-t border-slate-100 px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4">
            <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
              <span>{t('subtotal')}</span>
              <span className="font-medium text-slate-700">{money(total)}</span>
            </div>
            <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
              <span>{t('shipping')} · {zone === 'kenitra' ? t('kenitra') : t('otherCity')}</span>
              <span className="font-medium text-slate-700">{money(shipping)}</span>
            </div>
            <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-sm font-semibold text-slate-600">{t('total')} · {t('cod')}</span>
              <span className="display text-2xl font-bold text-slate-900">{money(grandTotal)}</span>
            </div>
            {belowMin && (
              <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-900">{t('minOrder')}</p>
                <p className="mt-0.5 text-xs text-amber-700">{t('minOrderHint').replace('{x}', String(missing))}</p>
              </div>
            )}
            <button
              onClick={submit}
              disabled={busy || belowMin}
              className={`w-full rounded-2xl py-4 text-sm font-bold text-white transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${method === 'whatsapp' ? 'bg-emerald-500' : 'bg-sky-500'}`}
            >
              {busy ? '...' : belowMin ? t('minOrder') : method === 'whatsapp' ? t('whatsapp') : t('confirm')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload, X, Search, ArrowLeft, Lock, Languages, Loader2 } from 'lucide-react'
import { auth } from '../lib/auth'
import { ai } from '../lib/ai'
import { db } from '../lib/db'
import { storage } from '../lib/storage'
import { useLiveShared } from '../lib/useLive'
import { CATS, money } from '../hooks/useStore'
import SmartImage from '../components/SmartImage'

const CAT_OPTIONS = CATS.filter((c) => c.key !== 'all')

const EMPTY = { sku: '', nameFr: '', nameAr: '', nameEn: '', cat: 'pc', price: '', stock: '', image: '', image2: '', image3: '', credit: '', desc: '', descAr: '', descEn: '', discount_text: '' }

const SLOTS = [
  { key: 'image', label: 'Photo 1 (principale)' },
  { key: 'image2', label: 'Photo 2' },
  { key: 'image3', label: 'Photo 3' },
]

function slug(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

function ProductForm({ initial, onClose }) {
  const [form, setForm] = useState({ ...EMPTY, ...(initial || {}) })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [translating, setTranslating] = useState(false)
  const isEdit = Boolean(initial?.sku)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const pickFile = async (e, key) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr('')
    try {
      const { url } = await storage.upload(file, file.name || 'photo.jpg')
      set(key, url)
      if (key === 'image') set('credit', '')
    } catch (e2) {
      setErr(e2?.message || "Échec du téléversement de l'image.")
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const translate = async () => {
    const name = form.nameFr.trim()
    if (!name) return setErr('Écrivez d\u2019abord le nom du produit en français.')
    setTranslating(true)
    setErr('')
    try {
      const { json } = await ai.run(
        `Traduis cette fiche produit d'une boutique high-tech marocaine.\n` +
          `Nom (français): ${name}\n` +
          `Description (français): ${(form.desc || '').trim() || '(vide)'}\n\n` +
          `Réponds en JSON avec exactement les clés: nameAr, nameEn, descAr, descEn.\n` +
          `nameAr/descAr en arabe, nameEn/descEn en anglais. Garde les marques, modèles, références et unités techniques tels quels. ` +
          `Si la description est vide, renvoie une chaîne vide pour descAr et descEn. Ne renvoie rien d'autre que le JSON.`,
        { json: true },
      )
      if (!json) throw new Error('Traduction illisible, réessayez.')
      setForm((f) => ({
        ...f,
        nameAr: String(json.nameAr || f.nameAr || ''),
        nameEn: String(json.nameEn || f.nameEn || ''),
        descAr: String(json.descAr || f.descAr || ''),
        descEn: String(json.descEn || f.descEn || ''),
      }))
    } catch (e2) {
      setErr(e2?.message || 'La traduction automatique a échoué.')
    } finally {
      setTranslating(false)
    }
  }

  const save = async () => {
    const name = form.nameFr.trim()
    if (!name) return setErr('Le nom du produit est obligatoire.')
    const price = Number(form.price)
    if (!Number.isFinite(price) || price < 0) return setErr('Prix invalide.')
    const id = (isEdit ? form.sku : form.sku.trim() || slug(name) || `p-${Date.now()}`).trim()
    setBusy(true)
    setErr('')
    const images = [form.image, form.image2, form.image3]
      .map((u) => String(u || '').trim())
      .filter(Boolean)
    try {
      await db.upsertShared(
        'products',
        {
          sku: id,
          nameFr: name,
          nameAr: (form.nameAr || '').trim(),
          nameEn: (form.nameEn || '').trim(),
          cat: form.cat,
          price,
          stock: Number(form.stock) || 0,
          image: images[0] || '',
          image2: images[1] || '',
          image3: images[2] || '',
          images,
          credit: form.credit || '',
          desc: (form.desc || '').trim(),
          descAr: (form.descAr || '').trim(),
          descEn: (form.descEn || '').trim(),
          discount_text: (form.discount_text || '').trim(),
        },
        id,
      )
      onClose()
    } catch (e2) {
      setErr(e2?.message || "Impossible d'enregistrer le produit.")
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm md:items-center"
      style={{ height: 'var(--visual-height, 100dvh)' }}
    >
      <div
        className="w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 md:rounded-3xl"
        style={{ maxHeight: 'calc(var(--visual-height, 100dvh) - 2rem)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="display text-lg font-bold text-slate-900">
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Photos du produit (jusqu'à 3)</p>
          {SLOTS.map((s) => (
            <div key={s.key} className="flex gap-3">
              <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100">
                {form[s.key] ? (
                  <SmartImage src={form[s.key]} alt="" width={192} imgClassName="h-full w-full object-cover" fallback={<ImageIcon size={22} className="text-slate-400" />} />
                ) : (
                  <ImageIcon size={22} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{s.label}</span>
                  {form[s.key] && (
                    <button onClick={() => set(s.key, '')} className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600">
                      Retirer
                    </button>
                  )}
                </div>
                <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white">
                  <Upload size={16} /> Choisir une photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e, s.key)} />
                </label>
                <input
                  value={form[s.key]}
                  onChange={(e) => set(s.key, e.target.value)}
                  placeholder="…ou coller un lien d'image"
                  className="mt-2 w-full rounded-2xl bg-slate-100 px-3 py-2.5 text-xs text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nom du produit</label>
            <input
              value={form.nameFr}
              onChange={(e) => set('nameFr', e.target.value)}
              placeholder="Ex. Clavier mécanique RGB"
              className="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
            <textarea
              value={form.desc}
              onChange={(e) => set('desc', e.target.value)}
              rows={4}
              placeholder="Caractéristiques, contenu de la boîte, compatibilité…"
              className="mt-1 w-full resize-none rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </div>

          <div className="rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Traductions (arabe / anglais)</span>
              <button
                onClick={translate}
                disabled={translating}
                className="flex items-center gap-2 rounded-full bg-sky-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                {translating ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                {translating ? 'Traduction…' : 'Traduire automatiquement'}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Affichées quand le client choisit العربية ou English. Vide = le texte français est utilisé.
            </p>
            <div className="mt-3 space-y-3">
              <input
                value={form.nameAr}
                onChange={(e) => set('nameAr', e.target.value)}
                dir="rtl"
                placeholder="اسم المنتج بالعربية"
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200"
              />
              <textarea
                value={form.descAr}
                onChange={(e) => set('descAr', e.target.value)}
                dir="rtl"
                rows={3}
                placeholder="وصف المنتج بالعربية"
                className="w-full resize-none rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200"
              />
              <input
                value={form.nameEn}
                onChange={(e) => set('nameEn', e.target.value)}
                placeholder="Product name in English"
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200"
              />
              <textarea
                value={form.descEn}
                onChange={(e) => set('descEn', e.target.value)}
                rows={3}
                placeholder="Product description in English"
                className="w-full resize-none rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catégorie</label>
            <select
              value={form.cat}
              onChange={(e) => set('cat', e.target.value)}
              className="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
            >
              {CAT_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prix (MAD)</label>
              <input
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                inputMode="decimal"
                placeholder="250"
                className="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</label>
              <input
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                inputMode="numeric"
                placeholder="10"
                className="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Étiquette promo (facultatif)</label>
            <input
              value={form.discount_text}
              onChange={(e) => set('discount_text', e.target.value)}
              placeholder="Ex. -10%, -20%, PROMO"
              className="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">Affichée en badge jaune sur la photo. Laissez vide pour ne rien afficher.</p>
          </div>

          {!isEdit && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Référence (facultatif)</label>
              <input
                value={form.sku}
                onChange={(e) => set('sku', e.target.value)}
                placeholder="générée automatiquement"
                className="mt-1 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </div>
          )}
        </div>

        {err && <p className="mt-3 text-sm font-medium text-rose-600">{err}</p>}

        <button
          onClick={save}
          disabled={busy}
          className="mt-5 w-full rounded-2xl bg-sky-500 py-3.5 text-sm font-bold text-white transition active:scale-[.99] disabled:opacity-60"
        >
          {busy ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  )
}

function parseLoose(text) {
  const s = String(text || '')
  const m = s.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

async function translateOne(p) {
  const nameFr = String(p.nameFr || '').trim()
  const descFr = String(p.desc || '').trim().slice(0, 700)
  const prompt =
    `Traduis cette fiche produit d'une boutique high-tech marocaine.\n` +
    `Nom (français) : ${nameFr}\n` +
    (descFr ? `Description (français) : ${descFr}\n` : `Description (français) : (vide)\n`) +
    `\nRéponds UNIQUEMENT avec cet objet JSON, sans texte autour :\n` +
    `{"nameAr":"","nameEn":"","descAr":"","descEn":""}\n` +
    `nameAr/descAr en arabe, nameEn/descEn en anglais commercial naturel ` +
    `(ex. "Point d'accès WiFi" -> "WiFi Access Point", "Souris gaming RGB" -> "RGB Gaming Mouse", "Clavier sans fil" -> "Wireless Keyboard").\n` +
    `Garde les marques, modèles, références et unités techniques tels quels. ` +
    `Si la description est vide, renvoie "" pour descAr et descEn.`
  const res = await ai.run(prompt, { json: true })
  const j = res?.json && typeof res.json === 'object' ? res.json : parseLoose(res?.text)
  if (!j) throw new Error('réponse illisible')
  const clean = (v) => String(v ?? '').trim()
  return {
    nameAr: clean(j.nameAr),
    nameEn: clean(j.nameEn),
    descAr: clean(j.descAr),
    descEn: clean(j.descEn),
  }
}

export default function Admin() {
  const [owner, setOwner] = useState(auth.isAppOwner())
  const [checked, setChecked] = useState(false)
  const [editing, setEditing] = useState(null)
  const [q, setQ] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)
  const [bulk, setBulk] = useState({ running: false, done: 0, total: 0, err: '', ok: 0 })
  const { data: products, loading } = useLiveShared('products', { limit: 300 })

  const needsTr = useMemo(() => {
    return (products || []).filter((p) => {
      const hasDesc = Boolean((p.desc || '').trim())
      return (
        !(p.nameEn || '').trim() ||
        !(p.nameAr || '').trim() ||
        (hasDesc && (!(p.descEn || '').trim() || !(p.descAr || '').trim()))
      )
    })
  }, [products])

  const translateAll = async () => {
    const todo = needsTr
    if (!todo.length || bulk.running) return
    setBulk({ running: true, done: 0, total: todo.length, err: '', ok: 0 })
    let done = 0
    let ok = 0
    let fail = 0
    let err = ''
    for (const p of todo) {
      try {
        const r = await translateOne(p)
        const patch = {}
        if (!(p.nameAr || '').trim() && r.nameAr) patch.nameAr = r.nameAr
        if (!(p.nameEn || '').trim() && r.nameEn) patch.nameEn = r.nameEn
        if (!(p.descAr || '').trim() && r.descAr) patch.descAr = r.descAr
        if (!(p.descEn || '').trim() && r.descEn) patch.descEn = r.descEn
        if (Object.keys(patch).length) {
          await db.updateShared('products', p.id || p.sku, patch)
          ok++
        } else {
          fail++
          err = `Aucune traduction reçue pour « ${p.nameFr || p.sku} ».`
        }
      } catch (e) {
        fail++
        err = `« ${p.nameFr || p.sku} » : ${e?.message || 'échec de la traduction'}`
      }
      done++
      setBulk({ running: true, done, total: todo.length, err: fail ? err : '', ok })
    }
    setBulk({ running: false, done, total: todo.length, err: fail ? err : '', ok })
  }

  useEffect(() => {
    setOwner(auth.isAppOwner())
    setChecked(true)
    return auth.onAuthChange(() => setOwner(auth.isAppOwner()))
  }, [])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (products || [])
      .filter((p) => (!s ? true : `${p.nameFr || ''} ${p.sku || ''}`.toLowerCase().includes(s)))
      .sort((a, b) => String(a.cat).localeCompare(String(b.cat)) || String(a.nameFr).localeCompare(String(b.nameFr)))
  }, [products, q])

  const remove = async (p) => {
    await db.deleteShared('products', p.id || p.sku)
    setConfirmDel(null)
  }

  if (!owner) {
    return (
      <div className="mx-auto w-full max-w-md px-4 pb-40 pt-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/10 text-sky-300">
          <Lock size={26} />
        </div>
        <h2 className="display mt-4 text-xl font-bold text-white">Espace réservé</h2>
        <p className="mt-2 text-sm text-slate-400">
          Connectez-vous avec le compte propriétaire de la boutique pour gérer les produits.
        </p>
        <button
          onClick={() => auth.signIn()}
          className="mt-5 w-full rounded-2xl bg-sky-400 py-3.5 text-sm font-bold text-slate-900"
        >
          Se connecter
        </button>
        <Link to="/" className="mt-3 inline-flex items-center gap-2 text-sm text-slate-400">
          <ArrowLeft size={15} /> Retour à la boutique
        </Link>
        {!checked && null}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-40 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="display text-xl font-bold text-white md:text-2xl">Gestion des produits</h2>
          <p className="text-sm text-slate-400">{(products || []).length} produit(s) en catalogue</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 rounded-2xl bg-sky-400 px-4 py-3 text-sm font-bold text-slate-900 transition active:scale-[.98]"
        >
          <Plus size={17} /> Ajouter un produit
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="display font-bold text-white">Traductions arabe / anglais</p>
            <p className="mt-0.5 text-sm text-slate-400">
              {bulk.running
                ? `Traduction en cours… ${bulk.done}/${bulk.total}`
                : needsTr.length === 0
                ? 'Tous les produits sont traduits en arabe et en anglais.'
                : `${needsTr.length} produit(s) sans traduction complète.`}
            </p>
          </div>
          <button
            onClick={translateAll}
            disabled={bulk.running || needsTr.length === 0}
            className="flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-bold text-white transition active:scale-[.98] disabled:opacity-50"
          >
            {bulk.running ? <Loader2 size={16} className="animate-spin" /> : <Languages size={16} />}
            {bulk.running ? 'Traduction…' : 'Traduire tout le catalogue'}
          </button>
        </div>
        {!bulk.running && bulk.total > 0 && (
          <p className="mt-2 text-sm font-semibold text-emerald-300">{bulk.ok} produit(s) traduits et enregistrés.</p>
        )}
        {bulk.err && (
          <p className="mt-2 text-sm font-medium text-rose-300">
            {bulk.err} — réappuyez sur le bouton pour réessayer les produits restants.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4">
        <Search size={17} className="text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher dans le catalogue..."
          className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {loading ? (
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-3xl bg-white/10" />)}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 py-16 text-center text-slate-300">
          Aucun produit. Ajoutez votre premier article.
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 xl:grid-cols-2">
          {list.map((p) => (
            <li key={p.id || p.sku} className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-lg shadow-slate-950/20">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-slate-100">
                {p.image ? (
                  <SmartImage src={p.image} alt="" width={128} imgClassName="h-full w-full object-cover" fallback={<ImageIcon size={18} className="text-slate-400" />} />
                ) : (
                  <ImageIcon size={18} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-900">{p.nameFr}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {(CATS.find((c) => c.key === p.cat)?.label) || p.cat} · stock {Number(p.stock) || 0}
                </p>
                <p className="display mt-0.5 font-bold text-sky-600">{money(p.price)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setEditing({
                    sku: p.sku || p.id,
                    nameFr: p.nameFr || '',
                    nameAr: p.nameAr || '',
                    nameEn: p.nameEn || '',
                    cat: p.cat || 'pc',
                    price: String(p.price ?? ''),
                    stock: String(p.stock ?? ''),
                    image: p.image || p.images?.[0] || '',
                    image2: p.image2 || p.images?.[1] || '',
                    image3: p.image3 || p.images?.[2] || '',
                    credit: p.credit || '',
                    desc: p.desc || '',
                    descAr: p.descAr || '',
                    descEn: p.descEn || '',
                    discount_text: p.discount_text || '',
                  })}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700"
                >
                  <Pencil size={17} />
                </button>
                <button
                  onClick={() => setConfirmDel(p)}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-50 text-rose-600"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && <ProductForm initial={editing.sku ? editing : null} onClose={() => setEditing(null)} />}

      {confirmDel && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-6 backdrop-blur-sm"
          style={{ height: 'var(--visual-height, 100dvh)' }}
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-5">
            <h3 className="display text-lg font-bold text-slate-900">Supprimer ce produit ?</h3>
            <p className="mt-1 text-sm text-slate-600">{confirmDel.nameFr}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setConfirmDel(null)} className="rounded-2xl bg-slate-100 py-3 text-sm font-bold text-slate-700">
                Annuler
              </button>
              <button onClick={() => remove(confirmDel)} className="rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

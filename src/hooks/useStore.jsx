import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const StoreCtx = createContext(null)

export const CATS = [
  { key: 'all', label: 'Tout', ar: 'الكل', en: 'All' },
  { key: 'pc', label: 'Accessoires PC', ar: 'ملحقات الحاسوب', en: 'PC Accessories' },
  { key: 'cables', label: 'Câbles & Adaptateurs', ar: 'كابلات ومحولات', en: 'Cables & Adapters' },
  { key: 'network', label: 'Réseaux', ar: 'شبكات', en: 'Networking' },
  { key: 'smart', label: 'Appareils Intelligents', ar: 'أجهزة ذكية', en: 'Smart Devices' },
  { key: 'phone', label: 'Accessoires Téléphone', ar: 'ملحقات الهاتف', en: 'Phone Accessories' },
  { key: 'gaming', label: 'Gaming', ar: 'ألعاب', en: 'Gaming' },
  { key: 'computers', label: 'Ordinateurs', ar: 'حواسيب', en: 'Computers' },
  { key: 'tv', label: 'Téléviseurs', ar: 'تلفزيونات', en: 'TVs' },
  { key: 'printers', label: 'Imprimantes', ar: 'طابعات', en: 'Printers' },
]

export const T = {
  fr: {
    tagline: 'Boutique high-tech & accessoires',
    search: 'Rechercher un produit...',
    shop: 'Boutique',
    orders: 'Mes commandes',
    add: 'Ajouter',
    added: 'Ajouté',
    addedToCart: 'Ajouté au panier',
    buyNow: 'Acheter maintenant',
    inStock: 'En stock',
    low: 'Stock limité',
    out: 'Rupture de stock',
    cart: 'Mon panier',
    empty: 'Votre panier est vide',
    emptyHint: 'Ajoutez des produits pour commencer votre commande',
    total: 'Total',
    whatsapp: 'Commander via WhatsApp',
    direct: 'Commande directe',
    name: 'Nom et prénom',
    phone: 'Numéro de téléphone',
    city: 'Ville',
    address: 'Adresse de livraison',
    note: 'Adresse ou remarque (facultatif)',
    delivery: 'Livraison',
    zoneKenitra: 'Kénitra — 20 DH',
    zoneOther: 'Autre ville — 30 DH',
    kenitra: 'Kénitra',
    otherCity: 'Autre ville',
    subtotal: 'Sous-total',
    shipping: 'Frais de livraison',
    cityPlaceholder: 'Votre ville',
    addressPlaceholder: 'Rue, quartier, repère...',
    confirm: 'Confirmer la commande',
    close: 'Fermer',
    signIn: 'Mon compte',
    noResults: 'Aucun résultat',
    noResultsHint: 'Essayez une autre recherche ou catégorie.',
    sortLabel: 'Trier',
    sortDefault: 'Nouveautés',
    sortAsc: 'Prix croissant',
    sortDesc: 'Prix décroissant',
    minOrder: 'Montant minimum de commande : 100 MAD',
    minOrderHint: 'Ajoutez {x} MAD d\u2019articles pour valider votre commande.',
    orderSent: 'Commande envoyée',
    orderSentHint: 'Nous vous contactons rapidement pour confirmer',
    myOrders: 'Mes commandes',
    allOrders: 'Toutes les commandes',
    noOrders: 'Aucune commande pour le moment',
    signInHint: 'Connectez-vous pour suivre vos commandes',
    qty: 'Qté',
    items: 'article(s)',
    installTitle: "Ajouter TechYous à l'écran d'accueil",
    installBody: 'Installez la boutique sur votre téléphone',
    install: 'Installer',
    installHow: 'Comment installer',
    iosHow: 'Comment faire',
    installManual: 'Installation manuelle depuis le menu du navigateur',
    iosInstall: "Dans Safari : bouton Partager, puis « Sur l'écran d'accueil »",
    later: 'Plus tard',
    admin: 'Espace boutique',
    manageProducts: 'Gérer les produits',
    shopNumber: 'Numéro WhatsApp de la boutique',
    phoneFormatHint: 'Format international sans « + » ni « 0 » au début (ex. 2126…).',
    save: 'Enregistrer',
    saved: 'Enregistré',
    alerts: 'Activer les alertes de commande',
    alertsOn: 'Alertes activées',
    method: 'Mode de commande',
    required: 'Nom, téléphone, ville et adresse obligatoires',
    cod: 'Paiement à la livraison',
    back: 'Retour à la boutique',
    description: 'Description',
    ref: 'Réf.',
    warranty: 'Produit garanti',
    fastDelivery: 'Livraison rapide',
    photoBy: 'Photo :',
    productNotFound: 'Produit introuvable',
    descFallback: 'Produit disponible chez TechYous. Contactez-nous pour plus de détails techniques ou une commande en quantité.',
    enlarge: 'Agrandir',
    prevImage: 'Image précédente',
    nextImage: 'Image suivante',
    zoomIn: 'Zoomer',
    zoomOut: 'Réduire',
    client: 'Client',
    deleteOrder: 'Supprimer la commande',
    deleteOrderQ: 'Supprimer cette commande ?',
    permanent: 'Cette action est définitive.',
    cancel: 'Annuler',
    del: 'Supprimer',
    deleteFail: 'Suppression impossible.',
    statusNew: 'Nouvelle',
    statusConfirmed: 'Confirmée',
    statusCancelled: 'Annulée',
    doConfirm: 'Confirmer',
    doCancel: 'Annuler la commande',
    reopen: 'Remettre en attente',
    statusFail: 'Mise à jour du statut impossible.',
    noWhatsapp: "Le numéro WhatsApp de la boutique n'est pas encore configuré.",
    sendError: "Erreur lors de l'envoi de la commande.",
    followUs: 'Suivez-nous',
    rights: 'Kénitra, Maroc',
    lang: 'Langue',
  },
  ar: {
    tagline: 'متجر التقنية والإكسسوارات',
    search: 'ابحث عن منتج...',
    shop: 'المتجر',
    orders: 'طلباتي',
    add: 'أضف',
    added: 'تمت الإضافة',
    addedToCart: 'أُضيف إلى السلة',
    buyNow: 'اشترِ الآن',
    inStock: 'متوفر',
    low: 'كمية محدودة',
    out: 'نفدت الكمية',
    cart: 'سلة المشتريات',
    empty: 'سلتك فارغة',
    emptyHint: 'أضف منتجات لبدء طلبك',
    total: 'المجموع',
    whatsapp: 'اطلب عبر واتساب',
    direct: 'طلب مباشر',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    city: 'المدينة',
    address: 'عنوان التسليم',
    note: 'العنوان أو ملاحظة (اختياري)',
    delivery: 'التوصيل',
    zoneKenitra: 'القنيطرة — 20 درهم',
    zoneOther: 'مدينة أخرى — 30 درهم',
    kenitra: 'القنيطرة',
    otherCity: 'مدينة أخرى',
    subtotal: 'المجموع الفرعي',
    shipping: 'رسوم التوصيل',
    cityPlaceholder: 'مدينتك',
    addressPlaceholder: 'الشارع، الحي، علامة مميزة...',
    confirm: 'تأكيد الطلب',
    close: 'إغلاق',
    signIn: 'حسابي',
    noResults: 'لا توجد نتائج',
    noResultsHint: 'جرّب بحثًا أو فئة أخرى.',
    sortLabel: 'ترتيب',
    sortDefault: 'الأحدث',
    sortAsc: 'السعر: من الأقل إلى الأعلى',
    sortDesc: 'السعر: من الأعلى إلى الأقل',
    minOrder: 'الحد الأدنى للطلب: 100 درهم',
    minOrderHint: 'أضف {x} درهم من المنتجات لتأكيد طلبك.',
    orderSent: 'تم إرسال الطلب',
    orderSentHint: 'سنتواصل معك قريبًا للتأكيد',
    myOrders: 'طلباتي',
    allOrders: 'جميع الطلبات',
    noOrders: 'لا توجد طلبات حاليًا',
    signInHint: 'سجّل الدخول لمتابعة طلباتك',
    qty: 'الكمية',
    items: 'منتج',
    installTitle: 'أضف TechYous إلى الشاشة الرئيسية',
    installBody: 'ثبّت المتجر على هاتفك',
    install: 'تثبيت',
    installHow: 'طريقة التثبيت',
    iosHow: 'كيف أفعل ذلك',
    installManual: 'التثبيت يدويًا من قائمة المتصفح',
    iosInstall: 'في سفاري: زر المشاركة ثم « إضافة إلى الشاشة الرئيسية »',
    later: 'لاحقًا',
    admin: 'إدارة المتجر',
    manageProducts: 'إدارة المنتجات',
    shopNumber: 'رقم واتساب المتجر',
    phoneFormatHint: 'صيغة دولية بدون « + » ولا « 0 » في البداية (مثال 2126…).',
    save: 'حفظ',
    saved: 'تم الحفظ',
    alerts: 'تفعيل تنبيهات الطلبات',
    alertsOn: 'التنبيهات مفعّلة',
    method: 'طريقة الطلب',
    required: 'الاسم والهاتف والمدينة والعنوان إلزامية',
    cod: 'الدفع عند التسليم',
    back: 'العودة إلى المتجر',
    description: 'الوصف',
    ref: 'المرجع',
    warranty: 'منتج مضمون',
    fastDelivery: 'توصيل سريع',
    photoBy: 'الصورة:',
    productNotFound: 'المنتج غير موجود',
    descFallback: 'منتج متوفر لدى TechYous. تواصل معنا لمزيد من التفاصيل التقنية أو للطلب بالجملة.',
    enlarge: 'تكبير',
    prevImage: 'الصورة السابقة',
    nextImage: 'الصورة التالية',
    zoomIn: 'تكبير',
    zoomOut: 'تصغير',
    client: 'زبون',
    deleteOrder: 'حذف الطلب',
    deleteOrderQ: 'هل تريد حذف هذا الطلب؟',
    permanent: 'هذا الإجراء نهائي.',
    cancel: 'إلغاء',
    del: 'حذف',
    deleteFail: 'تعذّر الحذف.',
    statusNew: 'جديدة',
    statusConfirmed: 'مؤكَّدة',
    statusCancelled: 'ملغاة',
    doConfirm: 'تأكيد',
    doCancel: 'إلغاء الطلب',
    reopen: 'إرجاع إلى الانتظار',
    statusFail: 'تعذّر تحديث حالة الطلب.',
    noWhatsapp: 'لم يتم بعد ضبط رقم واتساب الخاص بالمتجر.',
    sendError: 'حدث خطأ أثناء إرسال الطلب.',
    followUs: 'تابعنا',
    rights: 'القنيطرة، المغرب',
    lang: 'اللغة',
  },
  en: {
    tagline: 'Tech store & accessories',
    search: 'Search for a product...',
    shop: 'Shop',
    orders: 'My orders',
    add: 'Add',
    added: 'Added',
    addedToCart: 'Added to cart',
    buyNow: 'Buy now',
    inStock: 'In stock',
    low: 'Low stock',
    out: 'Out of stock',
    cart: 'My cart',
    empty: 'Your cart is empty',
    emptyHint: 'Add products to start your order',
    total: 'Total',
    whatsapp: 'Order via WhatsApp',
    direct: 'Direct order',
    name: 'Full name',
    phone: 'Phone number',
    city: 'City',
    address: 'Delivery address',
    note: 'Address or note (optional)',
    delivery: 'Delivery',
    zoneKenitra: 'Kénitra — 20 DH',
    zoneOther: 'Other city — 30 DH',
    kenitra: 'Kénitra',
    otherCity: 'Other city',
    subtotal: 'Subtotal',
    shipping: 'Shipping fee',
    cityPlaceholder: 'Your city',
    addressPlaceholder: 'Street, area, landmark...',
    confirm: 'Confirm order',
    close: 'Close',
    signIn: 'My account',
    noResults: 'No results',
    noResultsHint: 'Try another search or category.',
    sortLabel: 'Sort',
    sortDefault: 'Newest',
    sortAsc: 'Price: low to high',
    sortDesc: 'Price: high to low',
    minOrder: 'Minimum order: 100 MAD',
    minOrderHint: 'Add {x} MAD more to place your order.',
    orderSent: 'Order sent',
    orderSentHint: 'We will contact you shortly to confirm',
    myOrders: 'My orders',
    allOrders: 'All orders',
    noOrders: 'No orders yet',
    signInHint: 'Sign in to track your orders',
    qty: 'Qty',
    items: 'item(s)',
    installTitle: 'Add TechYous to your home screen',
    installBody: 'Install the store on your phone',
    install: 'Install',
    installHow: 'How to install',
    iosHow: 'How to do it',
    installManual: 'Manual install from the browser menu',
    iosInstall: 'In Safari: Share button, then “Add to Home Screen”',
    later: 'Later',
    admin: 'Store admin',
    manageProducts: 'Manage products',
    shopNumber: 'Store WhatsApp number',
    phoneFormatHint: 'International format without “+” or leading “0” (e.g. 2126…).',
    save: 'Save',
    saved: 'Saved',
    alerts: 'Enable order alerts',
    alertsOn: 'Alerts enabled',
    method: 'Order method',
    required: 'Name, phone, city and address are required',
    cod: 'Cash on delivery',
    back: 'Back to shop',
    description: 'Description',
    ref: 'Ref.',
    warranty: 'Warranted product',
    fastDelivery: 'Fast delivery',
    photoBy: 'Photo:',
    productNotFound: 'Product not found',
    descFallback: 'Product available at TechYous. Contact us for more technical details or bulk orders.',
    enlarge: 'Enlarge',
    prevImage: 'Previous image',
    nextImage: 'Next image',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    client: 'Customer',
    deleteOrder: 'Delete order',
    deleteOrderQ: 'Delete this order?',
    permanent: 'This action is permanent.',
    cancel: 'Cancel',
    del: 'Delete',
    deleteFail: 'Could not delete.',
    statusNew: 'New',
    statusConfirmed: 'Confirmed',
    statusCancelled: 'Cancelled',
    doConfirm: 'Confirm',
    doCancel: 'Cancel order',
    reopen: 'Move back to pending',
    statusFail: 'Could not update the order status.',
    noWhatsapp: 'The store WhatsApp number is not set up yet.',
    sendError: 'Error while sending the order.',
    followUs: 'Follow us',
    rights: 'Kénitra, Morocco',
    lang: 'Language',
  },
}

const CART_KEY = 'techyous_cart_v1'
const LANG_KEY = 'techyous_lang'

export function StoreProvider({ children }) {
  const [query, setQuery] = useState('')
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY)
      if (saved === 'fr' || saved === 'ar' || saved === 'en') return saved
      const nav = navigator.language || ''
      if (/^ar/i.test(nav)) return 'ar'
      if (/^en/i.test(nav)) return 'en'
      return 'fr'
    } catch { return 'fr' }
  })
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]') } catch { return [] }
  })
  const [cartOpen, setCartOpen] = useState(false)
  const [method, setMethod] = useState('whatsapp')

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try { localStorage.setItem(LANG_KEY, lang) } catch {}
  }, [lang])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  const value = useMemo(() => ({
    lang,
    setLang: (l) => {
      const next = l === 'ar' ? 'ar' : l === 'en' ? 'en' : 'fr'
      document.documentElement.lang = next
      document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
      setLangState(next)
    },
    isRTL: lang === 'ar',
    t: (k) => (T[lang]?.[k] ?? T.fr[k] ?? k),
    nameOf: (p) => {
      if (!p) return ''
      const fr = p.nameFr || p.name || ''
      if (lang === 'ar') return (p.nameAr || '').trim() || fr
      if (lang === 'en') return (p.nameEn || '').trim() || fr
      return fr
    },
    descOf: (p) => {
      if (!p) return ''
      const fr = (p.desc || '').trim()
      if (lang === 'ar') return (p.descAr || '').trim() || fr
      if (lang === 'en') return (p.descEn || '').trim() || fr
      return fr
    },
    catLabel: (key) => {
      const c = CATS.find((x) => x.key === key)
      if (!c) return key
      return lang === 'ar' ? c.ar : lang === 'en' ? (c.en || c.label) : c.label
    },
    query,
    setQuery,
    cart,
    cartOpen,
    setCartOpen,
    method,
    setMethod,
    addToCart: (p) =>
      setCart((c) => {
        const found = c.find((i) => i.sku === p.sku)
        if (found) return c.map((i) => (i.sku === p.sku ? { ...i, qty: i.qty + 1 } : i))
        return [...c, { sku: p.sku, nameFr: p.nameFr, nameAr: p.nameAr || '', nameEn: p.nameEn || '', price: p.price, image: p.image, qty: 1 }]
      }),
    setQty: (sku, qty) =>
      setCart((c) => (qty <= 0 ? c.filter((i) => i.sku !== sku) : c.map((i) => (i.sku === sku ? { ...i, qty } : i)))),
    clearCart: () => setCart([]),
    count: cart.reduce((s, i) => s + i.qty, 0),
    total: cart.reduce((s, i) => s + i.qty * Number(i.price || 0), 0),
  }), [query, cart, cartOpen, method, lang])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export function money(n) {
  const isAr = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
  const v = Number(n || 0).toLocaleString('fr-FR')
  return isAr ? `${v} درهم` : `${v} MAD`
}

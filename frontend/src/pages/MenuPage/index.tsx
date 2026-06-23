import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getMenu, placeOrder } from '../../api/menu'
import { formatMoney } from '../../utils/format'
import type {
  MenuResponseDto,
  MenuProductDto,
  MenuCartItem,
  CustomerOrderResponseDto,
} from '../../types'

type ViewState = 'browse' | 'cart' | 'confirmed'

export default function MenuPage() {
  const { tableNumber } = useParams<{ tableNumber: string }>()
  const tableNum = Number(tableNumber)

  const [menu, setMenu]           = useState<MenuResponseDto | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [view, setView]           = useState<ViewState>('browse')
  const [selectedCat, setSelectedCat] = useState<number | null>(null)
  const [cart, setCart]           = useState<MenuCartItem[]>([])
  const [note, setNote]           = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [receipt, setReceipt]     = useState<CustomerOrderResponseDto | null>(null)

  useEffect(() => {
    getMenu(tableNum)
      .then(r => {
        setMenu(r.data)
        if (r.data.categories.length > 0) {
          setSelectedCat(r.data.categories[0].id)
        }
      })
      .catch(() => setError('No se pudo cargar el menú. Pedile al mozo que recargue el QR.'))
      .finally(() => setLoading(false))
  }, [tableNum])

  const currentProducts = useMemo(
    () => menu?.categories.find(c => c.id === selectedCat)?.products ?? [],
    [menu, selectedCat]
  )

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  )

  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity, 0),
    [cart]
  )

  const getQty = (productId: number) =>
    cart.find(i => i.productId === productId)?.quantity ?? 0

  const addToCart = (product: MenuProductDto) => {
    if (!product.available) return
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        return prev.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        notes: '',
      }]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId)
      if (!existing) return prev
      if (existing.quantity === 1) return prev.filter(i => i.productId !== productId)
      return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }

  const handleOrder = async () => {
    if (cart.length === 0) return
    setSubmitting(true)
    setOrderError('')
    try {
      const res = await placeOrder(tableNum, {
        items: cart.map(({ productId, quantity, notes }) => ({ productId, quantity, notes })),
        note: note.trim() || undefined,
      })
      setReceipt(res.data)
      setCart([])
      setNote('')
      setView('confirmed')
    } catch (err: any) {
      setOrderError(err.response?.data?.message ?? 'No se pudo enviar el pedido. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-dvh bg-bg flex items-center justify-center">
        <p className="text-muted text-sm">Cargando menú...</p>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────
  if (error || !menu) {
    return (
      <div className="h-dvh bg-bg flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-muted text-sm">{error || 'Mesa no encontrada'}</p>
        </div>
      </div>
    )
  }

  // ── Confirmación ────────────────────────────────────────────────────
  if (view === 'confirmed' && receipt) {
    return (
      <div className="h-dvh bg-bg flex flex-col max-w-lg mx-auto">
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 gap-5 text-center">
          <p className="text-6xl m-0">✅</p>

          <div>
            <h1 className="m-0 text-2xl font-bold text-ok">¡Pedido enviado!</h1>
            <p className="m-0 text-muted text-sm mt-1">{receipt.message}</p>
          </div>

          <div className="card w-full text-left">
            <div className="flex justify-between text-xs text-muted mb-3">
              <span>Mesa {receipt.tableNumber}</span>
              <span>Pedido #{receipt.orderId}</span>
            </div>
            <ul className="m-0 pl-0 list-none grid gap-2">
              {receipt.items.map((item, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.productName}</span>
                  <span className="text-muted">{formatMoney(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold border-t border-line pt-3 mt-3">
              <span>Total</span>
              <span>{formatMoney(receipt.total)}</span>
            </div>
          </div>

          <p className="text-muted text-xs">
            Cocina y barra ya están preparando tu pedido.
          </p>
        </div>

        <div className="shrink-0 p-4 border-t border-line">
          <button
            className="w-full"
            onClick={() => {
              setView('browse')
              setReceipt(null)
            }}
          >
            Pedir más
          </button>
        </div>
      </div>
    )
  }

  // ── Carrito ─────────────────────────────────────────────────────────
  if (view === 'cart') {
    return (
      <div className="h-dvh bg-bg flex flex-col max-w-lg mx-auto">
        <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-line bg-panel">
          <button
            className="btn-ghost px-3 py-2 min-h-0 text-sm"
            onClick={() => { setView('browse'); setOrderError('') }}
          >
            ← Volver
          </button>
          <h1 className="m-0 text-base font-bold flex-1">Tu pedido</h1>
          <span className="text-xs text-muted">Mesa {tableNum}</span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="empty">No agregaste productos todavía.</div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.productId} className="card flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm leading-tight">{item.productName}</span>
                    <span className="text-muted text-sm shrink-0">
                      {formatMoney(item.price * item.quantity)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        className="btn-ghost min-h-0 w-9 h-9 p-0 flex items-center justify-center text-lg font-bold"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        className="min-h-0 w-9 h-9 p-0 flex items-center justify-center text-lg font-bold"
                        onClick={() => {
                          const product = menu.categories
                            .flatMap(c => c.products)
                            .find(p => p.id === item.productId)
                          if (product) addToCart(product)
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-muted text-xs">{formatMoney(item.price)} c/u</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Observación (ej.: sin cebolla)"
                    value={item.notes}
                    onChange={e =>
                      setCart(prev =>
                        prev.map(i =>
                          i.productId === item.productId ? { ...i, notes: e.target.value } : i
                        )
                      )
                    }
                    className="text-sm py-2 min-h-0"
                  />
                </div>
              ))}

              <label className="grid gap-1.5 text-sm">
                <span className="text-muted">Nota general (opcional)</span>
                <textarea
                  rows={2}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ej.: alérgico al gluten, todo junto..."
                  className="py-2 min-h-0 resize-none"
                />
              </label>
            </>
          )}

          {orderError && (
            <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm">
              {orderError}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="shrink-0 border-t border-line p-4 bg-panel">
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-muted">Total</span>
              <strong className="text-xl">{formatMoney(cartTotal)}</strong>
            </div>
            <button
              className="w-full"
              disabled={submitting}
              onClick={handleOrder}
            >
              {submitting ? 'Enviando...' : 'Confirmar pedido'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Browse ───────────────────────────────────────────────────────────
  return (
    <div className="h-dvh bg-bg flex flex-col max-w-lg mx-auto">
      <header className="shrink-0 px-4 pt-4 pb-0 border-b border-line bg-panel">
        <div className="flex items-center justify-between mb-3">
          <div>
            <strong className="block text-accent text-base">Callejón Güemes</strong>
            <span className="text-muted text-xs">Pedí desde tu mesa</span>
          </div>
          <span className="bg-accent/20 text-accent text-xs font-bold px-3 py-1.5 rounded-full">
            Mesa {tableNum}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3">
          {menu.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`shrink-0 px-3 py-1.5 min-h-0 text-xs font-bold rounded-full transition-colors ${
                selectedCat === cat.id
                  ? 'bg-accent text-[#1a120b]'
                  : 'btn-ghost'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 grid gap-3 content-start">
        {currentProducts.length === 0 ? (
          <div className="empty">Sin productos en esta categoría.</div>
        ) : (
          currentProducts.map(product => {
            const qty = getQty(product.id)
            return (
              <div
                key={product.id}
                className={`card flex items-center gap-3 ${!product.available ? 'opacity-50' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="m-0 font-semibold text-sm leading-snug">{product.name}</p>
                  <p className="m-0 text-accent font-bold text-base mt-1">{formatMoney(product.price)}</p>
                  {!product.available && (
                    <p className="m-0 text-xs text-danger mt-0.5">Sin stock</p>
                  )}
                </div>

                {product.available && (
                  qty === 0 ? (
                    <button
                      className="shrink-0 px-4 min-h-0 py-2 text-sm"
                      onClick={() => addToCart(product)}
                    >
                      Agregar
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        className="btn-ghost min-h-0 w-9 h-9 p-0 flex items-center justify-center text-xl font-bold"
                        onClick={() => removeFromCart(product.id)}
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{qty}</span>
                      <button
                        className="min-h-0 w-9 h-9 p-0 flex items-center justify-center text-xl font-bold"
                        onClick={() => addToCart(product)}
                      >
                        +
                      </button>
                    </div>
                  )
                )}
              </div>
            )
          })
        )}
      </div>

      {cartCount > 0 && (
        <div className="shrink-0 p-3 border-t border-line bg-panel">
          <button
            className="w-full flex items-center justify-between px-5"
            onClick={() => setView('cart')}
          >
            <span
              className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
              style={{ background: 'rgba(0,0,0,.3)', color: '#1a120b' }}
            >
              {cartCount}
            </span>
            <span>Ver pedido</span>
            <span className="text-sm">{formatMoney(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
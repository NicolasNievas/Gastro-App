import { useState, useEffect, useMemo } from 'react'
import { getProducts } from '../../api/products'
import { getCategories } from '../../api/categories'
import { createOrder } from '../../api/orders'
import { formatMoney } from '../../utils/format'
import type { TableDto, ProductDto, CategoryDto, DraftItem } from '../../types'
import styles from './NewOrderModal.module.css'

interface NewOrderModalProps {
  tables: TableDto[]
  initialTableId?: number | null
  onClose: () => void
  onSuccess: () => void
}

function isUnavailable(product: ProductDto): boolean {
  return product.noStock || product.stock === 0 || !product.active
}

export default function NewOrderModal({
  tables,
  initialTableId = null,
  onClose,
  onSuccess,
}: NewOrderModalProps) {
  const [products,   setProducts]   = useState<ProductDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loadingCat, setLoadingCat] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [tableId, setTableId] = useState<number | ''>(initialTableId ?? '')
  const [note,    setNote]    = useState('')
  const [items,   setItems]   = useState<DraftItem[]>([])

  const [error,      setError]      = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Carga inicial de productos y categorías
  useEffect(() => {
    Promise.all([getProducts({ active: true }), getCategories()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data)
        setCategories(catRes.data)
        if (catRes.data.length > 0) setSelectedCategory(catRes.data[0].name)
      })
      .catch(() => setError('No se pudo cargar el catálogo'))
      .finally(() => setLoadingCat(false))
  }, [])

  const productsByCategory = useMemo(
    () => products.filter(p => p.category.name === selectedCategory),
    [products, selectedCategory]
  )

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const addProduct = (product: ProductDto) => {
    if (isUnavailable(product)) {
      setError(`${product.name} no tiene stock disponible`)
      return
    }
    setError('')
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        if (existing.quantity + 1 > product.stock) {
          setError(`No hay stock suficiente de ${product.name}`)
          return prev
        }
        return prev.map(i =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          sector: product.sector,
          quantity: 1,
          notes: '',
        },
      ]
    })
  }

  const updateQuantity = (productId: number, quantity: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a cero')
      return
    }
    if (quantity > product.stock) {
      setError(`No hay stock suficiente de ${product.name}`)
      return
    }
    setError('')
    setItems(prev => prev.map(i => (i.productId === productId ? { ...i, quantity } : i)))
  }

  const updateNotes = (productId: number, notes: string) => {
    setItems(prev => prev.map(i => (i.productId === productId ? { ...i, notes } : i)))
  }

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const handleSubmit = async () => {
    if (!tableId) {
      setError('Seleccioná una mesa antes de enviar la comanda')
      return
    }
    if (items.length === 0) {
      setError('Agregá al menos un producto')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await createOrder({
        tableId,
        note: note.trim() || null,
        items: items.map(({ productId, quantity, notes }) => ({ productId, quantity, notes })),
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'No se pudo enviar la comanda')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Nueva comanda</h2>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </header>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.content}>
          {/* ── Columna izquierda: selección de productos ──────────── */}
          <section className={styles.left}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Mesa</span>
                <select
                  value={tableId}
                  onChange={e => setTableId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Seleccionar mesa</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      Mesa {t.number} — {t.stateLabel}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Observaciones generales</span>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ej.: sale todo junto, cliente apurado"
                />
              </label>
            </div>

            {loadingCat ? (
              <p className={styles.loading}>Cargando catálogo...</p>
            ) : (
              <>
                <div className={styles.tabs}>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={cat.name === selectedCategory ? styles.tabActive : 'btn-ghost'}
                      onClick={() => setSelectedCategory(cat.name)}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className={styles.productList}>
                  {productsByCategory.map(product => (
                    <div key={product.id} className={styles.productRow}>
                      <div>
                        <strong>{product.name}</strong>
                        <div className={styles.meta}>
                          <span>{formatMoney(product.price)}</span>
                          <span>{product.sector === 'COCINA' ? 'Cocina' : 'Barra'}</span>
                          <span>
                            {product.noStock || product.stock === 0
                              ? 'Sin stock'
                              : `Stock: ${product.stock}`}
                          </span>
                        </div>
                      </div>
                      <button
                        disabled={isUnavailable(product)}
                        onClick={() => addProduct(product)}
                      >
                        Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ── Columna derecha: comanda actual ─────────────────────── */}
          <aside className={`card ${styles.right}`}>
            <h3>Comanda actual</h3>
            <div className={styles.draftList}>
              {items.length === 0 ? (
                <div className="empty">Agregá productos para armar la comanda.</div>
              ) : (
                items.map(item => (
                  <div key={item.productId} className={styles.draftItem}>
                    <div>
                      <strong>{item.productName}</strong>
                      <div className={styles.meta}>
                        <span>{formatMoney(item.price)}</span>
                        <span>{item.sector === 'COCINA' ? 'Cocina' : 'Barra'}</span>
                      </div>
                    </div>
                    <div className={styles.draftControls}>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => updateQuantity(item.productId, Number(e.target.value))}
                      />
                      <input
                        type="text"
                        placeholder="Observación"
                        value={item.notes}
                        onChange={e => updateNotes(item.productId, e.target.value)}
                      />
                      <button className="btn-ghost" onClick={() => removeItem(item.productId)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.totalBox}>
              <span>Total</span>
              <strong>{formatMoney(total)}</strong>
            </div>

            <div className={styles.actions}>
              <button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar comanda'}
              </button>
              <button className="btn-ghost" onClick={() => setItems([])} disabled={submitting}>
                Limpiar
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect, type FormEvent } from 'react'
import { createProduct, updateProduct } from '../../api/products'
import type { ProductDto, ProductRequest, CategoryDto, Sector } from '../../types'

interface ProductFormModalProps {
  mode: 'create' | 'edit'
  product?: ProductDto | null
  categories: CategoryDto[]
  onClose: () => void
  onSuccess: () => void
}

const SECTORS: { value: Sector; label: string }[] = [
  { value: 'COCINA', label: 'Cocina' },
  { value: 'BARRA',  label: 'Barra' },
  { value: 'AMBOS',  label: 'Ambos' },
]

export default function ProductFormModal({
  mode, product, categories, onClose, onSuccess,
}: ProductFormModalProps) {
  const [name, setName]           = useState('')
  const [price, setPrice]         = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [sector, setSector]       = useState<Sector>('COCINA')
  const [stock, setStock]         = useState('')
  const [lowStock, setLowStock]   = useState('10')
  const [active, setActive]       = useState(true)
  const [noStock, setNoStock]     = useState(false)

  const [error, setError]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && product) {
      setName(product.name)
      setPrice(String(product.price))
      setCategoryId(product.category.id)
      setSector(product.sector)
      setStock(String(product.stock))
      setLowStock(String(product.lowStock))
      setActive(product.active)
      setNoStock(product.noStock)
    }
  }, [mode, product])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) return setError('El nombre es obligatorio')
    if (!categoryId)  return setError('Seleccioná una categoría')
    const priceNum = Number(price)
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError('El precio debe ser mayor a 0')
    const stockNum = Number(stock)
    if (!Number.isFinite(stockNum) || stockNum < 0) return setError('El stock no puede ser negativo')
    const lowStockNum = Number(lowStock)
    if (!Number.isFinite(lowStockNum) || lowStockNum < 0) return setError('El umbral de stock bajo no puede ser negativo')

    const payload: ProductRequest = {
      name: name.trim(),
      price: priceNum,
      categoryId: categoryId as number,
      sector,
      stock: stockNum,
      lowStock: lowStockNum,
      noStock,
      active,
    }

    setSubmitting(true)
    try {
      if (mode === 'create') {
        await createProduct(payload)
      } else if (product) {
        await updateProduct(product.id, payload)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'No se pudo guardar el producto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-100" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-panel border border-line rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="m-0 text-lg font-bold">
            {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
          </h2>
          <button className="btn-ghost px-3 py-2 min-h-0" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-3 py-2 text-sm">{error}</div>
          )}

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">Nombre</span>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">Precio</span>
              <input type="number" min={1} step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">Categoría</span>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')} required>
                <option value="">Seleccionar</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">Sector</span>
              <select value={sector} onChange={e => setSector(e.target.value as Sector)}>
                {SECTORS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">Stock inicial</span>
              <input type="number" min={0} value={stock} onChange={e => setStock(e.target.value)} required />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">Alerta de stock bajo</span>
              <input type="number" min={0} value={lowStock} onChange={e => setLowStock(e.target.value)} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-muted">Disponibilidad</span>
              <select value={noStock ? 'true' : 'false'} onChange={e => setNoStock(e.target.value === 'true')}>
                <option value="false">Disponible</option>
                <option value="true">Sin stock</option>
              </select>
            </label>
          </div>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">Estado</span>
            <select value={active ? 'true' : 'false'} onChange={e => setActive(e.target.value === 'true')}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </label>

          <div className="flex gap-3 mt-2">
            <button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn-ghost flex-1" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
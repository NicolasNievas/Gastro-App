import { useState, type FormEvent } from 'react'
import { restockProduct } from '../../api/stock'
import type { StockStatusDto } from '../../types'

interface RestockModalProps {
  product: StockStatusDto
  onClose: () => void
  onSuccess: () => void
}

export default function RestockModal({ product, onClose, onSuccess }: RestockModalProps) {
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes]       = useState('')
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty < 1) {
      setError('La cantidad debe ser al menos 1')
      return
    }

    setSubmitting(true)
    try {
      await restockProduct(product.productId, { quantity: qty, notes: notes.trim() || undefined })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'No se pudo reponer el stock')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-100" onClick={onClose}>
      <div className="w-full max-w-sm bg-panel border border-line rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="m-0 text-lg font-bold">Reponer stock</h2>
          <button className="btn-ghost px-3 py-2 min-h-0" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <p className="m-0 text-sm text-muted">
            {product.productName} — stock actual: <strong className="text-text">{product.stock}</strong>
          </p>

          {error && (
            <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-3 py-2 text-sm">{error}</div>
          )}

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">Cantidad a reponer</span>
            <input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} autoFocus required />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">Notas (opcional)</span>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej.: pedido a proveedor #45" />
          </label>

          <div className="flex gap-3 mt-2">
            <button type="submit" className="flex-1 bg-ok" style={{ color: '#07140a' }} disabled={submitting}>
              {submitting ? 'Guardando...' : 'Confirmar reposición'}
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
import { useState, type FormEvent } from 'react'
import { adjustStock } from '../../api/stock'
import type { StockStatusDto, StockMovementReason } from '../../types'

interface AdjustStockModalProps {
  product: StockStatusDto
  onClose: () => void
  onSuccess: () => void
}

const REASONS: { value: StockMovementReason; label: string }[] = [
  { value: 'MANUAL_ADJUSTMENT', label: 'Ajuste manual' },
  { value: 'WASTE',             label: 'Merma / descarte' },
]

export default function AdjustStockModal({ product, onClose, onSuccess }: AdjustStockModalProps) {
  const [direction, setDirection] = useState<'add' | 'remove'>('remove')
  const [quantity, setQuantity]   = useState('')
  const [reason, setReason]       = useState<StockMovementReason>('WASTE')
  const [notes, setNotes]         = useState('')
  const [error, setError]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }

    const signedQty = direction === 'add' ? qty : -qty

    setSubmitting(true)
    try {
      await adjustStock(product.productId, { quantity: signedQty, reason, notes: notes.trim() || undefined })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'No se pudo ajustar el stock')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-100" onClick={onClose}>
      <div className="w-full max-w-sm bg-panel border border-line rounded-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="m-0 text-lg font-bold">Ajustar stock</h2>
          <button className="btn-ghost px-3 py-2 min-h-0" onClick={onClose}>✕</button>
        </header>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <p className="m-0 text-sm text-muted">
            {product.productName} — stock actual: <strong className="text-text">{product.stock}</strong>
          </p>

          {error && (
            <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-3 py-2 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={direction === 'remove' ? 'bg-danger' : 'btn-ghost'}
              style={direction === 'remove' ? { color: '#fff' } : undefined}
              onClick={() => setDirection('remove')}
            >
              Restar
            </button>
            <button
              type="button"
              className={direction === 'add' ? 'bg-ok' : 'btn-ghost'}
              style={direction === 'add' ? { color: '#07140a' } : undefined}
              onClick={() => setDirection('add')}
            >
              Sumar
            </button>
          </div>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">Cantidad</span>
            <input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} autoFocus required />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">Motivo</span>
            <select value={reason} onChange={e => setReason(e.target.value as StockMovementReason)}>
              {REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">Notas (opcional)</span>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej.: se cayó la fuente" />
          </label>

          <div className="flex gap-3 mt-2">
            <button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Confirmar ajuste'}
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
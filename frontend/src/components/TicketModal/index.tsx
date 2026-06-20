import { useState, useEffect } from 'react'
import { getPayment } from '../../api/cashier'
import { formatMoney } from '../../utils/format'
import type { PaymentResponseDto } from '../../types'

interface TicketModalProps {
  paymentId: number
  onClose: () => void
}

const METHOD_LABELS: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
  TRANSFERENCIA: 'Transferencia',
  MERCADO_PAGO: 'Mercado Pago',
}

export default function TicketModal({ paymentId, onClose }: TicketModalProps) {
  const [payment, setPayment] = useState<PaymentResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    getPayment(paymentId)
      .then(r => setPayment(r.data))
      .catch(() => setError('No se pudo cargar el ticket'))
      .finally(() => setLoading(false))
  }, [paymentId])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-100" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-panel border border-line rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="m-0 text-lg font-bold">Ticket</h2>
          <button className="btn-ghost px-3 py-2 min-h-0" onClick={onClose}>✕</button>
        </header>

        <div className="p-5">
          {loading && <p className="text-muted">Cargando...</p>}
          {error && <p className="text-danger">{error}</p>}

          {payment && (
            <div className="flex flex-col gap-3">
              <div className="text-center border-b border-dashed border-line pb-3">
                <h3 className="m-0 text-xl font-bold">Callejón Güemes</h3>
                <p className="m-0 text-sm text-muted">Comprobante interno — no válido como factura</p>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted">Mesa</span><strong>{payment.tableNumber}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Fecha</span>
                <strong>{new Date(payment.createdAt).toLocaleString('es-AR')}</strong>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Método de pago</span>
                <strong>{METHOD_LABELS[payment.method] ?? payment.method}</strong>
              </div>
              {payment.notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Notas</span><span>{payment.notes}</span>
                </div>
              )}

              <ul className="m-0 pl-0 list-none grid gap-1.5 border-t border-line pt-3">
                {payment.items.map(item => (
                  <li key={item.productId} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>{formatMoney(item.subtotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="grid gap-1.5 border-t border-line pt-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(payment.subtotal)}</span></div>
                {payment.discount > 0 && (
                  <div className="flex justify-between"><span>Descuento</span><span>-{formatMoney(payment.discount)}</span></div>
                )}
                {payment.surcharge > 0 && (
                  <div className="flex justify-between"><span>Recargo</span><span>{formatMoney(payment.surcharge)}</span></div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-line pt-2">
                  <span>Total cobrado</span><span>{formatMoney(payment.amount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
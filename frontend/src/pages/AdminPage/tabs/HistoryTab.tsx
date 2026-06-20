import { useState, useEffect, useCallback } from 'react'
import { getHistory } from '../../../api/cashier'
import { formatMoney } from '../../../utils/format'
import TicketModal from '../../../components/TicketModal'
import type { PaymentSummaryDto, PaymentMethod } from '../../../types'

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'EFECTIVO',      label: 'Efectivo' },
  { value: 'DEBITO',        label: 'Débito' },
  { value: 'CREDITO',       label: 'Crédito' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'MERCADO_PAGO',  label: 'Mercado Pago' },
]

export default function HistoryTab() {
  const [payments, setPayments] = useState<PaymentSummaryDto[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const [tableFilter, setTableFilter]   = useState('')
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('')

  const [ticketId, setTicketId] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getHistory({
      tableNumber: tableFilter ? Number(tableFilter) : undefined,
      method: methodFilter || undefined,
    })
      .then(r => setPayments(r.data))
      .catch(() => setError('No se pudo cargar el historial'))
      .finally(() => setLoading(false))
  }, [tableFilter, methodFilter])

  useEffect(() => { load() }, [load])

  const totalVendido = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <div className="card flex-1 min-w-[160px]">
          <span className="text-sm text-muted">Ventas</span>
          <strong className="block text-2xl mt-1">{payments.length}</strong>
        </div>
        <div className="card flex-1 min-w-[160px]">
          <span className="text-sm text-muted">Total vendido</span>
          <strong className="block text-2xl mt-1 text-ok">{formatMoney(totalVendido)}</strong>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          placeholder="Filtrar por mesa..."
          value={tableFilter}
          onChange={e => setTableFilter(e.target.value)}
          className="max-w-[180px]"
        />
        <select
          value={methodFilter}
          onChange={e => setMethodFilter(e.target.value as PaymentMethod | '')}
          className="max-w-xs"
        >
          <option value="">Todos los métodos</option>
          {METHODS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-muted">Cargando historial...</p>
      ) : payments.length === 0 ? (
        <div className="empty">No hay ventas para esos filtros.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-muted text-left">
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Mesa</th>
                <th className="px-4 py-3 font-semibold">Método</th>
                <th className="px-4 py-3 font-semibold">Ítems</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 text-muted">
                    {new Date(p.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-medium">Mesa {p.tableNumber}</td>
                  <td className="px-4 py-3">{METHODS.find(m => m.value === p.method)?.label}</td>
                  <td className="px-4 py-3 text-muted">{p.itemCount}</td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(p.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-ghost px-3 py-2 min-h-0 text-xs" onClick={() => setTicketId(p.id)}>
                      Ver ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ticketId && (
        <TicketModal paymentId={ticketId} onClose={() => setTicketId(null)} />
      )}
    </div>
  )
}
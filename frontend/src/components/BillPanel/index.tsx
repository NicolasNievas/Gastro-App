import { useState, useEffect } from 'react'
import { getBill, closeTable } from '../../api/cashier'
import { adjustTable } from '../../api/tables'
import { formatMoney } from '../../utils/format'
import { TABLE_STATE_PILL } from '../../utils/stateStyles'
import type { BillResponseDto, PaymentResponseDto, PaymentMethod } from '../../types'

interface BillPanelProps {
  tableId: number
  onClosed: () => void
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'EFECTIVO',      label: 'Efectivo' },
  { value: 'DEBITO',        label: 'Débito' },
  { value: 'CREDITO',       label: 'Crédito' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'MERCADO_PAGO',  label: 'Mercado Pago' },
]

export default function BillPanel({ tableId, onClosed }: BillPanelProps) {
  const [bill, setBill]       = useState<BillResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [discount, setDiscount]   = useState(0)
  const [surcharge, setSurcharge] = useState(0)
  const [persons, setPersons]     = useState(1)
  const [method, setMethod]       = useState<PaymentMethod | ''>('')
  const [notes, setNotes]         = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt]       = useState<PaymentResponseDto | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    setReceipt(null)
    setMethod('')
    setNotes('')
    setPersons(1)

    getBill(tableId)
      .then(r => {
        setBill(r.data)
        setDiscount(r.data.discount)
        setSurcharge(r.data.surcharge)
      })
      .catch(() => setError('No se pudo cargar la cuenta de la mesa'))
      .finally(() => setLoading(false))
  }, [tableId])

  if (loading) return <div className="card text-muted">Cargando cuenta...</div>
  if (error)   return <div className="card text-danger">{error}</div>
  if (!bill)   return null

  const total     = Math.max(0, bill.subtotal - discount + surcharge)
  const perPerson = total / Math.max(1, persons)
  const canCharge = bill.tableState === 'PARA_COBRAR'

  const handleAdjustmentBlur = async () => {
    try {
      await adjustTable(tableId, { discount, surcharge })
    } catch {
      setError('No se pudo guardar el descuento/recargo')
    }
  }

  const handleSubmit = async () => {
    if (!method) {
      setError('Seleccioná un método de pago')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      // Aseguramos que el ajuste esté persistido antes de cobrar
      await adjustTable(tableId, { discount, surcharge })
      const res = await closeTable(tableId, { paymentMethod: method, notes: notes.trim() || undefined })
      setReceipt(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'No se pudo cerrar la cuenta')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Ticket post-cobro ────────────────────────────────────────────
  if (receipt) {
    return (
      <div className="card flex flex-col gap-3">
        <div className="text-center border-b border-dashed border-line pb-3">
          <h2 className="m-0 text-xl font-bold">Callejón Güemes</h2>
          <p className="m-0 text-sm text-muted">Comprobante interno — no válido como factura</p>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted">Mesa</span>
          <strong>{receipt.tableNumber}</strong>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Método de pago</span>
          <strong>{PAYMENT_METHODS.find(m => m.value === receipt.method)?.label}</strong>
        </div>

        <ul className="m-0 pl-0 list-none grid gap-1.5 border-t border-line pt-3">
          {receipt.items.map(item => (
            <li key={item.productId} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.productName}</span>
              <span>{formatMoney(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="grid gap-1.5 border-t border-line pt-3 text-sm">
          {receipt.discount > 0 && (
            <div className="flex justify-between"><span>Descuento</span><span>-{formatMoney(receipt.discount)}</span></div>
          )}
          {receipt.surcharge > 0 && (
            <div className="flex justify-between"><span>Recargo</span><span>{formatMoney(receipt.surcharge)}</span></div>
          )}
          <div className="flex justify-between text-lg font-bold border-t border-line pt-2">
            <span>Total cobrado</span><span>{formatMoney(receipt.amount)}</span>
          </div>
        </div>

        <button className="btn-primary mt-2" onClick={onClosed}>
          Cobrar otra mesa
        </button>
      </div>
    )
  }

  // ── Cuenta editable ───────────────────────────────────────────────
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-xl font-bold">Cuenta Mesa {bill.tableNumber}</h2>
        <span className={`pill ${TABLE_STATE_PILL[bill.tableState] ?? ''}`}>{bill.tableStateLabel}</span>
      </div>

      {error && (
        <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-3 py-2 text-sm">{error}</div>
      )}

      <ul className="m-0 pl-0 list-none grid gap-2 max-h-60 overflow-y-auto">
        {bill.items.map(item => (
          <li key={item.productId} className="flex justify-between text-sm border-b border-line/60 pb-2">
            <span>{item.quantity}x {item.productName}</span>
            <span>{formatMoney(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Descuento</span>
          <input
            type="number" min={0} value={discount}
            onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
            onBlur={handleAdjustmentBlur}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Recargo</span>
          <input
            type="number" min={0} value={surcharge}
            onChange={e => setSurcharge(Math.max(0, Number(e.target.value)))}
            onBlur={handleAdjustmentBlur}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Dividir entre</span>
          <input
            type="number" min={1} value={persons}
            onChange={e => setPersons(Math.max(1, Number(e.target.value)))}
          />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-muted">Método de pago</span>
          <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)}>
            <option value="">Seleccionar</option>
            {PAYMENT_METHODS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5 text-sm">
        <span className="text-muted">Notas (opcional)</span>
        <input
          type="text" value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Ej.: pagó con dos billetes"
        />
      </label>

      <div className="grid gap-1.5 border-t border-line pt-3 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(bill.subtotal)}</span></div>
        <div className="flex justify-between"><span>Descuento</span><span>-{formatMoney(discount)}</span></div>
        <div className="flex justify-between"><span>Recargo</span><span>{formatMoney(surcharge)}</span></div>
        <div className="flex justify-between text-lg font-bold border-t border-line pt-2">
          <span>Total final</span><span>{formatMoney(total)}</span>
        </div>
        {persons > 1 && (
          <div className="flex justify-between text-muted">
            <span>Por persona</span><span>{formatMoney(perPerson)}</span>
          </div>
        )}
      </div>

      {!canCharge && (
        <p className="text-sm text-warn m-0">
            La mesa todavía tiene pedidos sin entregar. Esperá a que pase a "Para cobrar".
        </p>
        )}

        <button className="btn-primary" disabled={submitting || !canCharge} onClick={handleSubmit}>
        {submitting ? 'Cobrando...' : 'Cobrar, generar ticket y cerrar mesa'}
        </button>
    </div>
  )
}
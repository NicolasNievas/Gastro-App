import { formatTime } from '../../utils/format'
import type { SectorOrderDto, SectorOrderStatus } from '../../types'

interface SectorOrderCardProps {
  order: SectorOrderDto
  onUpdateStatus: (id: number, status: SectorOrderStatus) => void
  updating: boolean
}

const SEQUENCE: SectorOrderStatus[] = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO']

const NEXT_ACTION: Record<SectorOrderStatus, { label: string; className: string } | null> = {
  PENDIENTE:      { label: 'Empezar a preparar', className: 'bg-info' },
  EN_PREPARACION: { label: 'Marcar listo',        className: 'bg-ok' },
  LISTO:          { label: 'Marcar entregado',    className: 'bg-accent' },
  ENTREGADO:      null,
}

const PILL_CLASS: Record<SectorOrderStatus, string> = {
  PENDIENTE:      'bg-warn/20 text-warn',
  EN_PREPARACION: 'bg-info/20 text-info',
  LISTO:          'bg-ok/20 text-ok',
  ENTREGADO:      'bg-muted/20 text-muted',
}

export default function SectorOrderCard({ order, onUpdateStatus, updating }: SectorOrderCardProps) {
  const currentIndex = SEQUENCE.indexOf(order.status)
  const nextStatus    = SEQUENCE[currentIndex + 1] as SectorOrderStatus | undefined
  const prevStatus    = currentIndex > 0 ? SEQUENCE[currentIndex - 1] : undefined
  const nextAction    = NEXT_ACTION[order.status]
  const isReady       = order.status === 'LISTO'

  return (
    <article className={`card flex flex-col gap-3 ${isReady ? 'ring-1 ring-ok/60 border-ok/60' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-lg font-bold">Mesa {order.tableNumber}</h3>
        <span className={`pill ${PILL_CLASS[order.status]}`}>{order.statusLabel}</span>
      </div>

      <span className="text-sm text-muted">{formatTime(order.createdAt)}</span>

      <ul className="m-0 pl-4 grid gap-1.5">
        {order.items.map(item => (
          <li key={item.id}>
            <strong>{item.quantity}x</strong> {item.productName}
            {item.notes && <span className="block text-sm text-muted">{item.notes}</span>}
          </li>
        ))}
      </ul>

      {order.orderNote && (
        <p className="m-0 text-sm italic text-muted">Obs. general: {order.orderNote}</p>
      )}

      <div className="flex items-center gap-2 mt-1">
        {prevStatus && (
          <button
            className="btn-ghost text-sm px-3 min-h-0 py-2"
            disabled={updating}
            onClick={() => onUpdateStatus(order.id, prevStatus)}
          >
            ← Deshacer
          </button>
        )}
        {nextAction && (
          <button
            className={`flex-1 ${nextAction.className}`}
            style={{ color: '#1a120b' }}
            disabled={updating}
            onClick={() => onUpdateStatus(order.id, nextStatus!)}
          >
            {updating ? 'Actualizando...' : nextAction.label}
          </button>
        )}
      </div>
    </article>
  )
}
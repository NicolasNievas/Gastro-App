import { formatTime } from '../../utils/format'
import type { SectorOrderDto, SectorOrderStatus } from '../../types'
import styles from './SectorOrderCard.module.css'

interface SectorOrderCardProps {
  order: SectorOrderDto
  onUpdateStatus: (id: number, status: SectorOrderStatus) => void
  updating: boolean
}

const STATUS_OPTIONS: { value: SectorOrderStatus; label: string; className: string }[] = [
  { value: 'PENDIENTE',      label: 'Tomar pedido',    className: 'btn-ghost' },
  { value: 'EN_PREPARACION', label: 'En preparación',  className: 'info' },
  { value: 'LISTO',          label: 'Listo',           className: 'warn' },
  { value: 'ENTREGADO',      label: 'Entregado',       className: 'success' },
]

const PILL_CLASS: Record<SectorOrderStatus, string> = {
  PENDIENTE:      styles.pendiente,
  EN_PREPARACION: styles.enPrep,
  LISTO:          styles.listo,
  ENTREGADO:      styles.entregado,
}

export default function SectorOrderCard({ order, onUpdateStatus, updating }: SectorOrderCardProps) {
  const isReady = order.status === 'LISTO'

  return (
    <article className={`card ${styles.card} ${isReady ? styles.ready : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.tableNumber}>Mesa {order.tableNumber}</h3>
        <span className={`${styles.pill} ${PILL_CLASS[order.status]}`}>{order.statusLabel}</span>
      </div>

      <div className={styles.meta}>
        <span>{formatTime(order.createdAt)}</span>
      </div>

      <ul className={styles.items}>
        {order.items.map(item => (
          <li key={item.id}>
            <strong>{item.quantity}x</strong> {item.productName}
            {item.notes && <span className={styles.itemNote}><br />{item.notes}</span>}
          </li>
        ))}
      </ul>

      {order.orderNote && (
        <p className={styles.generalNote}>Obs. general: {order.orderNote}</p>
      )}

      <div className={styles.actions}>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={opt.className === 'btn-ghost' ? 'btn-ghost' : styles[opt.className]}
            disabled={updating || order.status === opt.value}
            onClick={() => onUpdateStatus(order.id, opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </article>
  )
}
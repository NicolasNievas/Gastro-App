import { useState, useEffect, useCallback } from 'react'
import { getActiveSectorOrders, updateSectorStatus } from '../../api/orders'
import { useWebSocket } from '../../hooks/useWebSocket'
import SectorOrderCard from '../SectorOrderCard'
import type { SectorOrderDto, SectorOrderStatus, Sector, WsEvent } from '../../types'
import styles from './KDSBoard.module.css'

interface KDSBoardProps {
  sector: Sector
  title: string
}

export default function KDSBoard({ sector, title }: KDSBoardProps) {
  const [orders,  setOrders]  = useState<SectorOrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const loadOrders = useCallback(() => {
    getActiveSectorOrders(sector as 'COCINA' | 'BARRA')
      .then(r => setOrders(r.data))
      .catch(() => setError('No se pudieron cargar los pedidos'))
      .finally(() => setLoading(false))
  }, [sector])

  useEffect(() => { loadOrders() }, [loadOrders])

  // ── Tiempo real ────────────────────────────────────────────────────
  useWebSocket<SectorOrderDto>('/topic/orders', (event: WsEvent<SectorOrderDto>) => {
    const payload = event.payload
    if (payload.sector !== sector) return // evento de otro sector, ignorar

    if (event.type === 'ORDER_CREATED') {
      setOrders(prev => [...prev, payload])
    }

    if (event.type === 'SECTOR_STATUS_UPDATED') {
      setOrders(prev => {
        if (payload.status === 'ENTREGADO') {
          // ya no es "activo" — se saca de la pantalla
          return prev.filter(o => o.id !== payload.id)
        }
        return prev.map(o => (o.id === payload.id ? payload : o))
      })
    }
  })

  const handleUpdateStatus = async (id: number, status: SectorOrderStatus) => {
    setUpdatingId(id)
    setError('')
    try {
      await updateSectorStatus(id, status)
      // El propio WS actualiza el estado — no hace falta tocar el state acá
    } catch {
      setError('No se pudo actualizar el estado del pedido')
    } finally {
      setUpdatingId(null)
    }
  }

  const sorted = [...orders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>{title}</h1>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <p className={styles.loading}>Cargando pedidos...</p>
      ) : sorted.length === 0 ? (
        <div className="empty">No hay pedidos activos para {title.toLowerCase()}.</div>
      ) : (
        <div className={styles.grid}>
          {sorted.map(order => (
            <SectorOrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              updating={updatingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
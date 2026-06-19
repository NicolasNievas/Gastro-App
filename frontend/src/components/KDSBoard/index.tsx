import { useState, useEffect, useCallback } from 'react'
import { getActiveSectorOrders, updateSectorStatus } from '../../api/orders'
import { useWebSocket } from '../../hooks/useWebSocket'
import SectorOrderCard from '../SectorOrderCard'
import type { SectorOrderDto, SectorOrderStatus, Sector, WsEvent } from '../../types'

interface KDSBoardProps {
  sector: Sector
  title: string
}

export default function KDSBoard({ sector, title }: KDSBoardProps) {
  const [orders, setOrders]   = useState<SectorOrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const loadOrders = useCallback(() => {
    getActiveSectorOrders(sector as 'COCINA' | 'BARRA')
      .then(r => setOrders(r.data))
      .catch(() => setError('No se pudieron cargar los pedidos'))
      .finally(() => setLoading(false))
  }, [sector])

  useEffect(() => { loadOrders() }, [loadOrders])

  useWebSocket<SectorOrderDto>('/topic/orders', (event: WsEvent<SectorOrderDto>) => {
    const payload = event.payload
    if (payload.sector !== sector) return

    if (event.type === 'ORDER_CREATED') {
      setOrders(prev => [...prev, payload])
    }
    if (event.type === 'SECTOR_STATUS_UPDATED') {
      setOrders(prev => {
        if (payload.status === 'ENTREGADO') return prev.filter(o => o.id !== payload.id)
        const exists = prev.some(o => o.id === payload.id)
        return exists ? prev.map(o => (o.id === payload.id ? payload : o)) : [...prev, payload]
      })
    }
  })

  const handleUpdateStatus = async (id: number, status: SectorOrderStatus) => {
    setUpdatingId(id)
    setError('')
    try {
      await updateSectorStatus(id, status)
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
    <div className="p-6 max-w-[1400px] mx-auto">
      <h1 className="m-0 mb-5 text-3xl font-bold">{title}</h1>

      {error && (
        <div className="mb-4 rounded-lg border-l-4 border-danger bg-danger/10 px-4 py-3">{error}</div>
      )}

      {loading ? (
        <p className="text-muted">Cargando pedidos...</p>
      ) : sorted.length === 0 ? (
        <div className="empty">No hay pedidos activos para {title.toLowerCase()}.</div>
      ) : (
        <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
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
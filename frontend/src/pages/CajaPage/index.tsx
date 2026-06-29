import { useState, useEffect, useCallback, useRef } from 'react'
import { getOpenTables } from '../../api/tables'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useAuth } from '../../contexts/AuthContext'
import BillPanel from '../../components/BillPanel'
import { TABLE_STATE_PILL } from '../../utils/stateStyles'
import type { TableDto, WsEvent } from '../../types'

export default function CajaPage() {
  const { user } = useAuth()
  const [tables, setTables]         = useState<TableDto[]>([])
  const [loading, setLoading]       = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mpAutoClose, setMpAutoClose] = useState(false)

  const selectedIdRef = useRef<number | null>(null)
  selectedIdRef.current = selectedId

  // Reset al cambiar de mesa
  useEffect(() => { setMpAutoClose(false) }, [selectedId])

  const loadTables = useCallback(() => {
    getOpenTables()
      .then(r => setTables(r.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadTables() }, [loadTables])

  useWebSocket<TableDto>('/topic/tables', (event: WsEvent<TableDto>) => {
    if (event.type !== 'TABLE_UPDATED') return
    const updated = event.payload

    setTables(prev => {
      if (updated.state === 'LIBRE') return prev.filter(t => t.id !== updated.id)
      const exists = prev.some(t => t.id === updated.id)
      return exists
        ? prev.map(t => (t.id === updated.id ? updated : t))
        : [...prev, updated]
    })

    // Si la mesa seleccionada fue cerrada por MP → notificar al BillPanel
    if (updated.state === 'LIBRE' && updated.id === selectedIdRef.current) {
      setMpAutoClose(true)
    }
  })

  const handleClosed = () => {
    setSelectedId(null)
    setMpAutoClose(false)
    loadTables()
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="m-0 text-sm text-muted">Rol: {user?.username}</p>
          <h1 className="m-0 text-3xl font-bold">Caja</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 items-start">
        <section>
          <h2 className="text-lg font-bold mb-3">Mesas abiertas ({tables.length})</h2>
          {loading ? (
            <p className="text-muted">Cargando mesas...</p>
          ) : tables.length === 0 ? (
            <div className="empty">No hay mesas abiertas.</div>
          ) : (
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedId(table.id)}
                  className={`card text-left ${
                    selectedId === table.id ? 'ring-1 ring-accent border-accent' : ''
                  }`}
                  style={{ background: 'rgba(33,28,25,.94)', color: 'var(--text)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold">Mesa {table.number}</span>
                    <span className={`pill ${TABLE_STATE_PILL[table.state] ?? ''}`}>{table.stateLabel}</span>
                  </div>
                  <p className="m-0 text-sm text-muted">
                    {table.openedAt &&
                      `Abierta ${new Date(table.openedAt).toLocaleTimeString('es-AR', {
                        hour: '2-digit', minute: '2-digit',
                      })}`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-6">
          {selectedId ? (
            <BillPanel
              tableId={selectedId}
              onClosed={handleClosed}
              mpAutoClose={mpAutoClose}
            />
          ) : (
            <div className="empty">Seleccioná una mesa para ver la cuenta.</div>
          )}
        </aside>
      </div>
    </div>
  )
}
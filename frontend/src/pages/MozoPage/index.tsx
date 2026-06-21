import { useState, useEffect } from 'react'
import { getTables } from '../../api/tables'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useAuth } from '../../contexts/AuthContext'
import NewOrderModal from '../../components/NewOrderModal'
import type { TableDto, WsEvent } from '../../types'
import styles from './MozoPage.module.css'

const STATE_CLASS: Record<string, string> = {
  LIBRE:            styles.libre,
  ESPERANDO_PEDIDO: styles.esperando,
  EN_PREPARACION:   styles.enPrep,
  LISTA:            styles.lista,
  PARA_COBRAR:      styles.paraCobrar,
}

export default function MozoPage() {
  const { user } = useAuth()
  const [tables,  setTables]  = useState<TableDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // ── Modal de nueva comanda ────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [preselectedTableId, setPreselectedTableId] = useState<number | null>(null)

  const loadTables = () => {
    getTables()
      .then(r => setTables(r.data))
      .catch(() => setError('No se pudieron cargar las mesas'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadTables() }, [])

  useWebSocket<TableDto>('/topic/tables', (event: WsEvent<TableDto>) => {
    if (event.type === 'TABLE_UPDATED') {
      setTables(prev => prev.map(t => (t.id === event.payload.id ? event.payload : t)))
    }
  })

  const openModal = (tableId: number | null = null) => {
    setPreselectedTableId(tableId)
    setModalOpen(true)
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Rol: {user?.username}</p>
          <h1 className={styles.title}>Mesas del salón</h1>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => openModal(null)}>Nueva comanda</button>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <p className={styles.loading}>Cargando mesas...</p>
      ) : (
        <div className={styles.grid}>
          {tables.map(table => (
            <article
              key={table.id}
              className={`card ${styles.tableCard} ${STATE_CLASS[table.state] ?? ''}`}
              onClick={() => openModal(table.id)}
            >
              <div className={styles.tableHeader}>
                <h2 className={styles.tableNumber}>Mesa {table.number}</h2>
                <span className={styles.pill}>{table.stateLabel}</span>
              </div>
              <p className={styles.tableInfo}>
                {table.openedAt
                  ? `Abierta ${new Date(table.openedAt).toLocaleTimeString('es-AR', {
                      hour: '2-digit', minute: '2-digit',
                    })}`
                  : 'Libre'}
              </p>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <NewOrderModal
          tables={tables}
          initialTableId={preselectedTableId}
          onClose={() => setModalOpen(false)}
          onSuccess={loadTables}
        />
      )}
    </div>
  )
}
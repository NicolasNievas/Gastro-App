import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useWebSocket } from '../../hooks/useWebSocket'
import { getOpenTables } from '../../api/tables'
import { getKdsSummary } from '../../api/orders'
import { getTodaySummary, getOpenTablesSummary } from '../../api/cashier'
import { getStockAlerts } from '../../api/stock'
import { formatMoney } from '../../utils/format'
import { TABLE_STATE_PILL } from '../../utils/stateStyles'
import type { TableDto, KdsSummary, TodaySummary, OpenTableSummary, StockAlertResponse, Role } from '../../types'

interface QuickLink { to: string; label: string; roles: Role[] }

const QUICK_LINKS: QuickLink[] = [
  { to: '/mozo',    label: 'Mesas',     roles: ['ADMIN', 'MOZO'] },
  { to: '/cocina',  label: 'Cocina',    roles: ['ADMIN', 'COCINA'] },
  { to: '/barra',   label: 'Barra',     roles: ['ADMIN', 'BARRA'] },
  { to: '/caja',    label: 'Caja',      roles: ['ADMIN', 'CAJA'] },
  { to: '/stock',   label: 'Stock',     roles: ['ADMIN', 'CAJA'] },
  { to: '/history', label: 'Historial', roles: ['ADMIN', 'CAJA'] },
  { to: '/admin',   label: 'Catálogo',  roles: ['ADMIN'] },
]

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <span className="text-sm text-muted">{label}</span>
      <strong className="block text-2xl mt-1">{value}</strong>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canSeeFinance = user?.role === 'ADMIN' || user?.role === 'CAJA'

  const [openTables, setOpenTables] = useState<TableDto[]>([])
  const [kds, setKds]               = useState<KdsSummary | null>(null)
  const [today, setToday]           = useState<TodaySummary | null>(null)
  const [activity, setActivity]     = useState<OpenTableSummary[]>([])
  const [alerts, setAlerts]         = useState<StockAlertResponse | null>(null)
  const [loading, setLoading]       = useState(true)

  const load = useCallback(() => {
    const calls: Promise<unknown>[] = [
      getOpenTables().then(r => setOpenTables(r.data)),
      getKdsSummary().then(r => setKds(r.data)),
    ]
    if (canSeeFinance) {
      calls.push(getTodaySummary().then(r => setToday(r.data)))
      calls.push(getOpenTablesSummary().then(r => setActivity(r.data)))
      calls.push(getStockAlerts().then(r => setAlerts(r.data)))
    }
    Promise.allSettled(calls).finally(() => setLoading(false))
  }, [canSeeFinance])

  useEffect(() => { load() }, [load])

  // Refresca el dashboard ante cualquier cambio en mesas o pedidos
  useWebSocket<unknown>('/topic/tables', () => load())
  useWebSocket<unknown>('/topic/orders', () => load())

  const quickLinks = QUICK_LINKS.filter(l => user && l.roles.includes(user.role))

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <p className="m-0 text-sm text-muted">Hola, {user?.username}</p>
        <h1 className="m-0 text-3xl font-bold">Dashboard</h1>
      </header>

      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : (
        <>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] mb-6">
            <StatCard label="Mesas abiertas" value={openTables.length} />
            <StatCard label="Pendientes" value={kds?.pendientes ?? 0} />
            <StatCard label="En preparación" value={kds?.enPreparacion ?? 0} />
            <StatCard label="Listos" value={kds?.listos ?? 0} />
            {canSeeFinance && (
              <StatCard label="Vendido hoy" value={formatMoney(today?.totalAmount ?? 0)} />
            )}
          </div>

          {alerts && (alerts.lowStock.length > 0 || alerts.outOfStock.length > 0) && (
            <div className="mb-6 flex flex-col gap-2">
              {alerts.outOfStock.map(p => (
                <div key={p.productId} className="rounded-lg border-l-4 border-danger bg-danger/10 px-4 py-2.5 text-sm">
                  Sin stock: <strong>{p.productName}</strong>
                </div>
              ))}
              {alerts.lowStock.slice(0, 5).map(p => (
                <div key={p.productId} className="rounded-lg border-l-4 border-warn bg-warn/10 px-4 py-2.5 text-sm">
                  Stock bajo: <strong>{p.productName}</strong> tiene {p.stock} unidades.
                </div>
              ))}
            </div>
          )}

          <h2 className="text-lg font-bold mb-3">Accesos rápidos</h2>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] mb-8">
            {quickLinks.map(link => (
              <button
                key={link.to}
                className="card text-left"
                style={{ background: 'rgba(33,28,25,.94)', color: 'var(--text)' }}
                onClick={() => navigate(link.to)}
              >
                {link.label}
              </button>
            ))}
          </div>

          {canSeeFinance && (
            <>
              <h2 className="text-lg font-bold mb-3">Actividad abierta</h2>
              {activity.length === 0 ? (
                <div className="empty">No hay mesas abiertas.</div>
              ) : (
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
                  {activity.map(t => (
                    <div key={t.tableId} className="card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">Mesa {t.tableNumber}</span>
                        <span className={`pill ${TABLE_STATE_PILL[t.state] ?? ''}`}>{t.stateLabel}</span>
                      </div>
                      <p className="m-0 text-sm text-muted">
                        {t.openedAt &&
                          `Abierta ${new Date(t.openedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                      <strong className="block mt-1">{formatMoney(t.total)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
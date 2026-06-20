import { useState, useEffect, useCallback, useMemo } from 'react'
import { getStock } from '../../../api/stock'
import RestockModal from '../../../components/RestockModal'
import AdjustStockModal from '../../../components/AdjustStockModal'
import type { StockStatusDto } from '../../../types'

const STATUS_PILL: Record<string, string> = {
  OK:    'bg-ok/20 text-ok',
  LOW:   'bg-warn/20 text-warn',
  EMPTY: 'bg-danger/20 text-danger',
}

export default function StockTab() {
  const [stock, setStock]     = useState<StockStatusDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState<'ALL' | 'LOW' | 'EMPTY'>('ALL')

  const [restockTarget, setRestockTarget] = useState<StockStatusDto | null>(null)
  const [adjustTarget, setAdjustTarget]   = useState<StockStatusDto | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    getStock()
      .then(r => setStock(r.data))
      .catch(() => setError('No se pudo cargar el stock'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    return stock.filter(p => {
      const matchesSearch = p.productName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [stock, search, statusFilter])

  const lowCount   = stock.filter(p => p.status === 'LOW').length
  const emptyCount = stock.filter(p => p.status === 'EMPTY').length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <div className="card flex-1 min-w-[160px]">
          <span className="text-sm text-muted">Total productos</span>
          <strong className="block text-2xl mt-1">{stock.length}</strong>
        </div>
        <div className="card flex-1 min-w-[160px]">
          <span className="text-sm text-muted">Stock bajo</span>
          <strong className="block text-2xl mt-1 text-warn">{lowCount}</strong>
        </div>
        <div className="card flex-1 min-w-[160px]">
          <span className="text-sm text-muted">Sin stock</span>
          <strong className="block text-2xl mt-1 text-danger">{emptyCount}</strong>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="max-w-xs">
          <option value="ALL">Todos los estados</option>
          <option value="LOW">Solo stock bajo</option>
          <option value="EMPTY">Solo sin stock</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border-l-4 border-danger bg-danger/10 px-4 py-3 text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-muted">Cargando stock...</p>
      ) : filtered.length === 0 ? (
        <div className="empty">No se encontraron productos.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-muted text-left">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Sector</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.productId} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{p.productName}</td>
                  <td className="px-4 py-3 text-muted">{p.categoryName}</td>
                  <td className="px-4 py-3 text-muted">{p.sector === 'COCINA' ? 'Cocina' : p.sector === 'BARRA' ? 'Barra' : 'Ambos'}</td>
                  <td className="px-4 py-3">{p.stock} <span className="text-muted">/ alerta {p.lowStock}</span></td>
                  <td className="px-4 py-3">
                    <span className={`pill ${STATUS_PILL[p.status]}`}>{p.statusLabel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button className="btn-ghost px-3 py-2 min-h-0 text-xs" onClick={() => setRestockTarget(p)}>
                        Reponer
                      </button>
                      <button className="btn-ghost px-3 py-2 min-h-0 text-xs" onClick={() => setAdjustTarget(p)}>
                        Ajustar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {restockTarget && (
        <RestockModal
          product={restockTarget}
          onClose={() => setRestockTarget(null)}
          onSuccess={load}
        />
      )}
      {adjustTarget && (
        <AdjustStockModal
          product={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSuccess={load}
        />
      )}
    </div>
  )
}
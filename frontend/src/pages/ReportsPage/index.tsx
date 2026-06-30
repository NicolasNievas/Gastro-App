import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import {
  getReportSummary, getDailyRevenue, getPaymentMethods,
  getHourlySales, getTopProducts,
} from '../../api/reports'
import { formatMoney } from '../../utils/format'
import type {
  ReportSummaryDto, DailyRevenueDto, PaymentMethodSummaryDto,
  HourlySalesDto, TopProductDto,
} from '../../types'

// ── Helpers ───────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0]
const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
const fmtDate = (iso: string) => {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}
const fmtAxis = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
  : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}k`
  : `$${v}`

const METHOD_COLORS: Record<string, string> = {
  EFECTIVO:      '#10b981',
  DEBITO:        '#3b82f6',
  CREDITO:       '#8b5cf6',
  TRANSFERENCIA: '#14b8a6',
  MERCADO_PAGO:  '#06b6d4',
}

// ── Presets de fecha ───────────────────────────────────────────────────
type Preset = 'today' | 'week' | 'month' | 'custom'

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: 'week',  label: 'Última semana' },
  { key: 'month', label: 'Último mes' },
  { key: 'custom', label: 'Personalizado' },
]

const presetDates = (p: Preset): { from: string; to: string } => {
  const t = today()
  if (p === 'today')  return { from: t, to: t }
  if (p === 'week')   return { from: daysAgo(6), to: t }
  if (p === 'month')  return { from: daysAgo(29), to: t }
  return { from: t, to: t }
}

export default function ReportsPage() {
  const { user } = useAuth()

  const [preset, setPreset] = useState<Preset>('week')
  const [from, setFrom]     = useState(daysAgo(6))
  const [to, setTo]         = useState(today())
  const [loading, setLoading] = useState(false)

  const [summary, setSummary]     = useState<ReportSummaryDto | null>(null)
  const [daily, setDaily]         = useState<DailyRevenueDto[]>([])
  const [methods, setMethods]     = useState<PaymentMethodSummaryDto[]>([])
  const [hourly, setHourly]       = useState<HourlySalesDto[]>([])
  const [topProds, setTopProds]   = useState<TopProductDto[]>([])

  const [summaryError, setSummaryError]   = useState(false)
  const [dailyError, setDailyError]       = useState(false)
  const [methodsError, setMethodsError]   = useState(false)
  const [hourlyError, setHourlyError]     = useState(false)
  const [topProdsError, setTopProdsError] = useState(false)

  const load = useCallback(async (f: string, t: string) => {
  setLoading(true)
  setSummaryError(false)
  setDailyError(false)
  setMethodsError(false)
  setHourlyError(false)
  setTopProdsError(false)

  const [s, d, m, h, p] = await Promise.allSettled([
    getReportSummary(f, t),
    getDailyRevenue(f, t),
    getPaymentMethods(f, t),
    getHourlySales(f, t),
    getTopProducts(f, t),
  ])

  if (s.status === 'fulfilled') setSummary(s.value.data)
  else { setSummary(null); setSummaryError(true) }

  if (d.status === 'fulfilled') setDaily(d.value.data)
  else { setDaily([]); setDailyError(true) }

  if (m.status === 'fulfilled') setMethods(m.value.data)
  else { setMethods([]); setMethodsError(true) }

  if (h.status === 'fulfilled') setHourly(h.value.data)
  else { setHourly([]); setHourlyError(true) }

  if (p.status === 'fulfilled') setTopProds(p.value.data)
  else { setTopProds([]); setTopProdsError(true) }

  setLoading(false)
}, [])

const ErrorCard = ({ msg = 'No se pudo cargar esta sección.' }) => (
  <p className="text-sm text-danger m-0">{msg}</p>
)

  useEffect(() => { load(from, to) }, [from, to, load])

  const handlePreset = (p: Preset) => {
    setPreset(p)
    if (p !== 'custom') {
      const { from: f, to: t } = presetDates(p)
      setFrom(f)
      setTo(t)
    }
  }

  // Filtrar horas sin datos para el gráfico horario (solo mostrar 6-24)
  const hourlyFiltered = hourly.filter(h => h.hour >= 6)

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <p className="m-0 text-sm text-muted">Rol: {user?.username}</p>
        <h1 className="m-0 text-3xl font-bold">Reportes</h1>
      </header>

      {/* ── Selector de período ─────────────────────────────────────── */}
      <div className="card mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => handlePreset(p.key)}
              className={preset === p.key ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '6px 14px', fontSize: '0.875rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="flex items-center gap-2 text-sm">
            <input type="date" value={from} max={to}
              onChange={e => setFrom(e.target.value)}
              className="rounded border border-line bg-transparent px-2 py-1" />
            <span className="text-muted">→</span>
            <input type="date" value={to} min={from} max={today()}
              onChange={e => setTo(e.target.value)}
              className="rounded border border-line bg-transparent px-2 py-1" />
          </div>
        )}

        {loading && <span className="text-sm text-muted">Cargando...</span>}
      </div>

      {/* ── KPI Cards — dependen de summary ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryError ? (
          <div className="card col-span-2 lg:col-span-4">
            <ErrorCard msg="No se pudo cargar el resumen de ventas." />
          </div>
        ) : summary ? (
          <>
            <div className="card">
              <p className="m-0 text-xs text-muted uppercase tracking-wide mb-1">Total recaudado</p>
              <p className="m-0 text-2xl font-bold">{formatMoney(summary.totalRevenue)}</p>
            </div>
            <div className="card">
              <p className="m-0 text-xs text-muted uppercase tracking-wide mb-1">Ticket promedio</p>
              <p className="m-0 text-2xl font-bold">{formatMoney(summary.avgTicket)}</p>
            </div>
            <div className="card">
              <p className="m-0 text-xs text-muted uppercase tracking-wide mb-1">Mesas cobradas</p>
              <p className="m-0 text-2xl font-bold">{summary.totalPayments}</p>
            </div>
            <div className="card">
              <p className="m-0 text-xs text-muted uppercase tracking-wide mb-1">Método + usado</p>
              <p className="m-0 text-2xl font-bold">{summary.topPaymentMethodLabel ?? '—'}</p>
            </div>
          </>
        ) : !loading ? (
          <div className="card col-span-2 lg:col-span-4">
            <p className="text-muted text-sm m-0">Sin datos para el período seleccionado.</p>
          </div>
        ) : null}
      </div>

      {/* ── Fila 1: Ingresos diarios + Métodos de pago ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 mb-5">
        <div className="card">
          <h2 className="m-0 text-base font-bold mb-4">Ingresos por día</h2>
          {dailyError ? (
            <ErrorCard />
          ) : daily.length === 0 ? (
            <p className="text-muted text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={daily.map(d => ({ ...d, label: fmtDate(d.date) }))}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11, fill: 'var(--muted)' }} width={56} />
                <Tooltip
                  formatter={(v) => [formatMoney(Number(v ?? 0)), 'Total']}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8 }}
                />
                <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="m-0 text-base font-bold mb-4">Por método de pago</h2>
          {methodsError ? (
            <ErrorCard />
          ) : methods.length === 0 ? (
            <p className="text-muted text-sm">Sin datos</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={methods} dataKey="amount" nameKey="methodLabel"
                    cx="50%" cy="50%" outerRadius={70} paddingAngle={2}>
                    {methods.map((m, i) => (
                      <Cell key={m.method}
                        fill={METHOD_COLORS[m.method] ?? `hsl(${i * 60}, 70%, 55%)`} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, _, p: any) => [
                      `${formatMoney(Number(v ?? 0))} (${p.payload.percentage}%)`, ''
                    ]}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="m-0 pl-0 list-none grid gap-1.5 mt-2">
                {methods.map((m, i) => (
                  <li key={m.method} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block"
                        style={{ background: METHOD_COLORS[m.method] ?? `hsl(${i * 60}, 70%, 55%)` }} />
                      {m.methodLabel}
                    </span>
                    <span className="text-muted">{m.count} · {m.percentage}%</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* ── Fila 2: Ventas por hora + Top productos ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="card">
          <h2 className="m-0 text-base font-bold mb-4">Ventas por hora del día</h2>
          {hourlyError ? (
            <ErrorCard />
          ) : hourlyFiltered.every(h => h.amount === 0) ? (
            <p className="text-muted text-sm">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyFiltered}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
                <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 11, fill: 'var(--muted)' }} width={56} />
                <Tooltip
                  formatter={(v) => [formatMoney(Number(v ?? 0)), 'Ventas']}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8 }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="m-0 text-base font-bold mb-4">Top productos vendidos</h2>
          {topProdsError ? (
            <ErrorCard />
          ) : topProds.length === 0 ? (
            <p className="text-muted text-sm">Sin datos</p>
          ) : (
            <ul className="m-0 pl-0 list-none grid gap-3">
              {topProds.slice(0, 8).map((p, i) => {
                const maxQty = topProds[0].totalQuantity
                const pct    = Math.round((p.totalQuantity / maxQty) * 100)
                return (
                  <li key={p.productName}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span className="text-muted font-mono w-4">{i + 1}</span>
                        {p.productName}
                      </span>
                      <span className="text-muted">{p.totalQuantity} ud.</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-line overflow-hidden">
                      <div className="h-full rounded-full bg-accent"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Fila 3: Descuentos/recargos — solo si summary los tiene ──── */}
      {summary && (summary.totalDiscount > 0 || summary.totalSurcharge > 0) && (
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="card">
            <p className="m-0 text-xs text-muted uppercase tracking-wide mb-1">Total descuentos</p>
            <p className="m-0 text-xl font-bold text-warn">-{formatMoney(summary.totalDiscount)}</p>
          </div>
          <div className="card">
            <p className="m-0 text-xs text-muted uppercase tracking-wide mb-1">Total recargos</p>
            <p className="m-0 text-xl font-bold">{formatMoney(summary.totalSurcharge)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
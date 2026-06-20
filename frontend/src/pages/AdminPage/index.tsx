import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ProductsTab from './tabs/ProductsTab'
import CategoriesTab from './tabs/CategoriesTab'
import StockTab from './tabs/StockTab'
import HistoryTab from './tabs/HistoryTab'

const TABS = [
  { to: 'products',   label: 'Productos' },
  { to: 'categories', label: 'Categorías' },
  { to: 'stock',       label: 'Stock' },
  { to: 'history',     label: 'Historial' },
]

export default function AdminPage() {
  const { logout, user } = useAuth()

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="m-0 text-sm text-muted">Rol: {user?.username}</p>
          <h1 className="m-0 text-3xl font-bold">Administración</h1>
        </div>
        <button className="btn-ghost" onClick={logout}>Cerrar sesión</button>
      </header>

      <nav className="flex gap-2 mb-6 border-b border-line">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={`/admin/${tab.to}`}
            className={({ isActive }) =>
              `px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
                isActive
                  ? 'bg-panel text-accent border border-line border-b-0'
                  : 'text-muted hover:text-text'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Routes>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products"   element={<ProductsTab />} />
        <Route path="categories" element={<CategoriesTab />} />
        <Route path="stock"      element={<StockTab />} />
        <Route path="history"    element={<HistoryTab />} />
      </Routes>
    </div>
  )
}
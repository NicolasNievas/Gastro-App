import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import ProductsTab from './tabs/ProductsTab'
import CategoriesTab from './tabs/CategoriesTab'

const TABS = [
  { to: 'products',   label: 'Productos' },
  { to: 'categories', label: 'Categorías' },
]

export default function AdminPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <h1 className="m-0 text-3xl font-bold">Catálogo</h1>
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
      </Routes>
    </div>
  )
}
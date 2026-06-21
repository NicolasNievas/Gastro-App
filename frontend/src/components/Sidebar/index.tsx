import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { Role } from '../../types'

interface NavItem {
  to: string
  label: string
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',         label: 'Dashboard', roles: ['ADMIN', 'MOZO', 'COCINA', 'BARRA', 'CAJA'] },
  { to: '/mozo',     label: 'Mesas',     roles: ['ADMIN', 'MOZO'] },
  { to: '/cocina',   label: 'Cocina',    roles: ['ADMIN', 'COCINA'] },
  { to: '/barra',    label: 'Barra',     roles: ['ADMIN', 'BARRA'] },
  { to: '/caja',     label: 'Caja',      roles: ['ADMIN', 'CAJA'] },
  { to: '/stock',    label: 'Stock',     roles: ['ADMIN', 'CAJA'] },
  { to: '/history',  label: 'Historial', roles: ['ADMIN', 'CAJA'] },
  { to: '/admin',    label: 'Catálogo',  roles: ['ADMIN'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  if (!user) return null

  const items = NAV_ITEMS.filter(i => i.roles.includes(user.role))

  return (
    <aside className="w-60 shrink-0 border-r border-line bg-panel/80 flex flex-col p-4 sticky top-0 h-screen">
      <div className="mb-6">
        <strong className="block text-lg">Callejón Güemes</strong>
        <span className="text-sm text-muted">Comanda electrónica</span>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isActive ? 'bg-accent/15 text-accent' : 'text-text hover:bg-panel-2'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line pt-3 mt-3">
        <p className="m-0 text-sm font-semibold">{user.username}</p>
        <p className="m-0 text-xs text-muted mb-2">{user.role}</p>
        <button className="btn-ghost w-full" onClick={logout}>Cerrar sesión</button>
      </div>
    </aside>
  )
}
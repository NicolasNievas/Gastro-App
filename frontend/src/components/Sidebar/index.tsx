import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import type { Role } from '../../types'
import { LayoutDashboard,UtensilsCrossed, ChefHat, Wine, CreditCard, Package, History, BarChart2, BookOpen, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to:    string
  label: string
  roles: Role[]
  icon:  LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',        label: 'Dashboard', roles: ['ADMIN', 'MOZO', 'COCINA', 'BARRA', 'CAJA'], icon: LayoutDashboard },
  { to: '/mozo',    label: 'Mesas',     roles: ['ADMIN', 'MOZO'],                             icon: UtensilsCrossed },
  { to: '/cocina',  label: 'Cocina',    roles: ['ADMIN', 'COCINA'],                           icon: ChefHat         },
  { to: '/barra',   label: 'Barra',     roles: ['ADMIN', 'BARRA'],                            icon: Wine            },
  { to: '/caja',    label: 'Caja',      roles: ['ADMIN', 'CAJA'],                             icon: CreditCard      },
  { to: '/stock',   label: 'Stock',     roles: ['ADMIN', 'CAJA'],                             icon: Package         },
  { to: '/history', label: 'Historial', roles: ['ADMIN', 'CAJA'],                             icon: History         },
  { to: '/reports', label: 'Reportes',  roles: ['ADMIN', 'CAJA'],                             icon: BarChart2       },
  { to: '/admin',   label: 'Catálogo',  roles: ['ADMIN'],                                     icon: BookOpen        },
]

const ROLE_LABEL: Record<Role, string> = {
  ADMIN:   'Administrador',
  MOZO:    'Mozo',
  COCINA:  'Cocina',
  BARRA:   'Barra',
  CAJA:    'Caja',
}

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

      <nav className="flex flex-col gap-1 flex-1">
        {items.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-text hover:bg-panel-2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    className={isActive ? 'text-accent' : 'text-muted'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-line pt-3 mt-3">
        <p className="m-0 text-sm font-semibold">{user.username}</p>
        <p className="m-0 text-xs text-muted mb-3">{ROLE_LABEL[user.role] ?? user.role}</p>
        <button
          className="btn-ghost w-full flex items-center justify-center gap-2"
          onClick={logout}
        >
          <LogOut size={15} strokeWidth={1.8} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
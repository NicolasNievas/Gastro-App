import { createBrowserRouter, Navigate } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types'

import LoginPage  from '../pages/LoginPage'
import MozoPage   from '../pages/MozoPage'
import CocinaPage from '../pages/CocinaPage'
import BarraPage  from '../pages/BarraPage'
import CajaPage   from '../pages/CajaPage'
import AdminPage  from '../pages/AdminPage'

interface PrivateRouteProps {
  children: ReactNode
  roles: Role[]
}

function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 32 }}>Cargando...</div>
  if (!user)                     return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/"      replace />
  return <>{children}</>
}

function RoleRedirect() {
  const { user } = useAuth()
  const map: Record<Role, string> = {
    MOZO: '/mozo', COCINA: '/cocina',
    BARRA: '/barra', CAJA: '/caja', ADMIN: '/admin',
  }
  return <Navigate to={user ? map[user.role] : '/login'} replace />
}

const ALL: Role[] = ['ADMIN', 'MOZO', 'COCINA', 'BARRA', 'CAJA']

export const router = createBrowserRouter([
  { path: '/login',   element: <LoginPage /> },
  { path: '/',        element: <PrivateRoute roles={ALL}><RoleRedirect /></PrivateRoute> },
  { path: '/mozo',    element: <PrivateRoute roles={['MOZO','ADMIN']}><MozoPage /></PrivateRoute> },
  { path: '/cocina',  element: <PrivateRoute roles={['COCINA','ADMIN']}><CocinaPage /></PrivateRoute> },
  { path: '/barra',   element: <PrivateRoute roles={['BARRA','ADMIN']}><BarraPage /></PrivateRoute> },
  { path: '/caja',    element: <PrivateRoute roles={['CAJA','ADMIN']}><CajaPage /></PrivateRoute> },
  { path: '/admin/*', element: <PrivateRoute roles={['ADMIN']}><AdminPage /></PrivateRoute> },
])
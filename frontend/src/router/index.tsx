import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types'

import LoginPage   from '../pages/LoginPage'
import Dashboard   from '../pages/Dashboard'
import MozoPage    from '../pages/MozoPage'
import CocinaPage  from '../pages/CocinaPage'
import BarraPage   from '../pages/BarraPage'
import CajaPage    from '../pages/CajaPage'
import StockPage   from '../pages/StockPage'
import HistoryPage from '../pages/HistoryPage'
import AdminPage   from '../pages/AdminPage'
import Layout      from '../components/Layout'
import MenuPage from '../pages/MenuPage'
import ReportsPage from '../pages/ReportsPage'

interface PrivateRouteProps {
  children: ReactNode
  roles: Role[]
}

function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 32 }}>Cargando...</div>
  if (!user)                      return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/"      replace />
  return <>{children}</>
}

const ALL: Role[] = ['ADMIN', 'MOZO', 'COCINA', 'BARRA', 'CAJA']

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/menu/:tableNumber',  element: <MenuPage /> },
  {
    // Ruta-layout sin path propio: envuelve todo lo autenticado con el Sidebar
    element: (
      <PrivateRoute roles={ALL}>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      { index: true,     element: <Dashboard /> },
      { path: 'mozo',    element: <PrivateRoute roles={['MOZO', 'ADMIN']}><MozoPage /></PrivateRoute> },
      { path: 'cocina',  element: <PrivateRoute roles={['COCINA', 'ADMIN']}><CocinaPage /></PrivateRoute> },
      { path: 'barra',   element: <PrivateRoute roles={['BARRA', 'ADMIN']}><BarraPage /></PrivateRoute> },
      { path: 'caja',    element: <PrivateRoute roles={['CAJA', 'ADMIN']}><CajaPage /></PrivateRoute> },
      { path: 'stock',   element: <PrivateRoute roles={['CAJA', 'ADMIN']}><StockPage /></PrivateRoute> },
      { path: 'history', element: <PrivateRoute roles={['CAJA', 'ADMIN']}><HistoryPage /></PrivateRoute> },
      { path: 'reports', element: <PrivateRoute roles={['CAJA', 'ADMIN']}><ReportsPage /></PrivateRoute> },
      { path: 'admin/*', element: <PrivateRoute roles={['ADMIN']}><AdminPage /></PrivateRoute> },
    ],
  },
])
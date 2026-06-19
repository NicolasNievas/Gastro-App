import { createContext, useContext, useState, useEffect, type ReactNode,  } from 'react'
import { login as apiLogin } from '../api/auth'
import type { User, Role } from '../types'

interface AuthContextType {
  user:    User | null
  loading: boolean
  login:   (username: string, password: string) => Promise<User>
  logout:  () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token  = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try { setUser(JSON.parse(stored) as User) } catch { /* corrupto */ }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<User> => {
    const data = await apiLogin(username, password)
    localStorage.setItem('token', data.token)
    const userData: User = { username: data.username, role: data.role as Role }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
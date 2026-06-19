import client from './client'
import type { AuthResponse } from '../types'

export const login = (username: string, password: string) =>
  client.post<AuthResponse>('/auth/login', { username, password }).then(r => r.data)
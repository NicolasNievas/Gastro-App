import client from './client'
import type { ProductDto, Sector } from '../types'

export const getProducts = (params?: { active?: boolean; sector?: Sector; categoryId?: number }) =>
  client.get<ProductDto[]>('/products', { params })
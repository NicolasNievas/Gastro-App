import client from './client'
import type { ProductDto, ProductRequest, Sector } from '../types'

export const getProducts = (params?: { active?: boolean; sector?: Sector; categoryId?: number }) =>
  client.get<ProductDto[]>('/products', { params })

export const createProduct = (data: ProductRequest) =>
  client.post<ProductDto>('/products', data)

export const updateProduct = (id: number, data: ProductRequest) =>
  client.put<ProductDto>(`/products/${id}`, data)

export const deactivateProduct = (id: number) =>
  client.delete<void>(`/products/${id}`)
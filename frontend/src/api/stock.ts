import client from './client'
import type { StockStatusDto, StockMovementDto } from '../types'

export const getStock = () =>
  client.get<StockStatusDto[]>('/stock')

export const getStockAlerts = () =>
  client.get<{ lowStock: StockStatusDto[]; outOfStock: StockStatusDto[] }>('/stock/alerts')

export const restockProduct = (id: number, quantity: number, notes?: string) =>
  client.patch<StockStatusDto>(`/stock/${id}/restock`, { quantity, notes })

export const adjustStock = (id: number, data: unknown) =>
  client.patch<StockStatusDto>(`/stock/${id}/adjust`, data)

export const getMovements = (params?: { productId?: number; reason?: string }) =>
  client.get<StockMovementDto[]>('/stock/movements', { params })
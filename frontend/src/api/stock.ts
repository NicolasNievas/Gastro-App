import client from './client'
import type { StockStatusDto, StockMovementDto, StockAlertResponse, RestockRequest, StockAdjustmentRequest } from '../types'

export const getStock = () => client.get<StockStatusDto[]>('/stock')

export const getStockAlerts = () => client.get<StockAlertResponse>('/stock/alerts')

export const restockProduct = (id: number, data: RestockRequest) =>
  client.patch<StockStatusDto>(`/stock/${id}/restock`, data)

export const adjustStock = (id: number, data: StockAdjustmentRequest) =>
  client.patch<StockStatusDto>(`/stock/${id}/adjust`, data)

export const getMovements = (params?: { productId?: number; reason?: string }) =>
  client.get<StockMovementDto[]>('/stock/movements', { params })
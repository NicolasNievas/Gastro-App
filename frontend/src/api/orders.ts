import client from './client'
import type { OrderDto, OrderSummaryDto, SectorOrderDto } from '../types'

export const getOrders = (params?: { tableId?: number; state?: string }) =>
  client.get<OrderSummaryDto[]>('/orders', { params })

export const getOrder = (id: number) =>
  client.get<OrderDto>(`/orders/${id}`)

export const createOrder = (data: unknown) =>
  client.post<OrderDto>('/orders', data)

export const getActiveSectorOrders = (sector: 'COCINA' | 'BARRA') =>
  client.get<SectorOrderDto[]>('/sector-orders/active', { params: { sector } })

export const updateSectorStatus = (id: number, status: string) =>
  client.patch<SectorOrderDto>(`/sector-orders/${id}/status`, { status })
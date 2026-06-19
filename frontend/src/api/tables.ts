import client from './client'
import type { TableAdjustmentRequest, TableDto } from '../types'

export const getTables     = ()                  => client.get<TableDto[]>('/tables')
export const getOpenTables = ()                  => client.get<TableDto[]>('/tables/open')
export const getTable      = (id: number)        => client.get<TableDto>(`/tables/${id}`)
export const createTable   = (data: unknown)     => client.post<TableDto>('/tables', data)
export const updateTable   = (id: number, data: unknown) => client.put<TableDto>(`/tables/${id}`, data)
export const deleteTable   = (id: number)        => client.delete<void>(`/tables/${id}`)
export const adjustTable = (id: number, data: TableAdjustmentRequest) =>
  client.patch<TableDto>(`/tables/${id}/adjustment`, data)
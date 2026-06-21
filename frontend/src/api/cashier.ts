import client from './client'
import type { BillResponseDto, CloseCashierRequest, OpenTableSummary, PaymentResponseDto, PaymentSummaryDto, TodaySummary } from '../types'

export const getBill = (tableId: number) =>
  client.get<BillResponseDto>(`/cashier/bill/${tableId}`)

export const closeTable = (tableId: number, data: CloseCashierRequest) =>
  client.post<PaymentResponseDto>(`/cashier/close/${tableId}`, data)

export const getHistory = (params?: { tableNumber?: number; method?: string }) =>
  client.get<PaymentSummaryDto[]>('/cashier/history', { params })

export const getPayment = (id: number) =>
  client.get<PaymentResponseDto>(`/cashier/history/${id}`)

export const getTodaySummary = () => client.get<TodaySummary>('/cashier/summary/today')
export const getOpenTablesSummary = () => client.get<OpenTableSummary[]>('/cashier/open-tables-summary')
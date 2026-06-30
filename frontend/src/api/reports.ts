import client from './client'
import type {
  ReportSummaryDto, TopProductDto, DailyRevenueDto,
  PaymentMethodSummaryDto, HourlySalesDto,
} from '../types'

const q = (from: string, to: string) => `from=${from}&to=${to}`

export const getReportSummary    = (f: string, t: string) =>
  client.get<ReportSummaryDto>(`/reports/summary?${q(f,t)}`)

export const getPaymentMethods   = (f: string, t: string) =>
  client.get<PaymentMethodSummaryDto[]>(`/reports/payment-methods?${q(f,t)}`)

export const getDailyRevenue     = (f: string, t: string) =>
  client.get<DailyRevenueDto[]>(`/reports/daily-revenue?${q(f,t)}`)

export const getHourlySales      = (f: string, t: string) =>
  client.get<HourlySalesDto[]>(`/reports/hourly?${q(f,t)}`)

export const getTopProducts      = (f: string, t: string, limit = 10) =>
  client.get<TopProductDto[]>(`/reports/top-products?${q(f,t)}&limit=${limit}`)
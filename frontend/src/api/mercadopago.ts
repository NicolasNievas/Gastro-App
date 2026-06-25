import client from './client'
import type { MpQrResponse } from '../types'

export const createQrOrderCaja = (tableNumber: number) =>
  client.post<MpQrResponse>(`/mp/qr/${tableNumber}`)

export const cancelQrOrder = (orderId: string) =>
  client.post<void>(`/mp/qr/cancel?orderId=${orderId}`)
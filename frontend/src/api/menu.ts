import axios from 'axios'
import type { MenuResponseDto, CustomerOrderResponseDto } from '../types'

const menuClient = axios.create({
  baseURL: 'http://localhost:8081',
})

export const getMenu = (tableNumber: number) =>
  menuClient.get<MenuResponseDto>(`/menu/${tableNumber}`)

export const placeOrder = (
  tableNumber: number,
  data: {
    items: { productId: number; quantity: number; notes: string }[]
    note?: string
  }
) => menuClient.post<CustomerOrderResponseDto>(`/menu/${tableNumber}/order`, data)
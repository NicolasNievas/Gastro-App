// ── Auth ─────────────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'MOZO' | 'COCINA' | 'BARRA' | 'CAJA'

export interface User {
  username: string
  role: Role
}

export interface AuthResponse {
  token: string
  username: string
  role: string
}

// ── Enums del dominio ─────────────────────────────────────────────────
export type MesaStatus =
  | 'LIBRE'
  | 'ESPERANDO_PEDIDO'
  | 'EN_PREPARACION'
  | 'LISTA'
  | 'PARA_COBRAR'

export type Sector = 'COCINA' | 'BARRA' | 'AMBOS'

export type OrderStatus   = 'ABIERTO' | 'CERRADO' | 'CANCELADO'
export type OrderItemStatus = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO_PARA_ENTREGAR' | 'ENTREGADO'
export type SectorOrderStatus = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO'
export type PaymentMethod = 'EFECTIVO' | 'DEBITO' | 'CREDITO' | 'TRANSFERENCIA' | 'MERCADO_PAGO'
export type StockStatus   = 'OK' | 'LOW' | 'EMPTY'
export type StockMovementReason =
  | 'SALE'
  | 'RESTOCK'
  | 'MANUAL_ADJUSTMENT'
  | 'WASTE'
  | 'CANCELLED_ORDER'

// ── Mesas ─────────────────────────────────────────────────────────────
export interface TableDto {
  id: number
  number: number
  capacity: number
  state: MesaStatus
  stateLabel: string
  openedAt: string | null
  discount: number
  surcharge: number
}

// ── Catálogo ──────────────────────────────────────────────────────────
export interface CategoryDto {
  id: number
  name: string
  active: boolean
  createdAt: string
}

export interface ProductDto {
  id: number
  name: string
  price: number
  category: CategoryDto
  sector: Sector
  stock: number
  lowStock: number
  noStock: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

// ── Pedidos ───────────────────────────────────────────────────────────
export interface OrderItemDto {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  notes: string
  sector: Sector
  state: OrderItemStatus
}

export interface SectorOrderDto {
  id: number
  orderId: number
  tableNumber: number
  sector: Sector
  status: SectorOrderStatus
  statusLabel: string
  orderNote: string | null
  createdAt: string
  items: OrderItemDto[]
}

export interface OrderDto {
  id: number
  table: TableDto
  waiterUsername: string
  state: OrderStatus
  total: number
  note: string | null
  createdAt: string
  closedAt: string | null
  items: OrderItemDto[]
  sectorOrders: SectorOrderDto[]
}

export interface OrderSummaryDto {
  id: number
  tableNumber: number
  state: OrderStatus
  total: number
  note: string | null
  createdAt: string
}

// ── Caja / Pagos ──────────────────────────────────────────────────────
export interface BillItemDto {
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  sector: Sector
  subtotal: number
}

export interface BillResponseDto {
  tableId: number
  tableNumber: number
  tableState: MesaStatus
  tableStateLabel: string
  openedAt: string
  items: BillItemDto[]
  subtotal: number
  discount: number
  surcharge: number
  total: number
}

export interface PaymentResponseDto {
  id: number
  tableNumber: number
  method: PaymentMethod
  subtotal: number
  discount: number
  surcharge: number
  amount: number
  notes: string | null
  createdAt: string
  items: BillItemDto[]
}

export interface PaymentSummaryDto {
  id: number
  tableNumber: number
  method: PaymentMethod
  subtotal: number
  discount: number
  surcharge: number
  amount: number
  createdAt: string
  itemCount: number
}

// ── Stock ─────────────────────────────────────────────────────────────
export interface StockStatusDto {
  productId: number
  productName: string
  categoryName: string
  sector: Sector
  stock: number
  lowStock: number
  noStock: boolean
  status: StockStatus
  statusLabel: string
}

export interface StockMovementDto {
  id: number
  productId: number
  productName: string
  quantityChange: number
  reason: StockMovementReason
  reasonLabel: string
  createdAt: string
}

// ── WebSocket ─────────────────────────────────────────────────────────
export type WsEventType = 'ORDER_CREATED' | 'SECTOR_STATUS_UPDATED' | 'TABLE_UPDATED'

export interface WsEvent<T = unknown> {
  type: WsEventType
  payload: T
  timestamp: string
}

// ── Draft de comanda (frontend-only) ─────────
export interface DraftItem {
  productId: number
  productName: string
  price: number
  sector: Sector
  quantity: number
  notes: string
}

export interface TableAdjustmentRequest {
  discount: number
  surcharge: number
}

export interface CloseCashierRequest {
  paymentMethod: PaymentMethod
  notes?: string
}

export interface ProductRequest {
  name: string
  price: number
  categoryId: number
  sector: Sector
  stock: number
  lowStock?: number
  noStock?: boolean
  active?: boolean
}

export interface CategoryRequest {
  name: string
}

export interface RestockRequest {
  quantity: number
  notes?: string
}

export interface StockAdjustmentRequest {
  quantity: number
  reason: StockMovementReason
  notes?: string
}

export interface StockAlertResponse {
  lowStock: StockStatusDto[]
  outOfStock: StockStatusDto[]
}
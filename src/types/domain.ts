export const ITEM_CATEGORIES = [
  "Noodles",
  "Drinks",
  "Snacks",
  "Toiletries",
  "Grocery",
  "Cigarettes",
  "Other",
] as const

export type ItemCategory = (typeof ITEM_CATEGORIES)[number]

export const BILL_CATEGORIES = [
  "electricity",
  "water",
  "rent",
  "transport",
  "restocking",
  "other",
] as const

export type BillCategory = (typeof BILL_CATEGORIES)[number]
export type RecordStatus = "paid" | "unpaid"
export type SaleStatus = "completed" | "void"

export interface SaleLine {
  id: string
  itemName: string
  category: ItemCategory
  quantity: number
  sellingPrice: number
  costPrice: number
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  lines: SaleLine[]
}

export interface RememberedItem {
  id: string
  name: string
  category: ItemCategory
  lastSellingPrice: number
  lastCostPrice: number
  unitsSold: number
  lastSoldAt: string
}

export interface ServiceIncome {
  id: string
  date: string
  serviceName: string
  quantity: number
  sellingPrice: number
  costPrice: number
}

export interface Bill {
  id: string
  date: string
  dueDate: string | null
  category: BillCategory
  description: string
  amount: number
  status: RecordStatus
}

export interface Supplier {
  id: string
  name: string
  contact: string
  productCategory: string
  deliveryFrequency: string
}

export interface Note {
  id: string
  title: string
  content: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface StoreDatabase {
  schemaVersion: 1
  sales: Sale[]
  items: RememberedItem[]
  services: ServiceIncome[]
  bills: Bill[]
  suppliers: Supplier[]
  notes: Note[]
}

export type NewSaleLine = Omit<SaleLine, "id">

export interface NewSale {
  date?: string
  lines: NewSaleLine[]
}

export interface NewServiceIncome {
  date?: string
  serviceName: string
  quantity: number
  sellingPrice: number
  costPrice: number
}

export type NewBill = Omit<Bill, "id">
export type NewSupplier = Omit<Supplier, "id">
export type NewNote = Pick<Note, "title" | "content">

export interface MonthlyAccounting {
  month: string
  revenue: number
  costOfGoodsSold: number
  serviceCosts: number
  grossProfit: number
  operatingExpenses: number
  netProfit: number
  profitMargin: number
}

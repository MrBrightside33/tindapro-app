import type { SaleLine, ServiceIncome } from "@/types/domain"

export interface ProfitTotals {
  revenue: number
  cost: number
  profit: number
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateLineProfit(line: SaleLine): number {
  return roundCurrency((line.sellingPrice - line.costPrice) * line.quantity)
}

export function calculateSaleTotals(lines: readonly SaleLine[]): ProfitTotals {
  const revenue = lines.reduce(
    (total, line) => total + line.sellingPrice * line.quantity,
    0
  )
  const cost = lines.reduce(
    (total, line) => total + line.costPrice * line.quantity,
    0
  )

  return {
    revenue: roundCurrency(revenue),
    cost: roundCurrency(cost),
    profit: roundCurrency(revenue - cost),
  }
}

export function calculateServiceProfit(
  service: Pick<ServiceIncome, "quantity" | "sellingPrice" | "costPrice">
): number {
  return roundCurrency(
    (service.sellingPrice - service.costPrice) * service.quantity
  )
}

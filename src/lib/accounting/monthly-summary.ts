import type {
  Bill,
  MonthlyAccounting,
  Sale,
  ServiceIncome,
} from "@/types/domain"

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateMonthlyAccounting(
  month: string,
  sales: readonly Sale[],
  services: readonly ServiceIncome[],
  bills: readonly Bill[]
): MonthlyAccounting {
  const salesInMonth = sales.filter(
    (sale) => sale.status === "completed" && sale.date.slice(0, 7) === month
  )
  const servicesInMonth = services.filter(
    (service) => service.date.slice(0, 7) === month
  )
  const billsInMonth = bills.filter(
    (bill) =>
      bill.status === "paid" &&
      bill.category !== "restocking" &&
      bill.date.slice(0, 7) === month
  )

  const productRevenue = salesInMonth.reduce(
    (total, sale) =>
      total +
      sale.lines.reduce(
        (saleTotal, line) => saleTotal + line.sellingPrice * line.quantity,
        0
      ),
    0
  )
  const costOfGoodsSold = salesInMonth.reduce(
    (total, sale) =>
      total +
      sale.lines.reduce(
        (saleTotal, line) => saleTotal + line.costPrice * line.quantity,
        0
      ),
    0
  )
  const serviceRevenue = servicesInMonth.reduce(
    (total, service) => total + service.sellingPrice * service.quantity,
    0
  )
  const serviceCosts = servicesInMonth.reduce(
    (total, service) => total + service.costPrice * service.quantity,
    0
  )
  const operatingExpenses = billsInMonth.reduce(
    (total, bill) => total + bill.amount,
    0
  )
  const revenue = roundCurrency(productRevenue + serviceRevenue)
  const grossProfit = roundCurrency(
    revenue - costOfGoodsSold - serviceCosts
  )
  const netProfit = roundCurrency(grossProfit - operatingExpenses)

  return {
    month,
    revenue,
    costOfGoodsSold: roundCurrency(costOfGoodsSold),
    serviceCosts: roundCurrency(serviceCosts),
    grossProfit,
    operatingExpenses: roundCurrency(operatingExpenses),
    netProfit,
    profitMargin: revenue === 0 ? 0 : roundCurrency((netProfit / revenue) * 100),
  }
}

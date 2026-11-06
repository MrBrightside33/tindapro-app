import type { ItemCategory, RememberedItem, Sale } from "@/types/domain"

export function normalizeItemName(name: string): string {
  return name.trim().toLocaleLowerCase("en-PH")
}

export function buildItemPriceMemory(sales: readonly Sale[]): RememberedItem[] {
  const items = new Map<
    string,
    RememberedItem & { lastSoldAt: string; category: ItemCategory }
  >()

  for (const sale of sales) {
    if (sale.status !== "completed") {
      continue
    }

    for (const line of sale.lines) {
      const key = normalizeItemName(line.itemName)
      const current = items.get(key)
      const unitsSold = (current?.unitsSold ?? 0) + line.quantity

      if (!current || sale.date >= current.lastSoldAt) {
        items.set(key, {
          id: key,
          name: line.itemName.trim(),
          category: line.category,
          lastSellingPrice: line.sellingPrice,
          lastCostPrice: line.costPrice,
          unitsSold,
          lastSoldAt: sale.date,
        })
      } else {
        current.unitsSold = unitsSold
      }
    }
  }

  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name, "en-PH"))
}

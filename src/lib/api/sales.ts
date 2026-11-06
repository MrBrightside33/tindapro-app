import {
  buildItemPriceMemory,
  normalizeItemName,
} from "@/lib/accounting/item-price-memory"
import {
  createRecordId,
  readStoreDatabase,
  requireNonNegativeAmount,
  requirePositiveQuantity,
  requireValidDate,
  updateStoreDatabase,
} from "@/lib/api/storage"
import type { NewSale, NewSaleLine, Sale, SaleLine } from "@/types/domain"

function validateSaleLines(lines: readonly NewSaleLine[]): void {
  if (lines.length === 0) {
    throw new Error("A sale must include at least one item.")
  }

  for (const line of lines) {
    if (!line.itemName.trim()) {
      throw new Error("Sale item names cannot be empty.")
    }

    requirePositiveQuantity(line.quantity)
    requireNonNegativeAmount(line.sellingPrice, "Selling price")
    requireNonNegativeAmount(line.costPrice, "Cost price")
  }
}

function createSaleLines(lines: readonly NewSaleLine[]): SaleLine[] {
  return lines.map((line) => ({
    ...line,
    itemName: line.itemName.trim(),
    id: createRecordId("line"),
  }))
}

function syncItemMemory(
  sales: readonly Sale[],
  previousItems: StoreDatabaseItems,
  updatedLines: readonly SaleLine[]
): StoreDatabaseItems {
  const updatedPrices = new Map(
    updatedLines.map((line) => [normalizeItemName(line.itemName), line])
  )
  const previousByName = new Map(
    previousItems.map((item) => [normalizeItemName(item.name), item])
  )

  return buildItemPriceMemory(sales).map((item) => {
    const updatedLine = updatedPrices.get(normalizeItemName(item.name))
    const previousItem = previousByName.get(normalizeItemName(item.name))

    if (updatedLine) {
      return {
        ...item,
        lastSellingPrice: updatedLine.sellingPrice,
        lastCostPrice: updatedLine.costPrice,
        category: updatedLine.category,
        name: updatedLine.itemName,
      }
    }

    if (previousItem) {
      return {
        ...item,
        lastSellingPrice: previousItem.lastSellingPrice,
        lastCostPrice: previousItem.lastCostPrice,
      }
    }

    return item
  })
}

type StoreDatabaseItems = ReturnType<typeof buildItemPriceMemory>

export async function getSales(): Promise<Sale[]> {
  return readStoreDatabase().sales
}

export async function createSale(input: NewSale): Promise<Sale> {
  validateSaleLines(input.lines)
  const date = input.date ?? new Date().toISOString()
  requireValidDate(date)

  const sale: Sale = {
    id: createRecordId("sale"),
    date,
    status: "completed",
    lines: createSaleLines(input.lines),
  }

  return updateStoreDatabase((database) => {
    const sales = [...database.sales, sale]
    return {
      database: {
        ...database,
        sales,
        items: syncItemMemory(sales, database.items, sale.lines),
      },
      result: sale,
    }
  })
}

export async function updateSale(
  saleId: string,
  input: Partial<NewSale>
): Promise<Sale> {
  if (input.lines) {
    validateSaleLines(input.lines)
  }
  if (input.date) {
    requireValidDate(input.date)
  }

  return updateStoreDatabase((database) => {
    const existing = database.sales.find((sale) => sale.id === saleId)
    if (!existing) {
      throw new Error(`Sale ${saleId} was not found.`)
    }
    if (existing.status === "void") {
      throw new Error("A voided sale cannot be edited.")
    }

    const updated: Sale = {
      ...existing,
      date: input.date ?? existing.date,
      lines: input.lines ? createSaleLines(input.lines) : existing.lines,
    }
    const sales = database.sales.map((sale) =>
      sale.id === saleId ? updated : sale
    )

    return {
      database: {
        ...database,
        sales,
        items: syncItemMemory(
          sales,
          database.items,
          input.lines ? updated.lines : []
        ),
      },
      result: updated,
    }
  })
}

export async function voidSale(saleId: string): Promise<Sale> {
  return updateStoreDatabase((database) => {
    const existing = database.sales.find((sale) => sale.id === saleId)
    if (!existing) {
      throw new Error(`Sale ${saleId} was not found.`)
    }
    if (existing.status === "void") {
      throw new Error(`Sale ${saleId} has already been voided.`)
    }

    const voidedSale = { ...existing, status: "void" as const }
    const sales = database.sales.map((sale) =>
      sale.id === saleId ? voidedSale : sale
    )

    return {
      database: {
        ...database,
        sales,
        items: syncItemMemory(sales, database.items, []),
      },
      result: voidedSale,
    }
  })
}

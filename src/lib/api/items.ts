import {
  readStoreDatabase,
  requireNonNegativeAmount,
  updateStoreDatabase,
} from "@/lib/api/storage"
import type { RememberedItem } from "@/types/domain"

export async function getItems(): Promise<RememberedItem[]> {
  return readStoreDatabase().items
}

export async function updateItemPrices(
  itemId: string,
  prices: Pick<RememberedItem, "lastSellingPrice" | "lastCostPrice">
): Promise<RememberedItem> {
  requireNonNegativeAmount(prices.lastSellingPrice, "Selling price")
  requireNonNegativeAmount(prices.lastCostPrice, "Cost price")

  return updateStoreDatabase((database) => {
    const item = database.items.find((entry) => entry.id === itemId)
    if (!item) {
      throw new Error(`Remembered item ${itemId} was not found.`)
    }

    const updatedItem = { ...item, ...prices }
    return {
      database: {
        ...database,
        items: database.items.map((entry) =>
          entry.id === itemId ? updatedItem : entry
        ),
      },
      result: updatedItem,
    }
  })
}

export async function deleteItem(itemId: string): Promise<void> {
  updateStoreDatabase((database) => {
    if (!database.items.some((item) => item.id === itemId)) {
      throw new Error(`Remembered item ${itemId} was not found.`)
    }

    return {
      database: {
        ...database,
        items: database.items.filter((item) => item.id !== itemId),
      },
      result: undefined,
    }
  })
}

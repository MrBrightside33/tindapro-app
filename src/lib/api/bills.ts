import {
  createRecordId,
  readStoreDatabase,
  requireNonNegativeAmount,
  requireValidDate,
  updateStoreDatabase,
} from "@/lib/api/storage"
import type { Bill, NewBill } from "@/types/domain"

function validateBill(bill: Omit<Bill, "id">): void {
  if (!bill.description.trim()) {
    throw new Error("Bill description cannot be empty.")
  }
  if (!bill.date) {
    throw new Error("Bill date is required.")
  }
  requireValidDate(bill.date)
  if (bill.dueDate !== null) {
    requireValidDate(bill.dueDate)
  }
  requireNonNegativeAmount(bill.amount, "Bill amount")
}

export async function getBills(): Promise<Bill[]> {
  return readStoreDatabase().bills
}

export async function createBill(input: NewBill): Promise<Bill> {
  validateBill(input)
  const bill: Bill = {
    ...input,
    description: input.description.trim(),
    id: createRecordId("bill"),
  }

  return updateStoreDatabase((database) => ({
    database: { ...database, bills: [...database.bills, bill] },
    result: bill,
  }))
}

export async function updateBill(
  billId: string,
  input: Partial<NewBill>
): Promise<Bill> {
  return updateStoreDatabase((database) => {
    const existing = database.bills.find((bill) => bill.id === billId)
    if (!existing) {
      throw new Error(`Bill ${billId} was not found.`)
    }

    const merged = { ...existing, ...input }
    validateBill(merged)
    const updatedBill = {
      ...merged,
      description: merged.description.trim(),
    }

    return {
      database: {
        ...database,
        bills: database.bills.map((bill) =>
          bill.id === billId ? updatedBill : bill
        ),
      },
      result: updatedBill,
    }
  })
}

export async function deleteBill(billId: string): Promise<void> {
  updateStoreDatabase((database) => {
    if (!database.bills.some((bill) => bill.id === billId)) {
      throw new Error(`Bill ${billId} was not found.`)
    }
    return {
      database: {
        ...database,
        bills: database.bills.filter((bill) => bill.id !== billId),
      },
      result: undefined,
    }
  })
}

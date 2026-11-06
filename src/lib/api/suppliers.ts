import {
  createRecordId,
  readStoreDatabase,
  updateStoreDatabase,
} from "@/lib/api/storage"
import type { NewSupplier, Supplier } from "@/types/domain"

function normalizeSupplier(input: NewSupplier): NewSupplier {
  const normalized = {
    name: input.name.trim(),
    contact: input.contact.trim(),
    productCategory: input.productCategory.trim(),
    deliveryFrequency: input.deliveryFrequency.trim(),
  }
  if (Object.values(normalized).some((value) => value.length === 0)) {
    throw new Error("Supplier fields cannot be empty.")
  }
  return normalized
}

export async function getSuppliers(): Promise<Supplier[]> {
  return readStoreDatabase().suppliers
}

export async function createSupplier(
  input: NewSupplier
): Promise<Supplier> {
  const supplier: Supplier = {
    ...normalizeSupplier(input),
    id: createRecordId("supplier"),
  }

  return updateStoreDatabase((database) => ({
    database: {
      ...database,
      suppliers: [...database.suppliers, supplier],
    },
    result: supplier,
  }))
}

export async function updateSupplier(
  supplierId: string,
  input: Partial<NewSupplier>
): Promise<Supplier> {
  return updateStoreDatabase((database) => {
    const existing = database.suppliers.find(
      (supplier) => supplier.id === supplierId
    )
    if (!existing) {
      throw new Error(`Supplier ${supplierId} was not found.`)
    }
    const updatedSupplier = {
      ...normalizeSupplier({ ...existing, ...input }),
      id: supplierId,
    }

    return {
      database: {
        ...database,
        suppliers: database.suppliers.map((supplier) =>
          supplier.id === supplierId ? updatedSupplier : supplier
        ),
      },
      result: updatedSupplier,
    }
  })
}

export async function deleteSupplier(supplierId: string): Promise<void> {
  updateStoreDatabase((database) => {
    if (!database.suppliers.some((supplier) => supplier.id === supplierId)) {
      throw new Error(`Supplier ${supplierId} was not found.`)
    }
    return {
      database: {
        ...database,
        suppliers: database.suppliers.filter(
          (supplier) => supplier.id !== supplierId
        ),
      },
      result: undefined,
    }
  })
}

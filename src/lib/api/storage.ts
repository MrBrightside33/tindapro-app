import { createSeedData } from "@/lib/seed/seed-data"
import type { Note, StoreDatabase } from "@/types/domain"

const storageKey = "tindapro-store-data-v1"

interface LegacyStoreDatabase {
  schemaVersion: 1
  sales: StoreDatabase["sales"]
  items: StoreDatabase["items"]
  services: StoreDatabase["services"]
  bills: StoreDatabase["bills"]
  suppliers: StoreDatabase["suppliers"]
  notes?: Note[]
}

function isLegacyStoreDatabase(
  value: unknown
): value is LegacyStoreDatabase {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const database = value as Partial<LegacyStoreDatabase>
  return (
    database.schemaVersion === 1 &&
    Array.isArray(database.sales) &&
    Array.isArray(database.items) &&
    Array.isArray(database.services) &&
    Array.isArray(database.bills) &&
    Array.isArray(database.suppliers) &&
    (database.notes === undefined || Array.isArray(database.notes))
  )
}

export function readStoreDatabase(): StoreDatabase {
  if (typeof window === "undefined") {
    throw new Error("TindaPro local data can only be accessed in a browser.")
  }

  const storedValue = window.localStorage.getItem(storageKey)
  if (storedValue === null) {
    const seedData = createSeedData()
    writeStoreDatabase(seedData)
    return seedData
  }

  let parsedValue: unknown
  try {
    parsedValue = JSON.parse(storedValue)
  } catch (error) {
    throw new Error("Saved TindaPro data could not be parsed.", { cause: error })
  }

  if (!isLegacyStoreDatabase(parsedValue)) {
    throw new Error(
      "Saved TindaPro data has an unsupported or invalid structure."
    )
  }

  if (parsedValue.notes !== undefined) {
    return {
      ...parsedValue,
      notes: parsedValue.notes,
    }
  }

  const migratedDatabase: StoreDatabase = {
    ...parsedValue,
    notes: [],
  }
  writeStoreDatabase(migratedDatabase)
  return migratedDatabase
}

export function writeStoreDatabase(database: StoreDatabase): void {
  if (typeof window === "undefined") {
    throw new Error("TindaPro local data can only be accessed in a browser.")
  }

  window.localStorage.setItem(storageKey, JSON.stringify(database))
}

export function updateStoreDatabase<Result>(
  update: (database: StoreDatabase) => {
    database: StoreDatabase
    result: Result
  }
): Result {
  const currentDatabase = readStoreDatabase()
  const updateResult = update(currentDatabase)
  writeStoreDatabase(updateResult.database)
  return updateResult.result
}

export function createRecordId(prefix: string): string {
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    throw new Error("This browser does not support secure record IDs.")
  }

  return `${prefix}-${crypto.randomUUID()}`
}

export function requireValidDate(value: string): void {
  if (!Number.isFinite(Date.parse(value))) {
    throw new Error(`Invalid date: ${value}`)
  }
}

export function requireNonNegativeAmount(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a non-negative number.`)
  }
}

export function requirePositiveQuantity(value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("Quantity must be a positive whole number.")
  }
}

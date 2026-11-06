import {
  createRecordId,
  readStoreDatabase,
  requireNonNegativeAmount,
  requirePositiveQuantity,
  requireValidDate,
  updateStoreDatabase,
} from "@/lib/api/storage"
import type {
  NewServiceIncome,
  ServiceIncome,
} from "@/types/domain"

function validateService(input: NewServiceIncome): void {
  if (!input.serviceName.trim()) {
    throw new Error("Service name cannot be empty.")
  }
  requirePositiveQuantity(input.quantity)
  requireNonNegativeAmount(input.sellingPrice, "Selling price")
  requireNonNegativeAmount(input.costPrice, "Cost price")
  if (input.date) {
    requireValidDate(input.date)
  }
}

export async function getServices(): Promise<ServiceIncome[]> {
  return readStoreDatabase().services
}

export async function createService(
  input: NewServiceIncome
): Promise<ServiceIncome> {
  validateService(input)
  const service: ServiceIncome = {
    ...input,
    serviceName: input.serviceName.trim(),
    date: input.date ?? new Date().toISOString(),
    id: createRecordId("service"),
  }

  return updateStoreDatabase((database) => ({
    database: { ...database, services: [...database.services, service] },
    result: service,
  }))
}

export async function updateService(
  serviceId: string,
  input: Partial<NewServiceIncome>
): Promise<ServiceIncome> {
  return updateStoreDatabase((database) => {
    const existing = database.services.find(
      (service) => service.id === serviceId
    )
    if (!existing) {
      throw new Error(`Service record ${serviceId} was not found.`)
    }

    const merged = { ...existing, ...input }
    validateService(merged)
    const updatedService = {
      ...merged,
      serviceName: merged.serviceName.trim(),
    }

    return {
      database: {
        ...database,
        services: database.services.map((service) =>
          service.id === serviceId ? updatedService : service
        ),
      },
      result: updatedService,
    }
  })
}

export async function deleteService(serviceId: string): Promise<void> {
  updateStoreDatabase((database) => {
    if (!database.services.some((service) => service.id === serviceId)) {
      throw new Error(`Service record ${serviceId} was not found.`)
    }

    return {
      database: {
        ...database,
        services: database.services.filter(
          (service) => service.id !== serviceId
        ),
      },
      result: undefined,
    }
  })
}

import { readStoreDatabase } from "@/lib/api/storage"

export {
  createBill,
  deleteBill,
  getBills,
  updateBill,
} from "@/lib/api/bills"
export { deleteItem, getItems, updateItemPrices } from "@/lib/api/items"
export {
  createSale,
  getSales,
  updateSale,
  voidSale,
} from "@/lib/api/sales"
export {
  createService,
  deleteService,
  getServices,
  updateService,
} from "@/lib/api/services"
export {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "@/lib/api/suppliers"

export async function getSeedRecordCounts() {
  const database = readStoreDatabase()
  return {
    sales: database.sales.length,
    salesLines: database.sales.reduce(
      (total, sale) => total + sale.lines.length,
      0
    ),
    items: database.items.length,
    bills: database.bills.length,
    services: database.services.length,
    suppliers: database.suppliers.length,
  }
}

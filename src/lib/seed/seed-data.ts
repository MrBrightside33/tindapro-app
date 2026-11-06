import { buildItemPriceMemory } from "@/lib/accounting/item-price-memory"
import type {
  Bill,
  BillCategory,
  ItemCategory,
  Sale,
  ServiceIncome,
  StoreDatabase,
  Supplier,
} from "@/types/domain"

const itemCatalog: ReadonlyArray<{
  name: string
  category: ItemCategory
  sellingPrice: number
  costPrice: number
}> = [
  { name: "Lucky Me Pancit Canton", category: "Noodles", sellingPrice: 16, costPrice: 12 },
  { name: "Lucky Me Chicken Noodles", category: "Noodles", sellingPrice: 15, costPrice: 11 },
  { name: "Payless Xtra Big", category: "Noodles", sellingPrice: 17, costPrice: 13 },
  { name: "Cup Noodles Seafood", category: "Noodles", sellingPrice: 32, costPrice: 26 },
  { name: "Great Taste White", category: "Grocery", sellingPrice: 8, costPrice: 5.5 },
  { name: "Kopiko Brown 3-in-1", category: "Grocery", sellingPrice: 9, costPrice: 6 },
  { name: "Nescafe Creamy White", category: "Grocery", sellingPrice: 10, costPrice: 7 },
  { name: "Milo Sachet", category: "Grocery", sellingPrice: 12, costPrice: 8.5 },
  { name: "Coke Sakto", category: "Drinks", sellingPrice: 18, costPrice: 13 },
  { name: "Sprite Sakto", category: "Drinks", sellingPrice: 18, costPrice: 13 },
  { name: "Royal Tru-Orange", category: "Drinks", sellingPrice: 18, costPrice: 13 },
  { name: "Mountain Dew", category: "Drinks", sellingPrice: 18, costPrice: 13 },
  { name: "Bottled Water 500ml", category: "Drinks", sellingPrice: 15, costPrice: 9 },
  { name: "Zesto Orange", category: "Drinks", sellingPrice: 10, costPrice: 6 },
  { name: "Chuckie Chocolate Milk", category: "Drinks", sellingPrice: 22, costPrice: 17 },
  { name: "Fita Crackers", category: "Snacks", sellingPrice: 8, costPrice: 5 },
  { name: "SkyFlakes", category: "Snacks", sellingPrice: 8, costPrice: 5 },
  { name: "Oishi Prawn Crackers", category: "Snacks", sellingPrice: 12, costPrice: 8 },
  { name: "Piattos Cheese", category: "Snacks", sellingPrice: 20, costPrice: 15 },
  { name: "Nova Multigrain", category: "Snacks", sellingPrice: 20, costPrice: 15 },
  { name: "Chippy BBQ", category: "Snacks", sellingPrice: 10, costPrice: 6.5 },
  { name: "Boy Bawang Garlic", category: "Snacks", sellingPrice: 10, costPrice: 6 },
  { name: "Cloud 9 Chocolate Bar", category: "Snacks", sellingPrice: 12, costPrice: 8 },
  { name: "Rebisco Sandwich", category: "Snacks", sellingPrice: 10, costPrice: 6 },
  { name: "Safeguard Soap", category: "Toiletries", sellingPrice: 22, costPrice: 16 },
  { name: "Sunsilk Shampoo Sachet", category: "Toiletries", sellingPrice: 7, costPrice: 4 },
  { name: "Cream Silk Conditioner Sachet", category: "Toiletries", sellingPrice: 7, costPrice: 4 },
  { name: "Head & Shoulders Sachet", category: "Toiletries", sellingPrice: 9, costPrice: 5.5 },
  { name: "Colgate Toothpaste Sachet", category: "Toiletries", sellingPrice: 8, costPrice: 5 },
  { name: "Closeup Toothpaste Sachet", category: "Toiletries", sellingPrice: 8, costPrice: 5 },
  { name: "Downy Fabric Conditioner Sachet", category: "Toiletries", sellingPrice: 8, costPrice: 5 },
  { name: "Ariel Detergent Sachet", category: "Toiletries", sellingPrice: 9, costPrice: 6 },
  { name: "Tide Detergent Sachet", category: "Toiletries", sellingPrice: 8, costPrice: 5.5 },
  { name: "Joy Dishwashing Sachet", category: "Toiletries", sellingPrice: 7, costPrice: 4.5 },
  { name: "White Sugar 250g", category: "Grocery", sellingPrice: 18, costPrice: 14 },
  { name: "Rice per Kilo", category: "Grocery", sellingPrice: 58, costPrice: 50 },
  { name: "Egg", category: "Grocery", sellingPrice: 10, costPrice: 7.5 },
  { name: "Century Tuna Small", category: "Grocery", sellingPrice: 32, costPrice: 25 },
  { name: "555 Sardines", category: "Grocery", sellingPrice: 25, costPrice: 19 },
  { name: "Argentina Corned Beef", category: "Grocery", sellingPrice: 35, costPrice: 28 },
  { name: "Lucky 7 Meatloaf", category: "Grocery", sellingPrice: 26, costPrice: 20 },
  { name: "Datu Puti Soy Sauce", category: "Grocery", sellingPrice: 12, costPrice: 8 },
  { name: "Datu Puti Vinegar", category: "Grocery", sellingPrice: 12, costPrice: 8 },
  { name: "Silver Swan Soy Sauce", category: "Grocery", sellingPrice: 14, costPrice: 9 },
  { name: "Knorr Chicken Cube", category: "Grocery", sellingPrice: 9, costPrice: 5 },
  { name: "Magic Sarap Sachet", category: "Grocery", sellingPrice: 4, costPrice: 2 },
  { name: "Cooking Oil 250ml", category: "Grocery", sellingPrice: 32, costPrice: 26 },
  { name: "Bear Brand Fortified Sachet", category: "Grocery", sellingPrice: 11, costPrice: 7 },
  { name: "Alaska Evaporada Small", category: "Grocery", sellingPrice: 28, costPrice: 22 },
  { name: "White Bread Loaf", category: "Grocery", sellingPrice: 45, costPrice: 36 },
  { name: "Pan de Coco", category: "Snacks", sellingPrice: 12, costPrice: 8 },
  { name: "Choc Nut", category: "Snacks", sellingPrice: 2, costPrice: 1 },
  { name: "White Rabbit Candy", category: "Snacks", sellingPrice: 2, costPrice: 1 },
  { name: "Mentos Mint", category: "Snacks", sellingPrice: 2, costPrice: 1 },
  { name: "Fortune Cigarettes", category: "Cigarettes", sellingPrice: 7, costPrice: 5.5 },
  { name: "Marlboro Red", category: "Cigarettes", sellingPrice: 8, costPrice: 6.5 },
]

const serviceNames = [
  { name: "Photocopy - black and white", price: 2, cost: 0.25 },
  { name: "Document printing", price: 5, cost: 1.5 },
  { name: "Phone charging", price: 10, cost: 1 },
  { name: "Water refill", price: 25, cost: 12 },
  { name: "Lamination - ID size", price: 20, cost: 8 },
]

const billCategories: readonly BillCategory[] = [
  "electricity",
  "water",
  "rent",
  "transport",
  "restocking",
  "other",
]

const supplierNames = [
  "San Miguel Foods Distributor",
  "Puregold Wholesale - Quezon City",
  "Lucky Mart Grocery Supply",
  "Metro Manila Beverage Trading",
  "Golden Grains Rice Dealer",
  "North Star Consumer Goods",
  "Rizal Snack and Biscuit Supply",
  "Community Fresh Eggs",
  "Reliable Tobacco Products",
  "Caloocan General Merchandise",
  "Sunrise Household Supplies",
]

const supplierCategories = [
  "Noodles and canned goods",
  "Beverages",
  "Rice and grains",
  "Snacks and biscuits",
  "Personal care",
  "Household goods",
  "Eggs and bread",
]

const deliveryFrequencies = [
  "Daily",
  "Twice a week",
  "Weekly",
  "Every two weeks",
]

function createRandom(seed: number): () => number {
  let state = seed >>> 0

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function pick<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)]
}

function dateDaysAgo(referenceDate: Date, daysAgo: number): string {
  const date = new Date(referenceDate)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(12, 0, 0, 0)
  return date.toISOString()
}

function dateDaysAhead(referenceDate: Date, daysAhead: number): string {
  const date = new Date(referenceDate)
  date.setDate(date.getDate() + daysAhead)
  date.setHours(12, 0, 0, 0)
  return date.toISOString()
}

export function createSeedData(referenceDate = new Date()): StoreDatabase {
  const random = createRandom(20251104)
  const saleCount = 100
  const sales: Sale[] = Array.from({ length: saleCount }, (_, index) => {
    const daysAgo = Math.round(
      364 - (index / (saleCount - 1)) * 364
    )
    const firstItem = itemCatalog[index % itemCatalog.length]
    const secondItem = pick(itemCatalog, random)
    const selectedItems = [firstItem, secondItem]

    return {
      id: `seed-sale-${String(index + 1).padStart(3, "0")}`,
      date: dateDaysAgo(referenceDate, daysAgo),
      status: "completed",
      lines: selectedItems.map((item, lineIndex) => {
        const priceChange = Math.floor(random() * 3) * 0.5

        return {
          id: `seed-line-${String(index + 1).padStart(3, "0")}-${lineIndex + 1}`,
          itemName: item.name,
          category: item.category,
          quantity: 1 + Math.floor(random() * 5),
          sellingPrice: item.sellingPrice + priceChange,
          costPrice: item.costPrice + priceChange * 0.4,
        }
      }),
    }
  })

  const services: ServiceIncome[] = Array.from({ length: 60 }, (_, index) => {
    const service = serviceNames[index % serviceNames.length]

    return {
      id: `seed-service-${String(index + 1).padStart(3, "0")}`,
      date: dateDaysAgo(referenceDate, Math.floor((index / 59) * 364)),
      serviceName: service.name,
      quantity: 1 + Math.floor(random() * 4),
      sellingPrice: service.price,
      costPrice: service.cost,
    }
  })

  const bills: Bill[] = Array.from({ length: 65 }, (_, index) => {
    const category = billCategories[index % billCategories.length]
    const daysAgo = Math.floor((index / 64) * 364)
    const date = dateDaysAgo(referenceDate, daysAgo)
    const status = index % 7 === 0 ? "unpaid" : "paid"
    const description =
      category === "restocking"
        ? "Goods for resale"
        : `${category[0].toUpperCase()}${category.slice(1)} bill`

    return {
      id: `seed-bill-${String(index + 1).padStart(3, "0")}`,
      date,
      dueDate:
        status === "unpaid" ? dateDaysAhead(new Date(date), 5) : null,
      category,
      description,
      amount:
        category === "electricity"
          ? 650 + Math.floor(random() * 900)
          : category === "rent"
            ? 4000
            : category === "restocking"
              ? 500 + Math.floor(random() * 2500)
              : 100 + Math.floor(random() * 800),
      status,
    }
  })

  const suppliers: Supplier[] = Array.from({ length: 55 }, (_, index) => ({
    id: `seed-supplier-${String(index + 1).padStart(3, "0")}`,
    name: `${supplierNames[index % supplierNames.length]} ${String(index + 1).padStart(2, "0")}`,
    contact: `09${String(170000000 + index * 7919).slice(0, 9)}`,
    productCategory: supplierCategories[index % supplierCategories.length],
    deliveryFrequency:
      deliveryFrequencies[index % deliveryFrequencies.length],
  }))

  return {
    schemaVersion: 1,
    sales,
    items: buildItemPriceMemory(sales),
    services,
    bills,
    suppliers,
    notes: [],
  }
}

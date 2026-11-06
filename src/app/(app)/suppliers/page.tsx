import { PageHeader } from "@/components/common/page-header"
import { SuppliersManager } from "@/components/features/suppliers/suppliers-manager"

export default function SuppliersPage() {
  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Keep supplier contacts, product categories, and delivery schedules organized."
      />
      <SuppliersManager />
    </>
  )
}

import { PageHeader } from "@/components/common/page-header"
import { BillsManager } from "@/components/features/bills/bills-manager"

export default function BillsPage() {
  return (
    <>
      <PageHeader
        title="Bills"
        description="Track store expenses, due dates, and payment status."
      />
      <BillsManager />
    </>
  )
}

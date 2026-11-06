import type { RecordStatus } from "@/types/domain"

const statusClassNames: Record<RecordStatus, string> = {
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  unpaid: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
}

export function StatusBadge({ status }: { status: RecordStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClassNames[status]}`}
    >
      {status}
    </span>
  )
}

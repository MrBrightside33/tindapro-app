import { PageHeader } from "@/components/common/page-header"
import { NotesManager } from "@/components/features/notes/notes-manager"

export default function NotesPage() {
  return (
    <>
      <PageHeader
        title="Notes"
        description="Save store reminders and useful details for later."
      />
      <NotesManager />
    </>
  )
}

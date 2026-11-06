import { PageHeader } from "@/components/common/page-header"
import { WorkspaceWelcome } from "@/components/features/overview/workspace-welcome"

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="A foundation for monitoring your store and understanding its performance."
      />
      <WorkspaceWelcome />
    </>
  )
}

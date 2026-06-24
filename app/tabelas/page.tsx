import { DashboardHeader } from "@/components/dashboard-header"
import { TablesCatalog } from "@/components/tables-catalog"

export default function TabelasPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <TablesCatalog />
      </main>
    </div>
  )
}

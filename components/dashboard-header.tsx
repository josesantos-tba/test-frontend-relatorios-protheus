import { FileBarChart } from "lucide-react"
import { MainNav } from "@/components/main-nav"

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileBarChart className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight text-foreground text-balance">
              Portal de Relatórios
            </h1>
            <p className="text-sm text-muted-foreground">
              Consulte, visualize e exporte seus relatórios operacionais
            </p>
          </div>
        </div>
        <MainNav />
      </div>
    </header>
  )
}

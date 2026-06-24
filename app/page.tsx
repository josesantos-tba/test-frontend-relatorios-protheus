"use client"

import { useState } from "react"
import { AlertCircle, FileSearch } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ReportFiltersCard } from "@/components/report-filters"
import { ReportTable } from "@/components/report-table"
import { REPORTS, type ReportFilters, type ReportResponse } from "@/lib/types"

function today(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const initialFilters: ReportFilters = {
  areaId: "custos",
  reportId: REPORTS[0].id,
  filialId: "TBA01",
  startDate: today(-30),
  endDate: today(),
}

export default function Page() {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters)
  const [data, setData] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? "Erro ao gerar relatório.")
      }
      setData((await res.json()) as ReportResponse)
    } catch (err) {
      setError((err as Error).message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <ReportFiltersCard
          filters={filters}
          onChange={setFilters}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {data ? (
          <ReportTable rows={data.rows} />
        ) : (
          !error && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <FileSearch className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Nenhum relatório gerado ainda
                </p>
                <p className="text-sm text-muted-foreground">
                  Selecione os filtros acima e clique em &quot;Gerar
                  Relatório&quot; para visualizar os dados.
                </p>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}

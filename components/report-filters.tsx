"use client"

import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AREAS, FILIAIS, REPORTS, type ReportFilters } from "@/lib/types"

type Props = {
  filters: ReportFilters
  onChange: (filters: ReportFilters) => void
  onSubmit: () => void
  loading: boolean
}

export function ReportFiltersCard({
  filters,
  onChange,
  onSubmit,
  loading,
}: Props) {
  const availableReports = REPORTS.filter((r) => r.areaId === filters.areaId)

  function update(patch: Partial<ReportFilters>) {
    onChange({ ...filters, ...patch })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filtros do relatório</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="area">Área</Label>
            <Select
              value={filters.areaId}
              onValueChange={(value) => {
                const firstReport = REPORTS.find((r) => r.areaId === value)
                update({ areaId: value ?? "", reportId: firstReport?.id ?? "" })
              }}
            >
              <SelectTrigger id="area" className="w-full">
                <SelectValue placeholder="Selecione a área" />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="relatorio">Relatório</Label>
            <Select
              value={filters.reportId}
              onValueChange={(value) => update({ reportId: value ?? "" })}
            >
              <SelectTrigger id="relatorio" className="w-full">
                <SelectValue placeholder="Selecione o relatório" />
              </SelectTrigger>
              <SelectContent>
                {availableReports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="filial">Filial</Label>
            <Select
              value={filters.filialId}
              onValueChange={(value) => update({ filialId: value ?? "" })}
            >
              <SelectTrigger id="filial" className="w-full">
                <SelectValue placeholder="Selecione a filial" />
              </SelectTrigger>
              <SelectContent>
                {FILIAIS.map((filial) => (
                  <SelectItem key={filial.id} value={filial.id}>
                    {filial.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dataInicial">Data Inicial</Label>
            <Input
              id="dataInicial"
              type="date"
              value={filters.startDate}
              onChange={(e) => update({ startDate: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dataFinal">Data Final</Label>
            <Input
              id="dataFinal"
              type="date"
              value={filters.endDate}
              onChange={(e) => update({ endDate: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="size-4" aria-hidden="true" />
              )}
              {loading ? "Gerando..." : "Gerar Relatório"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

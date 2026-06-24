"use client"

import { useMemo, useState } from "react"
import { Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogCloseButton,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { RAW_TABLES, type RawTable } from "@/lib/tables"

function today(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const LIMIT_OPTIONS = [
  { value: "100", label: "100 registros" },
  { value: "500", label: "500 registros" },
  { value: "1000", label: "1.000 registros" },
  { value: "5000", label: "5.000 registros" },
  { value: "0", label: "Todos os registros" },
]

function TableListItem({
  table,
  onSelect,
}: {
  table: RawTable
  onSelect: (table: RawTable) => void
}) {
  return (
    <TableRow
      className="group cursor-pointer"
      onClick={() => onSelect(table)}
      title={`Configurar download: ${table.code} - ${table.name}`}
    >
      <TableCell className="text-sm">
        {table.code} - {table.name}
      </TableCell>
      <TableCell className="w-8 pr-4 text-right">
        <Download
          className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </TableCell>
    </TableRow>
  )
}

export function TablesCatalog() {
  const [query, setQuery] = useState("")
  const [selectedTable, setSelectedTable] = useState<RawTable | null>(null)
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState(today(-30))
  const [endDate, setEndDate] = useState(today())
  const [limit, setLimit] = useState("1000")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return RAW_TABLES
    return RAW_TABLES.filter((table) => {
      const haystack = [
        table.code,
        table.name,
        table.technicalName,
        table.description,
        ...table.columns,
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [query])

  function handleSelect(table: RawTable) {
    setSelectedTable(table)
    setOpen(true)
  }

  function handleDownload() {
    if (!selectedTable) return
    const params = new URLSearchParams({ id: selectedTable.id, startDate, endDate })
    if (limit !== "0") params.set("limit", limit)
    window.location.href = `/api/tables/download?${params}`
    setOpen(false)
  }

  return (
    <>
      <div className="mx-auto w-full max-w-xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite codigo da tabela ou descricao."
                aria-label="Pesquisar tabela"
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Tabelas{" "}
              <span className="font-normal text-muted-foreground">
                ({filtered.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                <div className="max-h-[28rem] overflow-y-auto">
                  <Table>
<TableBody>
                      {filtered.map((table) => (
                        <TableListItem key={table.id} table={table} onSelect={handleSelect} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nenhuma tabela encontrada para &quot;{query}&quot;.
              </p>
            )}
          </CardContent>
        </Card>

        <p className="px-4 text-center text-xs text-muted-foreground">
          Clique em uma tabela para configurar e baixar os dados em CSV.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPopup>
          <DialogHeader>
            <div>
              <DialogTitle>
                {selectedTable?.code} &mdash; {selectedTable?.name}
              </DialogTitle>
              {selectedTable?.description && (
                <DialogDescription>{selectedTable.description}</DialogDescription>
              )}
            </div>
            <DialogCloseButton />
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="dl-start">Data inicial</Label>
                <Input
                  id="dl-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dl-end">Data final</Label>
                <Input
                  id="dl-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dl-limit">Limite de registros</Label>
              <Select value={limit} onValueChange={(v) => setLimit(v ?? "1000")}>
                <SelectTrigger id="dl-limit" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <DialogClose
              render={
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              }
            />
            <Button type="button" onClick={handleDownload}>
              <Download className="size-4" aria-hidden="true" />
              Baixar CSV
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    </>
  )
}

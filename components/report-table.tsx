"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { downloadReportCsv } from "@/lib/csv"
import type { ReportRow } from "@/lib/types"

type Props = {
  rows: ReportRow[]
}

const numberFormat = new Intl.NumberFormat("pt-BR")

export function ReportTable({ rows }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-base">
          Resultados{" "}
          <span className="font-normal text-muted-foreground">
            ({numberFormat.format(rows.length)})
          </span>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadReportCsv(rows)}
          disabled={rows.length === 0}
        >
          <Download className="size-4" aria-hidden="true" />
          Baixar Excel
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data</TableHead>
                <TableHead>Filial</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Nenhum resultado para exibir.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={`${row.data}-${row.produto}-${index}`}>
                    <TableCell className="font-medium tabular-nums">
                      {row.data}
                    </TableCell>
                    <TableCell>{row.filial}</TableCell>
                    <TableCell>{row.produto}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {numberFormat.format(row.saldo)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

import { NextResponse } from "next/server"
import type { ReportFilters, ReportResponse, ReportRow } from "@/lib/types"

/**
 * ===========================================================================
 *  PONTO DE INTEGRAÇÃO COM A SUA API
 * ===========================================================================
 *  Esta rota roda no servidor, então é o lugar ideal para chamar a sua API
 *  interna (inclusive usando tokens/segredos via variáveis de ambiente, sem
 *  expô-los ao navegador).
 *
 *  Para conectar a sua API, defina a variável de ambiente REPORTS_API_URL e
 *  ajuste o mapeamento da resposta em `fetchFromBackend` abaixo. Enquanto a
 *  variável não estiver definida, a rota devolve dados de exemplo para que a
 *  interface funcione normalmente.
 * ===========================================================================
 */

async function fetchFromBackend(
  filters: ReportFilters,
): Promise<ReportRow[] | null> {
  const baseUrl = process.env.REPORTS_API_URL
  if (!baseUrl) return null

  const params = new URLSearchParams({
    area: filters.areaId,
    relatorio: filters.reportId,
    filial: filters.filialId,
    dataInicial: filters.startDate,
    dataFinal: filters.endDate,
  })

  const res = await fetch(`${baseUrl}?${params.toString()}`, {
    headers: process.env.REPORTS_API_TOKEN
      ? { Authorization: `Bearer ${process.env.REPORTS_API_TOKEN}` }
      : undefined,
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`API respondeu com status ${res.status}`)
  }

  const data = await res.json()

  // Ajuste este mapeamento conforme o formato retornado pela sua API.
  return (data.rows ?? data).map(
    (item: Record<string, unknown>): ReportRow => ({
      data: String(item.data ?? item.date ?? ""),
      filial: String(item.filial ?? item.branch ?? ""),
      produto: String(item.produto ?? item.product ?? ""),
      saldo: Number(item.saldo ?? item.balance ?? 0),
    }),
  )
}

function buildMockRows(filters: ReportFilters): ReportRow[] {
  const produtos = [
    "Açaí Amarena",
    "Açaí Tradicional",
    "Sorvete Chocolate",
    "Sorvete Morango",
    "Picolé Limão",
    "Creme Avelã",
  ]
  const filiais = filters.filialId ? [filters.filialId] : ["TBA01", "TBA02", "TBA03"]

  const start = filters.startDate ? new Date(filters.startDate) : new Date()
  const rows: ReportRow[] = []
  const days = 14

  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const count = 1 + (i % 3)
    for (let j = 0; j < count; j++) {
      const seed = i * 7 + j * 13
      rows.push({
        data: dateStr,
        filial: filiais[seed % filiais.length],
        produto: produtos[seed % produtos.length],
        saldo: 1000 + ((seed * 137) % 9000),
      })
    }
  }
  return rows
}

function aggregate(rows: ReportRow[]): ReportResponse {
  const timelineMap = new Map<string, number>()
  const filialMap = new Map<string, number>()

  for (const row of rows) {
    timelineMap.set(row.data, (timelineMap.get(row.data) ?? 0) + row.saldo)
    filialMap.set(row.filial, (filialMap.get(row.filial) ?? 0) + row.saldo)
  }

  const timeline = [...timelineMap.entries()]
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const byFilial = [...filialMap.entries()]
    .map(([filial, total]) => ({ filial, total }))
    .sort((a, b) => b.total - a.total)

  return { rows, timeline, byFilial }
}

export async function POST(request: Request) {
  try {
    const filters = (await request.json()) as ReportFilters

    let rows: ReportRow[] | null = null
    try {
      rows = await fetchFromBackend(filters)
    } catch (err) {
      console.log("[v0] Erro ao consultar API externa:", (err as Error).message)
      return NextResponse.json(
        { error: "Não foi possível consultar a API de relatórios." },
        { status: 502 },
      )
    }

    if (!rows) {
      rows = buildMockRows(filters)
    }

    return NextResponse.json(aggregate(rows))
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 400 },
    )
  }
}

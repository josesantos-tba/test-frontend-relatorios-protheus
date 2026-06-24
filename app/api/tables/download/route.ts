import { RAW_TABLES, type RawTable } from "@/lib/tables"

/**
 * ===========================================================================
 *  PONTO DE INTEGRAÇÃO COM A SUA API
 * ===========================================================================
 *  Esta rota gera o download da tabela bruta em formato CSV (separado por ";",
 *  compatível com Excel em pt-BR). Roda no servidor, então é seguro chamar a
 *  sua API interna usando tokens via variáveis de ambiente.
 *
 *  Para conectar à sua API, defina TABLES_API_URL e ajuste `fetchRawRows`.
 *  Enquanto a variável não estiver definida, são gerados dados de exemplo.
 * ===========================================================================
 */

function escapeCsv(value: unknown): string {
  const str = value == null ? "" : String(value)
  if (/[";\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

type DownloadParams = {
  startDate?: string
  endDate?: string
  limit?: number
}

async function fetchRawRows(
  table: RawTable,
  params: DownloadParams,
): Promise<Record<string, unknown>[] | null> {
  const baseUrl = process.env.TABLES_API_URL
  if (!baseUrl) return null

  const qs = new URLSearchParams({ id: table.id })
  if (params.startDate) qs.set("startDate", params.startDate)
  if (params.endDate) qs.set("endDate", params.endDate)
  if (params.limit) qs.set("limit", String(params.limit))

  const res = await fetch(`${baseUrl}/${table.id}?${qs}`, {
    headers: process.env.TABLES_API_TOKEN
      ? { Authorization: `Bearer ${process.env.TABLES_API_TOKEN}` }
      : undefined,
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`API respondeu com status ${res.status}`)
  }

  const data = await res.json()
  return (data.rows ?? data) as Record<string, unknown>[]
}

/** Gera linhas de exemplo respeitando as colunas declaradas no catálogo. */
function buildMockRows(
  table: RawTable,
  { startDate, endDate, limit }: DownloadParams = {},
): Record<string, unknown>[] {
  const produtos = [
    "Açaí Amarena",
    "Açaí Tradicional",
    "Sorvete Chocolate",
    "Sorvete Morango",
    "Picolé Limão",
  ]
  const filiais = ["TBA01", "TBA02", "TBA03", "TBA04"]

  const start = startDate
    ? new Date(startDate + "T00:00:00")
    : new Date(Date.now() - 30 * 86_400_000)
  const end = endDate ? new Date(endDate + "T00:00:00") : new Date()
  const rangeMs = Math.max(0, end.getTime() - start.getTime())
  const rangeDays = Math.round(rangeMs / 86_400_000) + 1

  const maxRows = limit ? Math.min(limit, table.rowCount) : Math.min(100, table.rowCount)
  const rows: Record<string, unknown>[] = []

  for (let i = 0; i < maxRows; i++) {
    const seed = i * 31
    const dayOffset = rangeDays > 0 ? i % rangeDays : 0
    const d = new Date(start.getTime() + dayOffset * 86_400_000)
    const row: Record<string, unknown> = {}
    for (const col of table.columns) {
      if (col.includes("data") || col === "emissao" || col === "vencimento") {
        row[col] = d.toISOString().slice(0, 10)
      } else if (col === "filial") {
        row[col] = filiais[seed % filiais.length]
      } else if (col === "produto") {
        row[col] = produtos[seed % produtos.length]
      } else if (
        col.includes("valor") ||
        col.includes("custo") ||
        col === "saldo" ||
        col === "faturamento" ||
        col === "ticket_medio"
      ) {
        row[col] = (1000 + ((seed * 137) % 9000)) / 100
      } else if (col === "quantidade" || col === "saldo_acumulado") {
        row[col] = 1 + ((seed * 7) % 500)
      } else if (col === "ativo") {
        row[col] = seed % 5 === 0 ? "Não" : "Sim"
      } else {
        row[col] = `${col}_${i + 1}`
      }
    }
    rows.push(row)
  }
  return rows
}

function toCsv(table: RawTable, rows: Record<string, unknown>[]): string {
  const headers = table.columns
  const lines = [
    headers.join(";"),
    ...rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(";")),
  ]
  // BOM para o Excel reconhecer acentuação UTF-8 corretamente.
  return "\uFEFF" + lines.join("\n")
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const startDate = searchParams.get("startDate") ?? undefined
  const endDate = searchParams.get("endDate") ?? undefined
  const limitRaw = searchParams.get("limit")
  const limit = limitRaw ? parseInt(limitRaw, 10) : undefined
  const params: DownloadParams = { startDate, endDate, limit }

  const table = RAW_TABLES.find((t) => t.id === id)
  if (!table) {
    return new Response("Tabela não encontrada.", { status: 404 })
  }

  let rows: Record<string, unknown>[] | null = null
  try {
    rows = await fetchRawRows(table, params)
  } catch (err) {
    console.log("[v0] Erro ao consultar API de tabelas:", (err as Error).message)
    return new Response("Não foi possível consultar a API de tabelas.", {
      status: 502,
    })
  }

  if (!rows) {
    rows = buildMockRows(table, params)
  }

  const csv = toCsv(table, rows)

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv;charset=utf-8;",
      "Content-Disposition": `attachment; filename="${table.technicalName}.csv"`,
    },
  })
}

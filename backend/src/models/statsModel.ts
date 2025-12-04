import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool } from '../lib/db'

export interface StatRecord extends RowDataPacket {
  id: number
  template_id: number | null
  college: string | null
  graduation_year: string | null
  event: string
  download_count: number
  created_at: string
}

export interface StatInput {
  templateId?: number
  college?: string
  graduationYear?: string
  event: 'generate' | 'download'
}

export async function record(payload: StatInput) {
  const downloadCount = payload.event === 'download' ? 1 : 0
  await pool.execute<ResultSetHeader>(
    `INSERT INTO generation_stats (template_id, college, graduation_year, event, download_count)
     VALUES (:templateId, :college, :graduationYear, :event, :downloadCount)`,
    {
      ...payload,
      downloadCount
    }
  )
}

export async function aggregateDailyTrends(limit = 30) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
        DATE(created_at) as day,
        SUM(CASE WHEN event = 'generate' THEN 1 ELSE 0 END) as generate_total,
        SUM(CASE WHEN event = 'download' THEN download_count ELSE 0 END) as download_total
     FROM generation_stats
     GROUP BY DATE(created_at)
     ORDER BY day DESC
     LIMIT :limit`,
    { limit }
  )
  return rows
}

export async function aggregateDownloadByCollege() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT college, SUM(CASE WHEN event = 'download' THEN download_count ELSE 0 END) as total
     FROM generation_stats
     WHERE college IS NOT NULL AND event = 'download'
     GROUP BY college
     ORDER BY total DESC`
  )
  return rows
}

export async function aggregateTotals() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      SUM(CASE WHEN event = 'generate' THEN 1 ELSE 0 END) as generate,
      SUM(CASE WHEN event = 'download' THEN download_count ELSE 0 END) as download
     FROM generation_stats`
  )
  const row = rows[0] as { generate: number; download: number } | undefined
  return row || { generate: 0, download: 0 }
}

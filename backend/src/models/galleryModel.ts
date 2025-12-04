import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool } from '../lib/db'

export interface GalleryRecord extends RowDataPacket {
  id: number
  college: string
  class_name: string | null
  graduation_year: string
  title: string
  file_path: string
  preview_path: string | null
  created_at: string
}

export interface GalleryInput {
  college: string
  className?: string | null
  graduationYear: string
  title?: string
  filePath: string
  previewPath?: string | null
}

export async function findAll(filters: { college?: string; className?: string; graduationYear?: string }) {
  const conditions: string[] = []
  const params: Record<string, unknown> = {}
  if (filters.college) {
    conditions.push('college LIKE :college')
    params.college = `%${filters.college}%`
  }
  if (filters.className) {
    conditions.push('class_name LIKE :className')
    params.className = `%${filters.className}%`
  }
  if (filters.graduationYear) {
    conditions.push('graduation_year = :graduationYear')
    params.graduationYear = filters.graduationYear
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await pool.query<GalleryRecord[]>(
    `SELECT * FROM gallery_photos ${where} ORDER BY created_at DESC`,
    params
  )
  return rows
}

export async function create(data: GalleryInput) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO gallery_photos (college, class_name, graduation_year, title, file_path, preview_path)
     VALUES (:college, :className, :graduationYear, :title, :filePath, :previewPath)`,
    data
  )
  return result.insertId
}

export async function update(id: number, data: Partial<GalleryInput>) {
  const fields: string[] = []
  const params: Record<string, unknown> = { id }
  if (data.college !== undefined) {
    fields.push('college = :college')
    params.college = data.college
  }
  if (data.className !== undefined) {
    fields.push('class_name = :className')
    params.className = data.className
  }
  if (data.graduationYear !== undefined) {
    fields.push('graduation_year = :graduationYear')
    params.graduationYear = data.graduationYear
  }
  if (data.title !== undefined) {
    fields.push('title = :title')
    params.title = data.title
  }
  if (data.filePath !== undefined) {
    fields.push('file_path = :filePath')
    params.filePath = data.filePath
  }
  if (data.previewPath !== undefined) {
    fields.push('preview_path = :previewPath')
    params.previewPath = data.previewPath
  }
  if (!fields.length) return
  const setClause = fields.join(', ')
  await pool.execute(`UPDATE gallery_photos SET ${setClause} WHERE id = :id`, params)
}

export async function remove(id: number) {
  await pool.execute('DELETE FROM gallery_photos WHERE id = :id', { id })
}

export async function updatePreviewPath(id: number, previewPath: string) {
  await pool.execute('UPDATE gallery_photos SET preview_path = :previewPath WHERE id = :id', {
    id,
    previewPath
  })
}

export async function findById(id: number) {
  const [rows] = await pool.query<GalleryRecord[]>(
    'SELECT * FROM gallery_photos WHERE id = :id LIMIT 1',
    { id }
  )
  return rows[0]
}

import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool } from '../lib/db'

export interface TemplateRecord extends RowDataPacket {
  id: number
  name: string
  description: string
  slogan: string
  logo_path: string | null
  logo_url: string | null
  background_path: string | null
  aspect_ratio: string
  photo_area: string | Record<string, unknown>
  logo_position: string | null
  canvas_width: number
  canvas_height: number
  created_at: string
}

export interface TemplateInput {
  name: string
  description?: string | null
  slogan?: string | null
  logoPath?: string | null
  logoUrl?: string | null
  backgroundPath?: string | null
  aspectRatio: string
  photoArea: Record<string, unknown>
  logoPosition?: string
  canvasWidth: number
  canvasHeight: number
}

export async function findAll() {
  const [rows] = await pool.query<TemplateRecord[]>('SELECT * FROM templates ORDER BY id DESC')
  return rows
}

export async function findById(id: number) {
  const [rows] = await pool.query<TemplateRecord[]>(
    'SELECT * FROM templates WHERE id = :id LIMIT 1',
    { id }
  )
  return rows[0]
}

export async function create(data: TemplateInput) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO templates
      (name, description, slogan, logo_path, logo_url, background_path, aspect_ratio, photo_area, logo_position, canvas_width, canvas_height)
     VALUES (:name, :description, :slogan, :logoPath, :logoUrl, :backgroundPath, :aspectRatio, :photoArea, :logoPosition, :canvasWidth, :canvasHeight)`,
    {
      name: data.name,
      description: data.description ?? null,
      slogan: data.slogan ?? null,
      logoPath: data.logoPath ?? null,
      logoUrl: data.logoUrl ?? null,
      backgroundPath: data.backgroundPath ?? null,
      aspectRatio: data.aspectRatio,
      photoArea: JSON.stringify(data.photoArea),
      logoPosition: data.logoPosition || 'top-left',
      canvasWidth: data.canvasWidth,
      canvasHeight: data.canvasHeight
    }
  )
  return result.insertId
}

export async function update(id: number, data: Partial<TemplateInput>) {
  const fields = []
  const params: Record<string, unknown> = { id }
  if (data.name !== undefined) {
    fields.push('name = :name')
    params.name = data.name
  }
  if (data.description !== undefined) {
    fields.push('description = :description')
    params.description = data.description ?? null
  }
  if (data.slogan !== undefined) {
    fields.push('slogan = :slogan')
    params.slogan = data.slogan ?? null
  }
  if (data.logoPath !== undefined) {
    fields.push('logo_path = :logoPath')
    params.logoPath = data.logoPath ?? null
  }
  if (data.logoUrl !== undefined) {
    fields.push('logo_url = :logoUrl')
    params.logoUrl = data.logoUrl ?? null
  }
  if (data.logoPosition !== undefined) {
    fields.push('logo_position = :logoPosition')
    params.logoPosition = data.logoPosition
  }
  if (data.backgroundPath !== undefined) {
    fields.push('background_path = :backgroundPath')
    params.backgroundPath = data.backgroundPath ?? null
  }
  if (data.aspectRatio !== undefined) {
    fields.push('aspect_ratio = :aspectRatio')
    params.aspectRatio = data.aspectRatio
  }
  if (data.photoArea !== undefined) {
    fields.push('photo_area = :photoArea')
    params.photoArea = JSON.stringify(data.photoArea)
  }
  if (data.canvasWidth !== undefined) {
    fields.push('canvas_width = :canvasWidth')
    params.canvasWidth = data.canvasWidth
  }
  if (data.canvasHeight !== undefined) {
    fields.push('canvas_height = :canvasHeight')
    params.canvasHeight = data.canvasHeight
  }

  if (!fields.length) return

  await pool.execute<ResultSetHeader>(
    `UPDATE templates SET ${fields.join(', ')} WHERE id = :id`,
    params
  )
}

export async function remove(id: number) {
  await pool.execute('DELETE FROM templates WHERE id = :id', { id })
}

import path from 'node:path'
import { env } from '../config/env'

export function toPublicPath(filePath?: string | null) {
  if (!filePath) return ''
  if (/^https?:\/\//i.test(filePath)) {
    return filePath
  }
  const relative = path.relative(env.uploadDir, filePath).replace(/\\/g, '/')
  return `/uploads/${relative}`
}

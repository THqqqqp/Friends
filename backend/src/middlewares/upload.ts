import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { env } from '../config/env'

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const folder = resolveFolder(file.fieldname)
    const dir = path.join(env.uploadDir, folder)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const timestamp = Date.now()
    cb(null, `${timestamp}-${file.fieldname}${ext}`)
  }
})

function resolveFolder(field: string) {
  if (field === 'logo') return 'logos'
  if (field === 'gallery' || field === 'photo') return 'gallery'
  return 'templates'
}

export const upload = multer({
  storage,
  limits: {
    fileSize: env.uploadMaxSizeBytes
  }
})

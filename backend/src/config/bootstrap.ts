import fs from 'node:fs'
import path from 'node:path'
import { env } from './env'

const folders = ['templates', 'logos', 'gallery']

export function prepareFileSystem() {
  if (!fs.existsSync(env.uploadDir)) {
    fs.mkdirSync(env.uploadDir, { recursive: true })
  }
  folders.forEach((folder) => {
    const dir = path.join(env.uploadDir, folder)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

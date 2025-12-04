import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs/promises'

export async function generatePreviewImage(
  filePath: string,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
) {
  const { maxWidth = 1600, maxHeight = 1600, quality = 70 } = options
  const ext = '.jpg'
  const dir = path.dirname(filePath)
  const base = path.basename(filePath, path.extname(filePath))
  const targetPath = path.join(dir, `${base}-preview${ext}`)

  await sharp(filePath)
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality, mozjpeg: true })
    .toFile(targetPath)

  return targetPath
}

export async function safeUnlink(filePath?: string | null) {
  if (!filePath) return
  if (/^https?:\/\//i.test(filePath)) return
  try {
    await fs.unlink(filePath)
  } catch {
    // ignore
  }
}

export async function compressToMaxSize(
  filePath: string,
  targetBytes = 20 * 1024 * 1024,
  qualitySteps = [90, 85, 80, 70, 60, 50, 40, 30]
) {
  const stat = await fs.stat(filePath)
  if (stat.size <= targetBytes) return filePath

  const dir = path.dirname(filePath)
  const base = path.basename(filePath, path.extname(filePath))
  const targetPath = path.join(dir, `${base}-compressed.jpg`)

  for (const quality of qualitySteps) {
    await sharp(filePath)
      .jpeg({ quality, mozjpeg: true })
      .toFile(targetPath)
    const compressedStat = await fs.stat(targetPath)
    if (compressedStat.size <= targetBytes || quality === qualitySteps[qualitySteps.length - 1]) {
      return targetPath
    }
  }

  return targetPath
}

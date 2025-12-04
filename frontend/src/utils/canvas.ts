import html2canvas from 'html2canvas'
import type { FrameStyle, GeneratePayload, TemplateConfig } from '@/types/postcard'

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

export async function composePostcard(payload: GeneratePayload): Promise<string> {
  const { template, userImage, transform, meta, frameStyle = 'none', exportScale = 1 } = payload
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('无法创建 canvas 上下文')
  }

  const [background, logo, portrait] = await Promise.all([
    loadImage(template.backgroundUrl),
    loadImage(template.logoUrl || TRANSPARENT_PIXEL),
    loadImage(userImage)
  ])

  const baseWidth = background.naturalWidth || template.canvasSize.width || 1080
  const baseHeight = background.naturalHeight || template.canvasSize.height || 1440
  
  // Calculate target dimensions with a max limit
  const MAX_DIMENSION = 2160
  let targetWidth = Math.round(baseWidth * exportScale)
  let targetHeight = Math.round(baseHeight * exportScale)
  
  // If dimensions exceed MAX_DIMENSION, scale down
  if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / targetWidth, MAX_DIMENSION / targetHeight)
    targetWidth = Math.round(targetWidth * ratio)
    targetHeight = Math.round(targetHeight * ratio)
  }

  canvas.width = targetWidth
  canvas.height = targetHeight
  
  // Calculate the final scale relative to the base dimensions
  const finalScaleX = targetWidth / baseWidth
  const finalScaleY = targetHeight / baseHeight
  
  ctx.scale(finalScaleX, finalScaleY)

  ctx.drawImage(background, 0, 0, baseWidth, baseHeight)

  const area = resolvePhotoArea(template, baseWidth, baseHeight)
  ctx.save()
  ctx.beginPath()
  ctx.rect(area.x, area.y, area.width, area.height)
  ctx.clip()

  const portraitWidth = portrait.naturalWidth || baseWidth
  const portraitHeight = portrait.naturalHeight || baseHeight
  const coverScale = Math.max(area.width / portraitWidth, area.height / portraitHeight)
  const totalScale = coverScale * transform.scale
  const drawWidth = portraitWidth * totalScale
  const drawHeight = portraitHeight * totalScale
  const centerX = area.x + area.width / 2 + transform.offsetX
  const centerY = area.y + area.height / 2 + transform.offsetY

  ctx.translate(centerX, centerY)
  ctx.rotate((transform.rotation * Math.PI) / 180)
  ctx.drawImage(portrait, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  ctx.restore()

  drawFrame(ctx, area, frameStyle)

  const logoPlacement = resolveLogoPosition(template.logoPosition, baseWidth, baseHeight, logo)
  // ctx.drawImage(logo, logoPlacement.x, logoPlacement.y, logoPlacement.width, logoPlacement.height)

  if (meta.showSlogan && template.slogan) {
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
    // ctx.fillRect(0, baseHeight - 240, baseWidth, 240)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 56px "PingFang SC", "Inter", sans-serif'
    ctx.fillText(template.slogan, 56, baseHeight - 160)
  }

  ctx.font = '36px "PingFang SC", "Inter", sans-serif'
  let metaLine = ''
  if (meta.showName && meta.displayName) metaLine += meta.displayName
  if (meta.showCollege && meta.college) metaLine += metaLine ? ` · ${meta.college}` : meta.college
  if (meta.showYear && meta.graduationYear) metaLine += metaLine ? ` · ${meta.graduationYear}` : meta.graduationYear

  if (metaLine) {
    ctx.fillText(metaLine, 56, baseHeight - 100)
  }

  // Use JPEG with 0.85 quality for significant file size reduction
  return canvas.toDataURL('image/jpeg', 0.85)
}

export async function captureDomPreview(target: HTMLElement): Promise<string> {
  const canvas = await html2canvas(target, {
    useCORS: true,
    scale: 2,
    backgroundColor: null
  })
  return canvas.toDataURL('image/png')
}

function resolvePhotoArea(template: TemplateConfig, canvasWidth: number, canvasHeight: number) {
  return {
    x: template.photoArea.x * canvasWidth,
    y: template.photoArea.y * canvasHeight,
    width: template.photoArea.width * canvasWidth,
    height: template.photoArea.height * canvasHeight
  }
}

const imageCache = new Map<string, HTMLImageElement>()

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!)
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

function resolveLogoPosition(
  position: TemplateConfig['logoPosition'],
  canvasWidth: number,
  canvasHeight: number,
  logo: HTMLImageElement
) {
  const margin = Math.max(canvasWidth, canvasHeight) * 0.02
  const rawWidth = logo.naturalWidth || 200
  const rawHeight = logo.naturalHeight || 200
  const maxWidth = canvasWidth * 0.18
  const maxHeight = canvasHeight * 0.18
  const ratio = rawWidth / rawHeight || 1
  let width = Math.min(rawWidth, maxWidth)
  let height = width / ratio
  if (height > maxHeight) {
    height = maxHeight
    width = height * ratio
  }

  const base = {
    'top-left': { x: margin, y: margin },
    'top-right': { x: canvasWidth - width - margin, y: margin },
    'bottom-left': { x: margin, y: canvasHeight - height - margin },
    'bottom-right': { x: canvasWidth - width - margin, y: canvasHeight - height - margin }
  } as const

  const target = base[position || 'top-left'] || base['top-left']

  return {
    x: target.x,
    y: target.y,
    width,
    height
  }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  area: { x: number; y: number; width: number; height: number },
  style: FrameStyle
) {
  if (style === 'none') return
  ctx.save()
  ctx.lineWidth = 6
  ctx.strokeStyle = 'rgba(255,255,255,0.95)'
  ctx.setLineDash([])

  if (style === 'dashed') {
    ctx.setLineDash([24, 12])
  } else if (style === 'stamp') {
    drawStampBorder(ctx, area)
    ctx.restore()
    return
  }

  ctx.beginPath()
  ctx.rect(area.x, area.y, area.width, area.height)
  ctx.stroke()
  ctx.restore()
}

function drawStampBorder(
  ctx: CanvasRenderingContext2D,
  area: { x: number; y: number; width: number; height: number }
) {
  const radius = 10
  const spacing = radius * 2

  const drawEdge = (startX: number, startY: number, dx: number, dy: number, count: number, rotation = 0) => {
    ctx.save()
    ctx.translate(startX, startY)
    ctx.rotate(rotation)
    for (let i = 0; i < count; i++) {
      ctx.beginPath()
      ctx.arc(0, 0, radius, Math.PI, 0)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.translate(spacing * dx, spacing * dy)
    }
    ctx.restore()
  }

  drawEdge(area.x, area.y, 1, 0, Math.ceil(area.width / spacing))
  drawEdge(area.x + area.width, area.y, 0, 1, Math.ceil(area.height / spacing), Math.PI / 2)
  drawEdge(area.x + area.width, area.y + area.height, -1, 0, Math.ceil(area.width / spacing), Math.PI)
  drawEdge(area.x, area.y + area.height, 0, -1, Math.ceil(area.height / spacing), -Math.PI / 2)
}

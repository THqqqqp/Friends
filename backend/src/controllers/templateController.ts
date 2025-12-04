import { Request, Response, NextFunction } from 'express'
import * as templateModel from '../models/templateModel'
import { toPublicPath } from '../utils/uploads'
import { persistFile } from '../services/storageService'

export async function listTemplates(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await templateModel.findAll()
    const templates = rows.map(mapTemplateRecord)
    res.json(templates)
  } catch (error) {
    next(error)
  }
}

export async function getTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const template = await templateModel.findById(id)
    if (!template) {
      return res.status(404).json({ message: '模板不存在' })
    }
    res.json(mapTemplateRecord(template))
  } catch (error) {
    next(error)
  }
}

export async function createTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined
    const body = req.body
    const logoPath = files?.logo?.[0]?.path
    const backgroundPath = files?.background?.[0]?.path
    const storedLogo = logoPath ? await persistFile(logoPath, 'templates/logo') : null
    const storedBackground = backgroundPath
      ? await persistFile(backgroundPath, 'templates/background')
      : null

    const photoArea = parsePhotoArea(body.photoArea)
    const id = await templateModel.create({
      name: body.name,
      description: body.description,
      slogan: body.slogan,
      logoPath: storedLogo?.filePath ?? null,
      logoUrl: storedLogo?.publicUrl ?? undefined,
      backgroundPath: storedBackground?.filePath ?? null,
      aspectRatio: body.aspectRatio || '3:4',
      photoArea,
      logoPosition: body.logoPosition || 'top-left',
      canvasWidth: Number(body.canvasWidth || 1080),
      canvasHeight: Number(body.canvasHeight || 1440)
    })
    res.status(201).json({ id })
  } catch (error) {
    next(error)
  }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const files = req.files as Record<string, Express.Multer.File[]> | undefined
    const body = req.body
    const removeLogo = body.removeLogo === 'true'
    const removeBackground = body.removeBackground === 'true'
    const logoPath = removeLogo ? null : files?.logo?.[0]?.path
    const backgroundPath = removeBackground ? null : files?.background?.[0]?.path
    const storedLogo =
      logoPath && logoPath !== null ? await persistFile(logoPath, 'templates/logo') : null
    const storedBackground =
      backgroundPath && backgroundPath !== null
        ? await persistFile(backgroundPath, 'templates/background')
        : null
    await templateModel.update(id, {
      name: body.name,
      description: body.description,
      slogan: body.slogan,
      logoPath:
        logoPath !== undefined ? (logoPath === null ? null : storedLogo?.filePath ?? null) : undefined,
      logoUrl:
        logoPath !== undefined
          ? logoPath === null
            ? null
            : storedLogo?.publicUrl ?? undefined
          : undefined,
      backgroundPath:
        backgroundPath !== undefined
          ? backgroundPath === null
            ? null
            : storedBackground?.filePath ?? null
          : undefined,
      aspectRatio: body.aspectRatio,
      photoArea: body.photoArea ? parsePhotoArea(body.photoArea) : undefined,
      logoPosition: body.logoPosition,
      canvasWidth: body.canvasWidth ? Number(body.canvasWidth) : undefined,
      canvasHeight: body.canvasHeight ? Number(body.canvasHeight) : undefined
    })
    res.json({ message: '模板已更新' })
  } catch (error) {
    next(error)
  }
}

function parsePhotoArea(value?: string) {
  try {
    return value ? JSON.parse(value) : { x: 0.1, y: 0.1, width: 0.8, height: 0.6 }
  } catch {
    return { x: 0.1, y: 0.1, width: 0.8, height: 0.6 }
  }
}

export async function deleteTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await templateModel.remove(id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

function mapTemplateRecord(row: templateModel.TemplateRecord) {
  const parsedPhotoArea =
    typeof row.photo_area === 'string' ? JSON.parse(row.photo_area) : row.photo_area

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    slogan: row.slogan,
    logoUrl: row.logo_url || toPublicPath(row.logo_path),
    backgroundUrl: toPublicPath(row.background_path),
    aspectRatio: row.aspect_ratio,
    logoPosition: row.logo_position || 'top-left',
    photoArea: parsedPhotoArea,
    canvasSize: {
      width: row.canvas_width,
      height: row.canvas_height
    }
  }
}

import { Request, Response, NextFunction } from 'express'
import * as statsModel from '../models/statsModel'

function buildPayload(req: Request) {
  return {
    templateId: req.body.templateId,
    college: req.body.college,
    graduationYear: req.body.graduationYear
  }
}

export async function recordGenerate(req: Request, res: Response, next: NextFunction) {
  try {
    await statsModel.record({
      ...buildPayload(req),
      event: 'generate'
    })
    res.status(201).json({ message: '已记录' })
  } catch (error) {
    next(error)
  }
}

export async function recordDownload(req: Request, res: Response, next: NextFunction) {
  try {
    await statsModel.record({
      ...buildPayload(req),
      event: 'download'
    })
    res.status(201).json({ message: '已记录' })
  } catch (error) {
    next(error)
  }
}

export async function record(req: Request, res: Response, next: NextFunction) {
  try {
    if (!['generate', 'download'].includes(req.body.event)) {
      return res.status(400).json({ message: 'event 参数不合法' })
    }
    await statsModel.record({
      ...buildPayload(req),
      event: req.body.event
    })
    res.status(201).json({ message: '已记录' })
  } catch (error) {
    next(error)
  }
}

export async function overview(_req: Request, res: Response, next: NextFunction) {
  try {
    const [daily, college] = await Promise.all([
      statsModel.aggregateDailyTrends(),
      statsModel.aggregateDownloadByCollege()
    ])
    const normalizedDaily = daily.flatMap((row) => [
      { day: row.day, event: 'generate', total: Number(row.generate_total) },
      { day: row.day, event: 'download', total: Number(row.download_total) }
    ])
    const normalizedCollege = college.map((row) => ({
      college: row.college,
      total: Number(row.total)
    }))
    res.json({ daily: normalizedDaily, college: normalizedCollege })
  } catch (error) {
    next(error)
  }
}

export async function chart(_req: Request, res: Response, next: NextFunction) {
  try {
    const [daily, college, totals] = await Promise.all([
      statsModel.aggregateDailyTrends(),
      statsModel.aggregateDownloadByCollege(),
      statsModel.aggregateTotals()
    ])
    res.json({
      dailyTrends: daily.map((row) => ({
        day: row.day,
        generate: Number(row.generate_total),
        download: Number(row.download_total)
      })),
      downloadByCollege: college.map((row) => ({
        college: row.college,
        total: Number(row.total)
      })),
      totals: {
        generate: Number(totals?.generate || 0),
        download: Number(totals?.download || 0)
      }
    })
  } catch (error) {
    next(error)
  }
}

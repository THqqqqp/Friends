import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export interface AuthRequest extends Request {
  user?: {
    id: string
    account: string
  }
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: '未提供授权信息' })
  }
  const [, token] = authHeader.split(' ')
  if (!token) {
    return res.status(401).json({ message: '授权信息格式错误' })
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string }
    req.user = {
      id: payload.sub,
      account: env.adminAccount
    }
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token 无效或已过期' })
  }
}

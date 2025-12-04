import { Router } from 'express'
import templateRoutes from './templateRoutes'
import galleryRoutes from './galleryRoutes'
import authRoutes from './authRoutes'
import statsRoutes from './statsRoutes'

const router = Router()

router.use('/templates', templateRoutes)
router.use('/gallery', galleryRoutes)
router.use('/auth', authRoutes)
router.use('/stats', statsRoutes)

export default router

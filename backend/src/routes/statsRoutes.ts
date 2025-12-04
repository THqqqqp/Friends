import { Router } from 'express'
import { authenticate } from '../middlewares/authMiddleware'
import { chart, overview, record, recordDownload, recordGenerate } from '../controllers/statsController'

const router = Router()

router.post('/generate', recordGenerate)
router.post('/download', recordDownload)
router.post('/record', record) // legacy 兼容
router.get('/', authenticate, overview)
router.get('/chart', authenticate, chart)

export default router

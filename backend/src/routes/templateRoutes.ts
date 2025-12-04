import { Router } from 'express'
import { authenticate } from '../middlewares/authMiddleware'
import { upload } from '../middlewares/upload'
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate
} from '../controllers/templateController'

const router = Router()

router.get('/', listTemplates)
router.get('/:id', getTemplate)
router.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'background', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]),
  createTemplate
)
router.put(
  '/:id',
  authenticate,
  upload.fields([
    { name: 'background', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]),
  updateTemplate
)
router.delete('/:id', authenticate, deleteTemplate)

export default router

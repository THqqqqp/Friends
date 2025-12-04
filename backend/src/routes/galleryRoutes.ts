import { Router } from 'express'
import { authenticate } from '../middlewares/authMiddleware'
import { upload } from '../middlewares/upload'
import {
  createGallery,
  downloadGallery,
  deleteGallery,
  listGallery,
  updateGallery
} from '../controllers/galleryController'

const router = Router()

router.get('/', listGallery)
router.get('/download/:id', downloadGallery)
router.post('/', authenticate, upload.single('photo'), createGallery)
router.patch('/:id', authenticate, upload.single('photo'), updateGallery)
router.delete('/:id', authenticate, deleteGallery)

export default router

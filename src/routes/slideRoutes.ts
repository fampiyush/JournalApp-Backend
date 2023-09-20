import express from 'express'
import { uploadSlide, getAllSlides, deleteSlide } from '../controllers/slideController'
import {protect} from '../middleware/authMiddleware'

const router = express.Router()

router.post('/upload', protect, uploadSlide)
router.get('/getall', protect, getAllSlides)
router.post('/delete', protect, deleteSlide)

module.exports = router;
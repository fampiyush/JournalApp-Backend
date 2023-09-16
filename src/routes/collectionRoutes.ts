import express from 'express'
import { uploadCollection, getAllCollection } from '../controllers/collectionController'
import {protect} from '../middleware/authMiddleware'

const router = express.Router()

router.post('/upload', protect, uploadCollection)
router.get('/getall', protect, getAllCollection)

module.exports = router;
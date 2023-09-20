import express from 'express'
import { uploadCollection, getAllCollection, deleteCollection } from '../controllers/collectionController'
import {protect} from '../middleware/authMiddleware'

const router = express.Router()

router.post('/upload', protect, uploadCollection)
router.get('/getall', protect, getAllCollection)
router.post('/delete', protect, deleteCollection)

module.exports = router;
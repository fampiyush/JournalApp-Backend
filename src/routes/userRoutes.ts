import express from 'express'
import {registerUser, loginUser, getme} from '../controllers/userController'
import {protect} from '../middleware/authMiddleware'

const router = express.Router()


router.post('/login', loginUser)
router.post('/register', registerUser)
router.get('/me', protect, getme)

module.exports = router;
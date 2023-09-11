import express from 'express'
import {registerUser, loginUser, getme, getProfilePic} from '../controllers/userController'
import {protect} from '../middleware/authMiddleware'

const router = express.Router()


router.post('/login', loginUser)
router.post('/register', registerUser)
router.get('/me', protect, getme)
router.get('/profilepic', protect, getProfilePic)

module.exports = router;
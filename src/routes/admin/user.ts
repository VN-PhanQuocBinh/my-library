import express from 'express'
import userController from '../../controllers/user-controller.ts'
const router = express.Router()

// Route to get all users
router.get('/list', userController.getAllUsers)

export default router
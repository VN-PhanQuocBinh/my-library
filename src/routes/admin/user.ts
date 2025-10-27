import express from 'express'
import userController from '../../controllers/user-controller.ts'
const router = express.Router()

// Route to get all users
router.get('/list', userController.getAllUsers)
router.post('/create', userController.createUser)
router.patch('/:id', userController.updateUser)
router.patch('/reset-password/:id', userController.resetPassword)


export default router
import express from 'express'
import { BankController } from '../controllers/bankController.js'
import { authenticateOptionalToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateOptionalToken, BankController.getBanks)
router.post('/', authenticateOptionalToken, BankController.saveBank)
router.delete('/:id', authenticateOptionalToken, BankController.deleteBank)
router.post('/sync', authenticateOptionalToken, BankController.syncBanks)

export default router


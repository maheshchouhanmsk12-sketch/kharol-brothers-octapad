import express from 'express'
import { KitController } from '../controllers/kitController.js'
import { authenticateOptionalToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', authenticateOptionalToken, KitController.getKits)
router.post('/', authenticateOptionalToken, KitController.saveKits)

export default router


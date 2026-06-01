import { Router } from 'express'
import { sendMessage, analyzeSymptomsList } from '../controllers/chatController.js'

const router = Router()
router.post('/', sendMessage)
router.post('/analyze', analyzeSymptomsList)
export default router

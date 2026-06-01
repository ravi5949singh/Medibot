import { Router } from 'express'
import { extractMedicalReport } from '../controllers/healthRecordController.js'

const router = Router()

// POST /api/health-records/extract
router.post('/extract', extractMedicalReport)

export default router

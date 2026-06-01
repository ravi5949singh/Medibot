import { Router } from 'express'
import { searchDoctors, getDoctorById } from '../controllers/doctorController.js'

const router = Router()
router.get('/search', searchDoctors)
router.get('/:id', getDoctorById)
export default router

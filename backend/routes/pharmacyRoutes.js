import { Router } from 'express'
import { searchPharmacies } from '../controllers/pharmacyController.js'

const router = Router()
router.get('/', searchPharmacies)
export default router

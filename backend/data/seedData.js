import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Doctor from '../models/Doctor.js'
import Pharmacy from '../models/Pharmacy.js'

dotenv.config()

const doctors = [
  { name: 'Dr. Ankit Sharma', specialization: 'General Physician', clinic_address: 'New Market, Bhopal', phone: '+91 98765 43210', pincode: '462001', latitude: 23.2650, longitude: 77.4200, rating: 4.8 },
  { name: 'Dr. Neha Verma', specialization: 'Fever Specialist', clinic_address: 'MP Nagar Zone-II, Bhopal', phone: '+91 87654 32109', pincode: '462001', latitude: 23.2320, longitude: 77.4340, rating: 4.6 },
  { name: 'Dr. Rajat Mehta', specialization: 'Internal Medicine', clinic_address: 'Arera Colony, Bhopal', phone: '+91 76543 21098', pincode: '462001', latitude: 23.2350, longitude: 77.4250, rating: 4.9 },
  { name: 'Dr. Priya Singh', specialization: 'Cardiologist', clinic_address: 'Habibganj, Bhopal', phone: '+91 65432 10987', pincode: '462001', latitude: 23.2290, longitude: 77.4380, rating: 4.7 },
  { name: 'Dr. Amit Patel', specialization: 'ENT Specialist', clinic_address: 'Kolar Road, Bhopal', phone: '+91 54321 09876', pincode: '462001', latitude: 23.1990, longitude: 77.4320, rating: 4.5 },
  { name: 'Dr. Sonia Gupta', specialization: 'Dermatologist', clinic_address: 'TT Nagar, Bhopal', phone: '+91 43210 98765', pincode: '462001', latitude: 23.2400, longitude: 77.4100, rating: 4.8 },
]

const pharmacies = [
  { name: 'Apollo Pharmacy', address: 'New Market, Bhopal', pincode: '462001', phone: '+91 98765 11111', latitude: 23.2610, longitude: 77.4180 },
  { name: 'MedPlus', address: 'MP Nagar, Bhopal', pincode: '462001', phone: '+91 98765 22222', latitude: 23.2330, longitude: 77.4350 },
  { name: 'Netmeds Store', address: 'Arera Colony, Bhopal', pincode: '462001', phone: '+91 98765 33333', latitude: 23.2340, longitude: 77.4230 },
  { name: 'Wellness Forever', address: 'Habibganj, Bhopal', pincode: '462001', phone: '+91 98765 44444', latitude: 23.2280, longitude: 77.4390 },
]

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  await Doctor.deleteMany({})
  await Pharmacy.deleteMany({})
  await Doctor.insertMany(doctors)
  await Pharmacy.insertMany(pharmacies)
  console.log('✅ Database seeded!')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })

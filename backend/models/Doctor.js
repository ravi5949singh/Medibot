import mongoose from 'mongoose'

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  clinic_address: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true, index: true },
  latitude: { type: Number },
  longitude: { type: Number },
  rating: { type: Number, default: 4.5 },
}, { timestamps: true })

export default mongoose.model('Doctor', doctorSchema)

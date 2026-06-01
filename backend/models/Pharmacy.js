import mongoose from 'mongoose'

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true, index: true },
  phone: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  medicines: { type: [String], default: [] },
}, { timestamps: true })

export default mongoose.model('Pharmacy', pharmacySchema)

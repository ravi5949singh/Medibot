import mongoose from 'mongoose'

const chatHistorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  message: { type: String, required: true },
  response: { type: String, required: true },
  severity: { type: String, enum: ['mild', 'medium', 'severe'], default: 'mild' },
  diseases: [{ type: String }],
  recommendations: [{ type: String }],
}, { timestamps: true })

export default mongoose.model('ChatHistory', chatHistorySchema)

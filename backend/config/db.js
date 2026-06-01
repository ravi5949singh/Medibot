import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.warn(`⚠️  MongoDB not available: ${error.message}`)
    console.warn(`⚠️  Server will start without database. Some features may be limited.`)
  }
}

export default connectDB

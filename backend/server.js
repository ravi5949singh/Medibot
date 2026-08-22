import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import chatRoutes from './routes/chatRoutes.js'
import doctorRoutes from './routes/doctorRoutes.js'
import pharmacyRoutes from './routes/pharmacyRoutes.js'
import authRoutes from './routes/authRoutes.js'
import healthRecordRoutes from './routes/healthRecordRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://medibot-khaki.vercel.app'
]
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true)
    // Allow any Vercel preview/deployment URL
    if (origin.endsWith('.vercel.app')) return callback(null, true)
    // Allow explicit origins
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('CORS: Not allowed'))
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

// Routes
app.use('/api/chat', chatRoutes)
app.use('/api/doctors', doctorRoutes)
app.use('/api/pharmacies', pharmacyRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/health-records', healthRecordRoutes)

// Root route (prevents Cannot GET / error)
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MediCare AI Backend API is running successfully.', 
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      doctors: '/api/doctors/search',
      pharmacies: '/api/pharmacies'
    }
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MediCare AI Backend is running' })
})

// Error handler
app.use(errorHandler)

// Start server
const startServer = async () => {
  connectDB()
  app.listen(PORT, () => {
    console.log(`🏥 MediCare AI Backend running on port ${PORT}`)
  })
}

startServer()

import axios from 'axios'

const BACKEND = import.meta.env.VITE_API_URL
const baseURL = BACKEND ? `${BACKEND}/api` : '/api'
console.log("API baseURL:", baseURL)

const api = axios.create({
  baseURL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
})

/**
 * Send a chat message to the AI backend
 * @param {string} message - User's symptom/health message
 * @returns {Promise<object>} AI response with suggestions, severity, etc.
 */
export async function sendChatMessage(message) {
  const { data } = await api.post('/chat', { message })
  return data
}

/**
 * Search doctors by pincode, area and specialization
 */
export async function searchDoctors(pincode, area = '', specialization = '') {
  const params = {}
  if (pincode) params.pincode = pincode
  if (area) params.area = area
  if (specialization) params.specialization = specialization
  const { data } = await api.get('/doctors/search', { params })
  return data
}

/**
 * Search pharmacies by pincode, area and medicine name
 */
export async function searchPharmacies(pincode, area = '', medicine = '') {
  const params = {}
  if (pincode) params.pincode = pincode
  if (area) params.area = area
  if (medicine) params.medicine = medicine
  const { data } = await api.get('/pharmacies', { params })
  return data
}

/**
 * Send a report image to the backend for AI-powered parameter extraction
 */
export async function extractReportData(image, mimeType) {
  const { data } = await api.post('/health-records/extract', { image, mimeType })
  return data
}

export default api

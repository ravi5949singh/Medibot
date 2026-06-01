import { analyzeSymptoms } from '../services/aiService.js'
import { detectSeverity, getSeverityMessage } from '../services/severityEngine.js'
import ChatHistory from '../models/ChatHistory.js'

// POST /api/chat
export const sendMessage = async (req, res, next) => {
  try {
    const { message, user_id } = req.body
    if (!message) return res.status(400).json({ error: 'Message is required' })

    // Get AI analysis
    const aiResult = await analyzeSymptoms(message)
    const isGeneral = aiResult.is_general || false

    // For general chat (greetings etc), respond quickly without medical analysis
    if (isGeneral) {
      return res.json({
        response: aiResult.response,
        is_general: true,
        severity: null,
        severity_message: null,
        possible_conditions: [],
        suggestions: [],
        otc_medicines: [],
        home_remedies: [],
        see_doctor: false,
        specialist: null,
        disclaimer: null
      })
    }

    // Health-related: detect severity
    const severity = detectSeverity(message)
    const severityMessage = getSeverityMessage(severity)

    // Save to history (only health queries)
    if (user_id) {
      await ChatHistory.create({
        user_id,
        message,
        response: aiResult.response,
        severity,
        diseases: aiResult.possible_conditions || [],
        recommendations: aiResult.suggestions || [],
      })
    }

    res.json({
      response: aiResult.response,
      is_general: false,
      severity,
      severity_message: severityMessage,
      possible_conditions: aiResult.possible_conditions || [],
      suggestions: aiResult.suggestions || [],
      otc_medicines: aiResult.otc_medicines || [],
      home_remedies: aiResult.home_remedies || [],
      see_doctor: aiResult.see_doctor || severity !== 'mild',
      specialist: aiResult.specialist || null,
      disclaimer: 'This is general health guidance, not medical advice. Please consult a healthcare professional.'
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/chat/analyze
export const analyzeSymptomsList = async (req, res, next) => {
  try {
    const { symptoms } = req.body
    if (!symptoms || !symptoms.length) return res.status(400).json({ error: 'Symptoms array is required' })

    const message = `I am experiencing these symptoms: ${symptoms.join(', ')}`
    const severity = detectSeverity(message)
    const aiResult = await analyzeSymptoms(message)

    res.json({
      severity,
      possible_diseases: aiResult.possible_conditions || [],
      recommendations: aiResult.suggestions || [],
      otc_medicines: aiResult.otc_medicines || [],
      see_doctor: aiResult.see_doctor || severity !== 'mild',
      specialist: aiResult.specialist || null,
    })
  } catch (error) {
    next(error)
  }
}

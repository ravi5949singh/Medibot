// Severe symptom keywords that trigger emergency alerts
const SEVERE_TRIGGERS = [
  'chest pain', 'breathing difficulty', 'breathlessness',
  'blood vomiting', 'vomiting blood', 'stroke', 'paralysis',
  'severe bleeding', 'unconscious', 'unresponsive', 'seizure',
  'heart attack', 'cannot breathe', 'choking'
]

const MEDIUM_TRIGGERS = [
  'persistent fever', 'high fever', 'fever above 103',
  'severe headache', 'migraine', 'persistent cough',
  'blood in stool', 'blood in urine', 'dizziness',
  'fainting', 'chest tightness', 'swelling', 'infection'
]

/**
 * Detect severity level from user message
 * @param {string} message - User's symptom description
 * @returns {'mild' | 'medium' | 'severe'}
 */
export function detectSeverity(message) {
  const lower = message.toLowerCase()

  for (const trigger of SEVERE_TRIGGERS) {
    if (lower.includes(trigger)) return 'severe'
  }
  for (const trigger of MEDIUM_TRIGGERS) {
    if (lower.includes(trigger)) return 'medium'
  }
  return 'mild'
}

/**
 * Get severity-appropriate disclaimer
 */
export function getSeverityMessage(severity) {
  const messages = {
    severe: '🚨 EMERGENCY: Your symptoms suggest a potentially serious condition. Please seek immediate medical attention or call emergency services.',
    medium: '⚠️ Your symptoms may require professional medical attention. We recommend consulting a doctor soon.',
    mild: 'ℹ️ Disclaimer: This is general health guidance, not medical advice. Consult a doctor if symptoms persist.'
  }
  return messages[severity]
}

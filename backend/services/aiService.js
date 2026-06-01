import dotenv from 'dotenv'
dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_PROMPT = `You are MediCare AI, a friendly and intelligent healthcare assistant chatbot.

BEHAVIOR RULES:
1. If the user sends a GREETING (like "hi", "hello", "hey", "hiii", "good morning", "what's up", "how are you"):
   - Respond warmly and naturally like a friendly AI assistant
   - Set "is_general" to true
   - Example: "Hello! 👋 I'm MediCare AI, your health assistant. How can I help you today? You can ask me about any symptoms, health concerns, or I can help you find doctors nearby!"

2. If the user sends a GENERAL QUESTION (like "who are you", "what can you do", "thank you", "ok", "bye"):
   - Respond conversationally and helpfully
   - Set "is_general" to true

3. If the user describes SYMPTOMS or HEALTH CONCERNS:
   - Analyze their symptoms carefully
   - Suggest possible conditions (NOT diagnose)
   - Provide OTC medicines and home remedies
   - Set "is_general" to false

SAFETY RULES:
- NEVER prescribe controlled substances
- NEVER guarantee medical outcomes
- For severe symptoms, ALWAYS recommend immediate medical attention
- Be empathetic, warm, and concise

ALWAYS respond in this exact JSON format:
{
  "response": "Your conversational response text",
  "is_general": false,
  "possible_conditions": [],
  "suggestions": [],
  "otc_medicines": [],
  "home_remedies": [],
  "see_doctor": false,
  "specialist": null
}`

/**
 * Detect if a message is a general greeting/chat (not health-related)
 */
function isGeneralChat(message) {
  const lower = message.toLowerCase().trim()
  const greetings = [
    'hi', 'hii', 'hiii', 'hiiii', 'hello', 'hey', 'heyy', 'heyyy',
    'good morning', 'good afternoon', 'good evening', 'good night',
    'what\'s up', 'wassup', 'sup', 'yo', 'howdy',
    'how are you', 'how r u', 'how are u',
    'who are you', 'what are you', 'what can you do',
    'thank you', 'thanks', 'thanku', 'thnx', 'ty',
    'ok', 'okay', 'alright', 'sure', 'cool', 'nice', 'great',
    'bye', 'goodbye', 'see you', 'take care',
    'help', 'help me', 'i need help',
    'namaste', 'namaskar'
  ]
  return greetings.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + '!') || lower.startsWith(g + ','))
}

/**
 * Get a fast local response for general chat
 */
function getGeneralResponse(message) {
  const lower = message.toLowerCase().trim()

  if (['hi', 'hii', 'hiii', 'hiiii', 'hello', 'hey', 'heyy', 'heyyy', 'yo', 'howdy', 'namaste', 'namaskar'].some(g => lower.startsWith(g))) {
    return {
      response: "Hello! 👋 I'm MediCare AI, your personal health assistant. How can I help you today?\n\nYou can:\n• Tell me your symptoms and I'll analyze them\n• Ask for home remedies or medicine suggestions\n• Find doctors near your location\n• Get health tips and advice\n\nJust type what's on your mind! 😊",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('good morning')) {
    return {
      response: "Good morning! ☀️ Hope you're feeling great today. I'm MediCare AI, ready to help with any health concerns. How can I assist you?",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('good afternoon')) {
    return {
      response: "Good afternoon! 🌤️ I'm MediCare AI. Feel free to ask me about any symptoms or health questions you have!",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('good evening') || lower.includes('good night')) {
    return {
      response: "Good evening! 🌙 I'm MediCare AI. Is there anything health-related I can help you with tonight?",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('how are you') || lower.includes('how r u')) {
    return {
      response: "I'm doing great, thank you for asking! 😊 I'm always ready to help. How are you feeling today? If you have any health concerns, just let me know!",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('what can you do')) {
    return {
      response: "I'm MediCare AI 🏥 — your intelligent health assistant!\n\nHere's what I can do:\n• 🔍 Analyze your symptoms\n• 💊 Suggest OTC medicines\n• 🌿 Recommend home remedies\n• 👨‍⚕️ Find doctors near you\n• 🗺️ Locate nearby pharmacies\n• ⚠️ Detect emergency symptoms\n\nJust describe how you're feeling, and I'll help right away!",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('thank') || lower.includes('thnx') || lower.includes('ty')) {
    return {
      response: "You're welcome! 😊 Take care of your health. Feel free to come back anytime you need help. Wishing you good health! 💚",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see you') || lower.includes('take care')) {
    return {
      response: "Goodbye! 👋 Take care and stay healthy! Remember, I'm always here if you need health advice. See you soon! 💙",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (['ok', 'okay', 'alright', 'sure', 'cool', 'nice', 'great'].includes(lower)) {
    return {
      response: "Great! 😊 Is there anything else I can help you with? Feel free to describe any symptoms or health concerns!",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('help')) {
    return {
      response: "Of course, I'm here to help! 🤝\n\nYou can:\n• Describe your symptoms (e.g., \"I have headache and fever\")\n• Ask about a condition (e.g., \"What causes cold?\")\n• Click the quick symptom buttons above\n\nWhat would you like to know?",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  // Default general response
  return {
    response: "I'm here to help! 😊 Could you tell me more about what you need? You can describe any symptoms or health concerns and I'll do my best to assist you.",
    is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
  }
}

/**
 * Main function - Get AI response for any user message
 */
export async function analyzeSymptoms(userMessage) {
  // Fast path: handle greetings/general chat instantly (no API call needed)
  if (isGeneralChat(userMessage)) {
    return getGeneralResponse(userMessage)
  }

  // Health-related: use Gemini AI
  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${SYSTEM_PROMPT}\n\nUser says: "${userMessage}"\n\nRespond ONLY with valid JSON, nothing else.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
          responseMimeType: "application/json"
        }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API Error:', response.status, errText)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) throw new Error('Empty Gemini response')

    try {
      return JSON.parse(text)
    } catch {
      return {
        response: text, is_general: false, suggestions: [], possible_conditions: [],
        otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
      }
    }
  } catch (error) {
    console.error('AI Service Error:', error.message)
    return getFallbackResponse(userMessage)
  }
}

/**
 * Fallback for symptom analysis when Gemini is unavailable
 */
function getFallbackResponse(message) {
  const lower = message.toLowerCase()
  let response = '', conditions = [], suggestions = [], medicines = [], remedies = [], specialist = 'General Physician'

  if (lower.includes('headache') || lower.includes('head pain')) {
    response = 'I understand you are experiencing headache. This could be due to stress, dehydration, tension, migraine, or other reasons.'
    conditions = ['Tension Headache', 'Migraine', 'Dehydration']
    suggestions = ['Rest in a quiet, dark room', 'Stay hydrated - drink plenty of water', 'Apply a cold compress to your forehead']
    medicines = ['Paracetamol 500mg', 'Ibuprofen 200mg']
    remedies = ['Ginger tea', 'Peppermint oil on temples', 'Cold compress']
  } else if (lower.includes('fever') || lower.includes('temperature')) {
    response = 'I understand you are experiencing fever. This could be due to viral infection, flu, or other causes.'
    conditions = ['Viral Fever', 'Common Flu', 'Infection']
    suggestions = ['Rest and drink plenty of fluids', 'Monitor temperature regularly', 'If fever persists more than 3 days, consult a doctor']
    medicines = ['Paracetamol 500mg after food', 'Dolo 650 if needed']
    remedies = ['Warm water with honey and lemon', 'Lukewarm sponge bath', 'Stay hydrated']
  } else if (lower.includes('cough') || lower.includes('cold') || lower.includes('throat')) {
    response = 'I understand you are experiencing cough/cold symptoms. This is commonly caused by viral infections.'
    conditions = ['Common Cold', 'Viral Upper Respiratory Infection', 'Pharyngitis']
    suggestions = ['Gargle with warm salt water', 'Stay warm and rest', 'Drink warm fluids']
    medicines = ['Cough syrup (Benadryl/Corex)', 'Strepsils lozenges']
    remedies = ['Honey with warm water', 'Turmeric milk', 'Steam inhalation']
    specialist = 'ENT Specialist'
  } else if (lower.includes('stomach') || lower.includes('vomit') || lower.includes('nausea') || lower.includes('diarrhea')) {
    response = 'I understand you are having stomach issues. This could be due to food-related causes or infection.'
    conditions = ['Gastritis', 'Food Poisoning', 'Stomach Infection']
    suggestions = ['Stay hydrated with ORS', 'Eat light, bland food', 'Avoid spicy and oily food']
    medicines = ['ORS sachets', 'Pantoprazole 40mg', 'Domperidone if nausea persists']
    remedies = ['Jeera (cumin) water', 'Ginger tea', 'Banana and rice diet']
    specialist = 'Gastroenterologist'
  } else if (lower.includes('skin') || lower.includes('rash') || lower.includes('itching') || lower.includes('acne')) {
    response = 'I understand you have skin-related concerns. Skin issues can have various causes.'
    conditions = ['Allergic Reaction', 'Dermatitis', 'Eczema']
    suggestions = ['Keep the area clean and dry', 'Avoid scratching', 'Use mild soap']
    medicines = ['Cetirizine 10mg (antihistamine)', 'Calamine lotion']
    remedies = ['Aloe vera gel', 'Coconut oil', 'Cold compress on affected area']
    specialist = 'Dermatologist'
  } else {
    response = `I understand you're experiencing "${message}". Let me provide some general guidance.`
    conditions = ['Multiple possible conditions']
    suggestions = ['Monitor your symptoms closely', 'Stay hydrated and rest well', 'If symptoms persist or worsen, consult a doctor']
    medicines = ['Consult a doctor for proper medication']
    remedies = ['Adequate rest', 'Balanced diet', 'Proper hydration']
  }

  return { response, is_general: false, possible_conditions: conditions, suggestions, otc_medicines: medicines, home_remedies: remedies, see_doctor: true, specialist }
}

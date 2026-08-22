import dotenv from 'dotenv'
dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY

// Try multiple model versions in order (newest to oldest) for resilience
const MODEL_NAMES = [
  'gemini-3.7-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
]

function getGeminiUrl(model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
}

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

4. If the user asks a FOLLOW-UP QUESTION about a previous symptom, keep the context and provide a detailed response.

5. VARY your responses — do NOT repeat the same phrases. Be creative and natural in each reply.

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
 * Get varied general responses (randomized to avoid repetition)
 */
function getGeneralResponse(message) {
  const lower = message.toLowerCase().trim()

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

  if (['hi', 'hii', 'hiii', 'hiiii', 'hello', 'hey', 'heyy', 'heyyy', 'yo', 'howdy', 'namaste', 'namaskar'].some(g => lower.startsWith(g))) {
    const responses = [
      "Hello! 👋 I'm MediCare AI, your personal health assistant. How can I help you today?\n\nYou can:\n• Tell me your symptoms and I'll analyze them\n• Ask for home remedies or medicine suggestions\n• Find doctors near your location\n• Get health tips and advice\n\nJust type what's on your mind! 😊",
      "Hey there! 🌟 Welcome to MediCare AI. I'm here to help with any health questions you have!\n\nTry asking me:\n• \"I have a headache\" — I'll suggest remedies\n• \"Find a doctor\" — I'll help locate one nearby\n• Upload a report — I'll analyze it for you\n\nWhat can I do for you? 💙",
      "Hi! 😊 Great to see you! I'm your MediCare AI health companion.\n\nI can help you:\n• Analyze symptoms and suggest conditions\n• Recommend OTC medicines & home remedies\n• Find doctors and pharmacies\n• Read your medical reports with AI\n\nHow are you feeling today?",
      "Namaste! 🙏 I'm MediCare AI — always ready to help with your health concerns.\n\nFeel free to describe any symptoms, ask health questions, or use the quick buttons above!\n\nWhat's on your mind today? 🏥"
    ]
    return {
      response: pick(responses),
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('good morning')) {
    const responses = [
      "Good morning! ☀️ Hope you're feeling great today. I'm MediCare AI, ready to help with any health concerns. How can I assist you?",
      "Good morning! 🌅 Wishing you a healthy day ahead. Need any health advice or symptom check today?",
      "Morning! ☀️ Rise and shine! I'm here if you need any medical guidance or health tips today. What's up?"
    ]
    return { response: pick(responses), is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null }
  }

  if (lower.includes('good afternoon')) {
    const responses = [
      "Good afternoon! 🌤️ I'm MediCare AI. Feel free to ask me about any symptoms or health questions you have!",
      "Afternoon! ☀️ Hope your day is going well. I'm here for any health concerns you'd like to discuss."
    ]
    return { response: pick(responses), is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null }
  }

  if (lower.includes('good evening') || lower.includes('good night')) {
    const responses = [
      "Good evening! 🌙 I'm MediCare AI. Is there anything health-related I can help you with tonight?",
      "Evening! 🌆 Hope you had a good day. Let me know if you have any health questions before you wind down."
    ]
    return { response: pick(responses), is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null }
  }

  if (lower.includes('how are you') || lower.includes('how r u')) {
    const responses = [
      "I'm doing great, thank you for asking! 😊 I'm always ready to help. How are you feeling today? If you have any health concerns, just let me know!",
      "I'm fantastic, thanks! 💪 More importantly, how are YOU doing? Any health questions I can help with?",
      "All systems running perfectly! 🤖💚 What about you — feeling okay today?"
    ]
    return { response: pick(responses), is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null }
  }

  if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('what can you do')) {
    return {
      response: "I'm MediCare AI 🏥 — your intelligent health assistant!\n\nHere's what I can do:\n• 🔍 Analyze your symptoms\n• 💊 Suggest OTC medicines\n• 🌿 Recommend home remedies\n• 👨‍⚕️ Find doctors near you\n• 🗺️ Locate nearby pharmacies\n• 📄 Read and analyze medical reports\n• ⚠️ Detect emergency symptoms\n\nJust describe how you're feeling, and I'll help right away!",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  if (lower.includes('thank') || lower.includes('thnx') || lower.includes('ty')) {
    const responses = [
      "You're welcome! 😊 Take care of your health. Feel free to come back anytime you need help. Wishing you good health! 💚",
      "Glad I could help! 🙏 Stay healthy and don't hesitate to reach out whenever you need me!",
      "Anytime! 💙 Your health is my priority. Wishing you a wonderful day ahead!"
    ]
    return { response: pick(responses), is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null }
  }

  if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see you') || lower.includes('take care')) {
    const responses = [
      "Goodbye! 👋 Take care and stay healthy! Remember, I'm always here if you need health advice. See you soon! 💙",
      "Bye bye! 🤗 Wishing you great health. Come back anytime you need assistance!",
      "See you later! 👋 Stay safe and take care of yourself. I'm just a message away! 💚"
    ]
    return { response: pick(responses), is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null }
  }

  if (['ok', 'okay', 'alright', 'sure', 'cool', 'nice', 'great'].includes(lower)) {
    const responses = [
      "Great! 😊 Is there anything else I can help you with? Feel free to describe any symptoms or health concerns!",
      "Alright! 👍 Let me know if you have any other health questions. I'm here to help!",
      "Perfect! 🌟 Anything else on your mind? I can check symptoms, suggest medicines, or find doctors for you."
    ]
    return { response: pick(responses), is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null }
  }

  if (lower.includes('help')) {
    return {
      response: "Of course, I'm here to help! 🤝\n\nYou can:\n• Describe your symptoms (e.g., \"I have headache and fever\")\n• Ask about a condition (e.g., \"What causes cold?\")\n• Upload a medical report for AI analysis\n• Click the quick symptom buttons above\n\nWhat would you like to know?",
      is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
    }
  }

  // Default general response
  const defaults = [
    "I'm here to help! 😊 Could you tell me more about what you need? You can describe any symptoms or health concerns and I'll do my best to assist you.",
    "I'd love to help! Tell me — are you experiencing any health issues? Or would you like to search for a doctor or pharmacy?",
    "How can I assist you? 🏥 You can ask me anything about symptoms, medicines, or health tips!"
  ]
  return { response: pick(defaults), is_general: true, possible_conditions: [], suggestions: [], otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null }
}

/**
 * Try calling Gemini API with model fallback
 */
async function callGeminiAPI(prompt) {
  for (const model of MODEL_NAMES) {
    try {
      const url = getGeminiUrl(model)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
            responseMimeType: "application/json"
          }
        })
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errText = await response.text()
        console.warn(`Gemini model "${model}" failed (${response.status}):`, errText.substring(0, 200))
        continue // Try the next model
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        console.warn(`Gemini model "${model}" returned empty response`)
        continue
      }

      console.log(`✅ Gemini response received from model: ${model}`)
      return text
    } catch (err) {
      console.warn(`Gemini model "${model}" error:`, err.message)
      continue
    }
  }

  // All models failed
  return null
}

/**
 * Main function - Get AI response for any user message
 */
export async function analyzeSymptoms(userMessage) {
  // Fast path: handle greetings/general chat instantly (no API call needed)
  if (isGeneralChat(userMessage)) {
    return getGeneralResponse(userMessage)
  }

  // Health-related: use Gemini AI with model fallback
  const prompt = `${SYSTEM_PROMPT}\n\nUser says: "${userMessage}"\n\nRespond ONLY with valid JSON, nothing else.`

  const text = await callGeminiAPI(prompt)

  if (text) {
    try {
      return JSON.parse(text)
    } catch {
      // Gemini returned text but not valid JSON — wrap it
      return {
        response: text, is_general: false, suggestions: [], possible_conditions: [],
        otc_medicines: [], home_remedies: [], see_doctor: false, specialist: null
      }
    }
  }

  // All API calls failed — use robust fallback
  console.warn('All Gemini models failed, using local fallback')
  return getFallbackResponse(userMessage)
}

/**
 * Comprehensive fallback for symptom analysis when Gemini is unavailable
 */
function getFallbackResponse(message) {
  const lower = message.toLowerCase()
  let response = '', conditions = [], suggestions = [], medicines = [], remedies = [], specialist = 'General Physician'

  if (lower.includes('headache') || lower.includes('head pain') || lower.includes('migraine')) {
    response = 'I understand you are experiencing a headache. This could be due to stress, dehydration, tension, or a migraine episode. Let me suggest some remedies.'
    conditions = ['Tension Headache', 'Migraine', 'Dehydration', 'Sinusitis']
    suggestions = ['Rest in a quiet, dark room', 'Stay hydrated — drink at least 8 glasses of water today', 'Apply a cold compress to your forehead for 15 minutes', 'Avoid screen time for a while']
    medicines = ['Paracetamol 500mg (after food)', 'Ibuprofen 200mg (if no stomach issues)']
    remedies = ['Ginger tea with honey', 'Peppermint oil applied to temples', 'Cold compress on forehead', 'Deep breathing exercises']
    specialist = 'Neurologist'
  } else if (lower.includes('fever') || lower.includes('temperature') || lower.includes('chills')) {
    response = 'I understand you are experiencing fever. This is often your body\'s response to an infection. Let me help with some guidance.'
    conditions = ['Viral Fever', 'Common Flu', 'Bacterial Infection', 'COVID-19 (if persistent)']
    suggestions = ['Rest and drink plenty of fluids (water, ORS, coconut water)', 'Monitor temperature every 4 hours', 'If fever exceeds 103°F or lasts more than 3 days, see a doctor immediately', 'Wear light clothing and keep the room ventilated']
    medicines = ['Paracetamol 500mg every 6 hours (after food)', 'Dolo 650 if temperature is high']
    remedies = ['Warm water with honey and lemon', 'Lukewarm sponge bath on forehead and armpits', 'Tulsi (holy basil) tea', 'Stay well hydrated with electrolytes']
  } else if (lower.includes('cough') || lower.includes('cold') || lower.includes('throat') || lower.includes('sneez')) {
    response = 'I understand you are experiencing cough/cold symptoms. These are commonly caused by viral infections and usually resolve within a week.'
    conditions = ['Common Cold', 'Viral Upper Respiratory Infection', 'Pharyngitis', 'Allergic Rhinitis']
    suggestions = ['Gargle with warm salt water 3-4 times a day', 'Stay warm and get plenty of rest', 'Drink warm fluids throughout the day', 'Avoid cold drinks and fried food']
    medicines = ['Cough syrup (Benadryl or Honitus)', 'Strepsils or Vicks lozenges for sore throat', 'Cetirizine 10mg if allergic component']
    remedies = ['Honey with warm water (1 tbsp)', 'Turmeric milk (haldi doodh) before bed', 'Steam inhalation with eucalyptus oil', 'Ginger-tulsi kadha']
    specialist = 'ENT Specialist'
  } else if (lower.includes('stomach') || lower.includes('vomit') || lower.includes('nausea') || lower.includes('diarrhea') || lower.includes('gastric') || lower.includes('acidity')) {
    response = 'I understand you are having stomach or digestive issues. This could be due to food, acidity, or an infection. Here\'s what might help.'
    conditions = ['Gastritis', 'Food Poisoning', 'Acid Reflux (GERD)', 'Stomach Infection']
    suggestions = ['Stay hydrated with ORS or nimbu pani', 'Eat light, bland food (khichdi, curd rice)', 'Avoid spicy, oily, and fried food', 'Take small frequent meals instead of large ones']
    medicines = ['ORS sachets (2-3 per day)', 'Pantoprazole 40mg before breakfast', 'Domperidone 10mg if vomiting persists', 'Gelusil/Digene for immediate acidity relief']
    remedies = ['Jeera (cumin) water — boil 1 tsp in water', 'Ginger tea with a pinch of rock salt', 'Banana-rice-toast diet (BRAT diet)', 'Ajwain (carom seeds) with warm water']
    specialist = 'Gastroenterologist'
  } else if (lower.includes('skin') || lower.includes('rash') || lower.includes('itching') || lower.includes('acne') || lower.includes('pimple')) {
    response = 'I understand you have skin-related concerns. Skin issues can have various causes including allergies, infections, or hormonal changes.'
    conditions = ['Allergic Dermatitis', 'Contact Rash', 'Eczema', 'Acne Vulgaris']
    suggestions = ['Keep the affected area clean and dry', 'Avoid scratching to prevent secondary infection', 'Use mild, fragrance-free soap', 'Wear loose, cotton clothing']
    medicines = ['Cetirizine 10mg (antihistamine) once daily', 'Calamine lotion for itching relief', 'Clotrimazole cream if fungal infection suspected']
    remedies = ['Aloe vera gel applied directly', 'Coconut oil for moisturizing dry patches', 'Cold compress on inflamed areas', 'Neem leaves paste for antibacterial effect']
    specialist = 'Dermatologist'
  } else if (lower.includes('chest pain') || lower.includes('heart') || lower.includes('palpitation') || lower.includes('blood pressure')) {
    response = '⚠️ Chest pain and heart-related symptoms should be taken seriously. While it can be muscular or stress-related, please seek immediate medical attention if the pain is severe or persistent.'
    conditions = ['Muscle Strain', 'Anxiety/Stress', 'Acid Reflux', 'Cardiac concern (needs evaluation)']
    suggestions = ['If pain is severe or crushing, call emergency services immediately', 'Sit down and rest — do not exert yourself', 'Take slow, deep breaths', 'If you have prescribed medication (like Sorbitrate), take it under your tongue']
    medicines = ['Aspirin 325mg (only if advised by doctor)', 'Antacid if related to acidity']
    remedies = ['Deep breathing exercises', 'Lie in a comfortable position with head elevated', 'Avoid caffeine and stimulants']
    specialist = 'Cardiologist'
  } else if (lower.includes('anxiety') || lower.includes('stress') || lower.includes('depres') || lower.includes('sleep') || lower.includes('insomnia') || lower.includes('panic')) {
    response = 'I hear you. Mental health is just as important as physical health. Let me share some guidance that might help.'
    conditions = ['Generalized Anxiety', 'Stress Response', 'Insomnia', 'Mild Depression']
    suggestions = ['Practice deep breathing — inhale 4 sec, hold 4 sec, exhale 6 sec', 'Establish a regular sleep schedule', 'Limit screen time before bed', 'Talk to someone you trust about how you feel', 'Consider professional counseling']
    medicines = ['Melatonin 3mg for sleep (short-term)', 'Ashwagandha supplements (herbal)']
    remedies = ['Chamomile tea before bed', 'Warm bath with lavender oil', 'Daily 20-minute walk in nature', 'Journaling your thoughts', 'Guided meditation (apps like Headspace)']
    specialist = 'Psychiatrist / Counselor'
  } else if (lower.includes('back pain') || lower.includes('joint') || lower.includes('knee') || lower.includes('muscle') || lower.includes('body pain') || lower.includes('fatigue')) {
    response = 'Body and joint pains can be caused by various factors including poor posture, overexertion, or nutritional deficiencies.'
    conditions = ['Muscle Strain', 'Vitamin D Deficiency', 'Arthritis', 'Poor Posture Syndrome']
    suggestions = ['Apply hot water bag or heating pad to the affected area', 'Maintain good posture while sitting and sleeping', 'Do gentle stretching exercises daily', 'Get Vitamin D and B12 levels checked']
    medicines = ['Ibuprofen 400mg (after food, for pain)', 'Muscle relaxant spray (Volini/Moov)', 'Calcium + Vitamin D3 supplement']
    remedies = ['Warm oil massage with sesame or mustard oil', 'Epsom salt bath (2 cups in warm bath)', 'Turmeric milk before bed', 'Hot compress for 20 minutes']
    specialist = 'Orthopedic Surgeon'
  } else if (lower.includes('eye') || lower.includes('vision') || lower.includes('blur')) {
    response = 'Eye concerns should be checked properly. Let me provide some initial guidance.'
    conditions = ['Eye Strain (Digital)', 'Dry Eyes', 'Conjunctivitis', 'Refractive Error']
    suggestions = ['Follow the 20-20-20 rule: every 20 min, look at something 20 feet away for 20 seconds', 'Reduce screen brightness and use blue light filters', 'Keep your eyes lubricated with artificial tears']
    medicines = ['Artificial tear eye drops (Refresh Tears)', 'Antihistamine eye drops if allergic']
    remedies = ['Cucumber slices on closed eyes for 10 min', 'Splash cold water on eyes frequently', 'Rose water drops (1-2 drops)']
    specialist = 'Ophthalmologist'
  } else if (lower.includes('tooth') || lower.includes('dental') || lower.includes('gum')) {
    response = 'Dental pain can be quite uncomfortable. Here are some quick relief measures while you schedule a dental visit.'
    conditions = ['Dental Cavity', 'Gingivitis', 'Tooth Sensitivity', 'Dental Abscess']
    suggestions = ['Rinse with warm salt water', 'Avoid very hot or cold foods', 'Schedule a dental checkup as soon as possible']
    medicines = ['Ibuprofen 400mg for pain relief', 'Orajel (Benzocaine gel) for topical relief']
    remedies = ['Clove oil on the affected tooth (numbing effect)', 'Salt water gargle', 'Cold compress on cheek']
    specialist = 'Dentist'
  } else {
    response = `I understand you're experiencing "${message}". Let me provide some general health guidance for you.`
    conditions = ['Multiple possible conditions — needs further evaluation']
    suggestions = ['Monitor your symptoms for 24-48 hours', 'Stay hydrated and get adequate rest', 'Maintain a balanced diet', 'If symptoms persist or worsen, please consult a doctor']
    medicines = ['Consult a doctor for proper medication based on diagnosis']
    remedies = ['Adequate rest and sleep', 'Balanced diet with fruits and vegetables', 'Proper hydration (8-10 glasses of water)', 'Light exercise like walking']
  }

  return { response, is_general: false, possible_conditions: conditions, suggestions, otc_medicines: medicines, home_remedies: remedies, see_doctor: true, specialist }
}

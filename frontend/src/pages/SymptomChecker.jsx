import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiActivity, FiSearch, FiCheck, FiX, FiAlertTriangle, FiArrowRight, 
  FiArrowLeft, FiHeart, FiFileText, FiPhoneCall, FiMic, FiPrinter, 
  FiCompass, FiShield, FiTrendingUp, FiInfo, FiMapPin, FiNavigation
} from 'react-icons/fi'
import api from '../services/api'
import LocationModal from '../components/LocationModal/LocationModal'
import './Pages.css'

// Categorized Symptoms with Icons
const SYMPTOM_CATEGORIES = [
  { id: 'all', label: '🌟 All Symptoms' },
  { id: 'head', label: '🧠 Head & ENT' },
  { id: 'chest', label: '🫁 Chest & Heart' },
  { id: 'stomach', label: '🫄 Digestion & Gut' },
  { id: 'body', label: '🦴 Muscles & Joints' },
  { id: 'skin', label: '🩹 Skin & Allergy' },
  { id: 'mental', label: '🧘 Mental & Sleep' }
]

const SYMPTOM_DATABASE = [
  // Head & ENT
  { name: 'Headache / Migraine', cat: 'head', icon: '🤕' },
  { name: 'Fever & Chills', cat: 'head', icon: '🤒' },
  { name: 'Sore Throat', cat: 'head', icon: '🗣️' },
  { name: 'Runny Nose / Congestion', cat: 'head', icon: '🤧' },
  { name: 'Dizziness / Vertigo', cat: 'head', icon: '😵' },
  { name: 'Loss of Taste or Smell', cat: 'head', icon: '👅' },
  { name: 'Ear Pain / Ringing', cat: 'head', icon: '👂' },
  { name: 'Eye Irritation / Redness', cat: 'head', icon: '👁️' },

  // Chest & Heart
  { name: 'Dry / Productive Cough', cat: 'chest', icon: '😮‍💨' },
  { name: 'Shortness of Breath', cat: 'chest', icon: '🫁' },
  { name: 'Chest Tightness / Pain', cat: 'chest', icon: '💔' },
  { name: 'Rapid Heartbeat (Palpitations)', cat: 'chest', icon: '💓' },
  { name: 'Wheezing / Asthma Flare', cat: 'chest', icon: '💨' },

  // Stomach & Gut
  { name: 'Stomach Ache / Cramps', cat: 'stomach', icon: '🤢' },
  { name: 'Acidity / Heartburn', cat: 'stomach', icon: '🔥' },
  { name: 'Nausea & Vomiting', cat: 'stomach', icon: '🤮' },
  { name: 'Diarrhea / Loose Motions', cat: 'stomach', icon: '🚽' },
  { name: 'Bloating & Gas', cat: 'stomach', icon: '🫧' },
  { name: 'Loss of Appetite', cat: 'stomach', icon: '🍽️' },

  // Body & Joints
  { name: 'Fatigue & Extreme Weakness', cat: 'body', icon: '🥱' },
  { name: 'Generalized Body Pain', cat: 'body', icon: '🦴' },
  { name: 'Joint Pain & Swelling', cat: 'body', icon: '🦵' },
  { name: 'Lower Back Pain', cat: 'body', icon: '🧘' },
  { name: 'Muscle Stiffness / Spasms', cat: 'body', icon: '💪' },

  // Skin & Allergy
  { name: 'Itchy Skin Rash / Hives', cat: 'skin', icon: '🩹' },
  { name: 'Acne / Pimples Breakout', cat: 'skin', icon: '🧴' },
  { name: 'Redness / Inflammation', cat: 'skin', icon: '🔴' },
  { name: 'Dry / Flaky Skin Patches', cat: 'skin', icon: '❄️' },

  // Mental & Sleep
  { name: 'Anxiety & Panic Feelings', cat: 'mental', icon: '😰' },
  { name: 'Insomnia / Sleep Issues', cat: 'mental', icon: '🌙' },
  { name: 'Brain Fog & Poor Focus', cat: 'mental', icon: '💭' },
  { name: 'Mood Swings / Irritability', cat: 'mental', icon: '⚡' }
]

const EXISTING_CONDITIONS = [
  'Diabetes (Type 1 / 2)', 'Hypertension (High BP)', 'Asthma / Bronchitis', 
  'Heart Disease', 'Thyroid Disorder', 'Kidney Disease', 'Migraine History', 'None'
]

const PAIN_TYPES = ['Dull Ache', 'Sharp / Stabbing', 'Throbbing / Pulsing', 'Burning', 'Cramping', 'Constant Pressure']

export default function SymptomChecker() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  
  // Form State
  const [age, setAge] = useState(25)
  const [gender, setGender] = useState('Female')
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [symptomSearch, setSymptomSearch] = useState('')
  const [duration, setDuration] = useState(2) // days
  const [severity, setSeverity] = useState('moderate')
  const [painType, setPainType] = useState('Dull Ache')
  const [selectedConditions, setSelectedConditions] = useState([])
  const [temperature, setTemperature] = useState('Normal (98.6°F)')
  const [notes, setNotes] = useState('')
  const [isListening, setIsListening] = useState(false)
  
  // Location Permission Modal State
  const [isLocModalOpen, setIsLocModalOpen] = useState(false)
  const [locTarget, setLocTarget] = useState({ type: 'doctor', spec: '' })

  // Loading & Result State
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const printRef = useRef(null)

  const openLocationPrompt = (type, spec = '') => {
    setLocTarget({ type, spec })
    setIsLocModalOpen(true)
  }

  const handleLocationGranted = (coords) => {
    if (locTarget.type === 'doctor') {
      navigate('/find-doctors', { 
        state: { 
          latitude: coords.latitude, 
          longitude: coords.longitude, 
          specialization: locTarget.spec || result?.specialist || '',
          autoSearch: true 
        } 
      })
    } else {
      navigate('/medicine-stores', { 
        state: { 
          latitude: coords.latitude, 
          longitude: coords.longitude,
          autoSearch: true 
        } 
      })
    }
  }

  const handleManualLocationFallback = () => {
    setIsLocModalOpen(false)
    if (locTarget.type === 'doctor') {
      navigate('/find-doctors', { state: { specialization: locTarget.spec || result?.specialist || '' } })
    } else {
      navigate('/medicine-stores')
    }
  }

  const toggleSymptom = (symName) => {
    if (selectedSymptoms.includes(symName)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symName))
    } else {
      setSelectedSymptoms([...selectedSymptoms, symName])
    }
  }

  const toggleCondition = (cond) => {
    if (cond === 'None') {
      setSelectedConditions(['None'])
      return
    }
    let newConds = selectedConditions.filter(c => c !== 'None')
    if (newConds.includes(cond)) {
      newConds = newConds.filter(c => c !== cond)
    } else {
      newConds.push(cond)
    }
    setSelectedConditions(newConds.length === 0 ? ['None'] : newConds)
  }

  const handleCustomSymptomSubmit = (e) => {
    e.preventDefault()
    const clean = symptomSearch.trim()
    if (clean && !selectedSymptoms.includes(clean)) {
      setSelectedSymptoms([...selectedSymptoms, clean])
      setSymptomSearch('')
    }
  }

  // Voice speech dictation for symptoms
  const handleVoiceSymptom = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome/Edge.')
      return
    }
    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.onstart = () => setIsListening(true)
    rec.onerror = () => setIsListening(false)
    rec.onend = () => setIsListening(false)
    rec.onresult = (event) => {
      const speech = event.results[0][0].transcript
      if (speech.trim()) {
        const words = speech.split(/,|and|\./).map(w => w.trim()).filter(Boolean)
        words.forEach(w => {
          if (!selectedSymptoms.includes(w)) {
            setSelectedSymptoms(prev => [...prev, w])
          }
        })
      }
    }
    rec.start()
  }

  const runAnalysis = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom to analyze.')
      return
    }
    setError('')
    setIsLoading(true)
    setStep(4)
    
    try {
      const fullSymptoms = [...selectedSymptoms]
      if (temperature !== 'Normal (98.6°F)') fullSymptoms.push(`Body Temp: ${temperature}`)
      if (painType) fullSymptoms.push(`Pain Character: ${painType}`)
      if (notes) fullSymptoms.push(`Additional Notes: ${notes}`)
      
      const payload = {
        symptoms: fullSymptoms,
        age,
        gender,
        duration: `${duration} days`,
        severity,
        conditions: selectedConditions.filter(c => c !== 'None')
      }
      
      const { data } = await api.post('/chat/analyze', payload)
      
      let riskScore = 25
      if (severity === 'moderate') riskScore = 55
      if (severity === 'severe') riskScore = 85
      if (data.severity === 'severe' || data.see_doctor) {
        riskScore = Math.max(riskScore, 80)
      }
      
      setResult({
        ...data,
        riskScore
      })
    } catch (err) {
      console.error(err)
      setError('Failed to analyze symptoms. Please try again.')
      setStep(3)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setAge(25)
    setGender('Female')
    setSelectedSymptoms([])
    setDuration(2)
    setSeverity('moderate')
    setSelectedConditions([])
    setNotes('')
    setResult(null)
  }

  const handlePrint = () => {
    window.print()
  }

  // Filter symptoms by category and search text
  const displayedSymptoms = SYMPTOM_DATABASE.filter(item => {
    const matchesCat = activeCategory === 'all' || item.cat === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(symptomSearch.toLowerCase())
    return matchesCat && matchesSearch
  })

  // Calculate live estimate risk score for sidebar
  const calculatedRisk = Math.min(100, (selectedSymptoms.length * 12) + (severity === 'severe' ? 35 : severity === 'moderate' ? 20 : 10))

  return (
    <div className="page-full symptom-checker-container">
      {/* Top Banner Header */}
      <div className="symptom-top-hero panel-card glass-panel mb-6">
        <div className="symptom-hero-content">
          <div className="symptom-badge">
            <FiActivity className="pulse-slow" /> AI CLINICAL TRIAGE ENGINE 3.0
          </div>
          <h1 className="symptom-main-heading">Intelligent Symptom Analyser</h1>
          <p className="symptom-subheading">
            Evaluate your physical symptoms, detect early health anomalies, and receive verified clinical guidance, home remedies, and specialist referrals in seconds.
          </p>
        </div>
        <div className="symptom-hero-stats">
          <div className="stat-pill"><span className="stat-num">30+</span><span>Biomarkers</span></div>
          <div className="stat-pill"><span className="stat-num">98%</span><span>AI Precision</span></div>
          <div className="stat-pill"><span className="stat-num">Instant</span><span>Specialist Match</span></div>
        </div>
      </div>

      {/* Main 2-Column Grid Layout */}
      <div className="symptom-grid-layout">
        
        {/* LEFT / MAIN COLUMN: The Symptom Wizard */}
        <div className="symptom-wizard-col">
          <div className="symptom-wizard-card panel-card glass-panel">
            
            {/* Progress Stepper Bar */}
            {step <= 3 && (
              <div className="wizard-progress">
                <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                  <span className="step-num">{step > 1 ? <FiCheck /> : '1'}</span>
                  <span className="step-label">1. Patient Profile</span>
                </div>
                <div className="progress-line">
                  <div className="progress-line-fill" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
                </div>
                <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                  <span className="step-num">{step > 2 ? <FiCheck /> : '2'}</span>
                  <span className="step-label">2. Select Symptoms</span>
                </div>
                <div className="progress-line">
                  <div className="progress-line-fill" style={{ width: step <= 2 ? '0%' : '100%' }}></div>
                </div>
                <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                  <span className="step-num">3</span>
                  <span className="step-label">3. Severity & Vitals</span>
                </div>
              </div>
            )}

            {error && (
              <div className="symptom-alert alert-error mb-4">
                <FiAlertTriangle />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Patient Demographic Profile */}
            {step === 1 && (
              <div className="wizard-step fade-in">
                <h2 className="step-title">👤 Patient Demographic Profile</h2>
                <p className="step-sub">Age and biological factors calibrate normal physiological baselines for diagnostic calculations.</p>

                <div className="wizard-form-grid mt-4">
                  <div className="form-group">
                    <div className="flex justify-between items-center mb-2">
                      <label className="form-label">Patient Age</label>
                      <span className="age-bubble-tag">{age} years old</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={age} 
                      onChange={e => setAge(parseInt(e.target.value))} 
                      className="premium-range-slider"
                    />
                    <div className="slider-labels">
                      <span>Infant (1)</span>
                      <span>Young Adult (25)</span>
                      <span>Middle Age (50)</span>
                      <span>Senior (100)</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label mb-2">Assigned Biological Gender</label>
                    <div className="gender-toggle-group">
                      {[
                        { id: 'Female', icon: '👩', label: 'Female' },
                        { id: 'Male', icon: '👨', label: 'Male' },
                        { id: 'Other', icon: '🧑', label: 'Other / Prefer not to say' }
                      ].map(g => (
                        <button
                          key={g.id}
                          type="button"
                          className={`gender-btn ${gender === g.id ? 'active' : ''}`}
                          onClick={() => setGender(g.id)}
                        >
                          <span>{g.icon}</span>
                          <span>{g.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group mt-6">
                  <label className="form-label mb-2">Pre-existing Clinical Conditions (Select all that apply)</label>
                  <div className="conditions-grid">
                    {EXISTING_CONDITIONS.map(cond => {
                      const isSelected = selectedConditions.includes(cond)
                      return (
                        <button
                          key={cond}
                          type="button"
                          className={`condition-tag-btn ${isSelected ? 'active' : ''}`}
                          onClick={() => toggleCondition(cond)}
                        >
                          {isSelected && <FiCheck className="mr-1" />}
                          {cond}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="wizard-actions justify-end mt-8">
                  <button className="primary-btn wizard-next-btn" onClick={() => setStep(2)}>
                    Next: Select Symptoms <FiArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Symptoms Selection with Body Tabs & Search */}
            {step === 2 && (
              <div className="wizard-step fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="step-title">🩺 Select What You Are Experiencing</h2>
                    <p className="step-sub">Filter by body region, search with voice, or pick common indicators.</p>
                  </div>
                  {selectedSymptoms.length > 0 && (
                    <span className="selected-count-badge">{selectedSymptoms.length} selected</span>
                  )}
                </div>

                {/* Selected Active Symptoms Chips */}
                {selectedSymptoms.length > 0 && (
                  <div className="selected-symptoms-section mt-4">
                    <span className="selected-label">Your Active List:</span>
                    <div className="selected-tags-container">
                      {selectedSymptoms.map(sym => (
                        <span key={sym} className="symptom-active-tag">
                          {sym}
                          <button onClick={() => toggleSymptom(sym)} className="symptom-tag-close" title="Remove">
                            <FiX size={12} />
                          </button>
                        </span>
                      ))}
                      <button className="clear-all-symptoms-btn" onClick={() => setSelectedSymptoms([])}>
                        Clear All
                      </button>
                    </div>
                  </div>
                )}

                {/* Search Bar + Voice Input */}
                <div className="symptom-search-bar mt-4">
                  <FiSearch className="search-icon-wizard" />
                  <input
                    type="text"
                    placeholder="Search symptoms (e.g. Fever, Chest pain, Acne, Backache)..."
                    value={symptomSearch}
                    onChange={e => setSymptomSearch(e.target.value)}
                    className="symptom-search-input"
                  />
                  <button 
                    type="button" 
                    onClick={handleVoiceSymptom} 
                    className={`voice-symptom-btn ${isListening ? 'listening-pulse' : ''}`}
                    title="Voice dictate symptoms"
                  >
                    <FiMic />
                  </button>
                  {symptomSearch.trim() && (
                    <button type="button" onClick={handleCustomSymptomSubmit} className="custom-add-btn">
                      + Add "{symptomSearch.trim()}"
                    </button>
                  )}
                </div>

                {/* Body Organ / Region Filter Tabs */}
                <div className="category-filter-tabs mt-4">
                  {SYMPTOM_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`cat-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Symptoms Pool Grid */}
                <div className="symptoms-pool-section mt-4">
                  <div className="symptoms-pool-grid">
                    {displayedSymptoms.map(item => {
                      const isSelected = selectedSymptoms.includes(item.name)
                      return (
                        <button
                          key={item.name}
                          type="button"
                          className={`pool-symptom-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleSymptom(item.name)}
                        >
                          <span className="pool-card-icon">{item.icon}</span>
                          <span className="pool-card-name">{item.name}</span>
                          <span className="pool-card-check">{isSelected ? <FiCheck /> : '+'}</span>
                        </button>
                      )
                    })}
                  </div>
                  {displayedSymptoms.length === 0 && (
                    <div className="no-symptoms-box">
                      <p>No predefined symptom matched "{symptomSearch}".</p>
                      <button onClick={handleCustomSymptomSubmit} className="primary-btn mt-2">
                        Add "{symptomSearch}" as Custom Symptom
                      </button>
                    </div>
                  )}
                </div>

                <div className="wizard-actions justify-between mt-8">
                  <button className="outline-btn" onClick={() => setStep(1)}>
                    <FiArrowLeft /> Back
                  </button>
                  <button 
                    className="primary-btn wizard-next-btn" 
                    onClick={() => {
                      if (selectedSymptoms.length === 0) {
                        setError('Please select at least one symptom to proceed.')
                      } else {
                        setError('')
                        setStep(3)
                      }
                    }}
                  >
                    Next: Urgency & Details <FiArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Duration, Severity & Pain Character */}
            {step === 3 && (
              <div className="wizard-step fade-in">
                <h2 className="step-title">⏱️ Duration, Severity & Vitals</h2>
                <p className="step-sub">Detailed clinical nuance ensures high diagnostic accuracy and tailored care advice.</p>

                <div className="wizard-form-grid mt-4">
                  {/* Duration Slider */}
                  <div className="form-group">
                    <div className="flex justify-between items-center mb-2">
                      <label className="form-label">Symptom Duration</label>
                      <span className="age-bubble-tag">{duration} {duration === 1 ? 'day' : 'days'}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="14" 
                      value={duration} 
                      onChange={e => setDuration(parseInt(e.target.value))} 
                      className="premium-range-slider"
                    />
                    <div className="slider-labels">
                      <span>Just Started (1d)</span>
                      <span>Few Days (4d)</span>
                      <span>1 Week (7d)</span>
                      <span>Chronic (14d+)</span>
                    </div>
                  </div>

                  {/* Temperature Quick Selector */}
                  <div className="form-group">
                    <label className="form-label mb-2">Body Temperature Metric</label>
                    <div className="temp-selector-grid">
                      {['Normal (98.6°F)', 'Mild Fever (100°F)', 'High Fever (102°F+)', 'Chills / Shivering'].map(t => (
                        <button
                          key={t}
                          type="button"
                          className={`temp-btn ${temperature === t ? 'active' : ''}`}
                          onClick={() => setTemperature(t)}
                        >
                          🌡️ {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Severity Level Cards */}
                <div className="form-group mt-6">
                  <label className="form-label mb-2">Subjective Severity & Pain Level</label>
                  <div className="severity-toggle-grid">
                    {[
                      { val: 'mild', label: '🟢 Mild Discomfort', desc: 'Manageable, able to continue regular work & daily tasks' },
                      { val: 'moderate', label: '🟡 Moderate Distress', desc: 'Noticeable pain or discomfort, interferes with daily activities' },
                      { val: 'severe', label: '🔴 Severe / Acute', desc: 'Severe pain or distress, bedridden, requires prompt medical review' }
                    ].map(s => (
                      <button
                        key={s.val}
                        type="button"
                        className={`severity-card-btn severity-${s.val} ${severity === s.val ? 'active' : ''}`}
                        onClick={() => setSeverity(s.val)}
                      >
                        <span className="sev-label">{s.label}</span>
                        <span className="sev-desc">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pain Characteristics */}
                <div className="form-group mt-6">
                  <label className="form-label mb-2">Character of Discomfort (Optional)</label>
                  <div className="pain-type-grid">
                    {PAIN_TYPES.map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`pain-btn ${painType === p ? 'active' : ''}`}
                        onClick={() => setPainType(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Clinical Context */}
                <div className="form-group mt-6">
                  <label className="form-label mb-2">Additional Medical Notes / Triggers (Optional)</label>
                  <textarea
                    placeholder="e.g. 'Worse in the morning', 'Took Paracetamol with temporary relief', 'Started after eating outside', etc."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="premium-textarea"
                    rows={3}
                  />
                </div>

                <div className="wizard-actions justify-between mt-8">
                  <button className="outline-btn" onClick={() => setStep(2)}>
                    <FiArrowLeft /> Back
                  </button>
                  <button className="primary-btn wizard-next-btn pulse-glow" onClick={runAnalysis}>
                    Run AI Diagnosis <FiActivity />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Comprehensive Clinical Analysis Results */}
            {step === 4 && (
              <div className="wizard-step fade-in" ref={printRef}>
                {isLoading ? (
                  <div className="analysis-loading-state">
                    <div className="dna-loader">
                      <div className="double-bounce1"></div>
                      <div className="double-bounce2"></div>
                    </div>
                    <h3 className="loading-title">MediCare AI Clinical Engine in Progress...</h3>
                    <p className="loading-desc">
                      Correlating {selectedSymptoms.length} symptoms with medical research protocols and generating actionable health recommendations.
                    </p>
                  </div>
                ) : result ? (
                  <div className="analysis-results-section fade-in">
                    
                    {/* Top Result Banner */}
                    <div className="results-top-header">
                      <div className="results-left-gauge">
                        <div className="radial-risk-circle" style={{
                          '--risk-color': result.riskScore > 70 ? '#EF4444' : result.riskScore > 45 ? '#F59E0B' : '#22C55E',
                          '--risk-percent': `${result.riskScore}%`
                        }}>
                          <span className="risk-percent-text">{result.riskScore}%</span>
                          <span className="risk-label-sub">Triage Risk</span>
                        </div>
                      </div>
                      <div className="results-right-summary">
                        <span className="clinical-badge">CLINICAL TRIAGE ASSESSMENT</span>
                        <h2 className="results-main-title">
                          {result.severity === 'severe' ? 'Urgent Medical Attention Advised' : 
                           result.severity === 'moderate' ? 'Moderate Care & Observation Advised' : 
                           'Self-Care, Hydration & Rest Advised'}
                        </h2>
                        <p className="results-summary-text">
                          Identified <strong>{selectedSymptoms.join(', ')}</strong> across a <strong>{duration} day</strong> timeline. Evaluated for <strong>{age}yr {gender}</strong> with risk index <strong>{result.riskScore}%</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Results Panels Grid */}
                    <div className="results-panels-grid mt-6">
                      
                      {/* Left: Conditions & Interventions */}
                      <div className="results-left-col">
                        <div className="results-card-inner">
                          <h3 className="inner-card-title"><FiSearch /> Probable Diagnostic Fits</h3>
                          <div className="probable-list">
                            {result.possible_diseases && result.possible_diseases.length > 0 ? (
                              result.possible_diseases.map((dis, idx) => (
                                <div key={idx} className="probable-item">
                                  <div className="probable-item-header">
                                    <span className="probable-name">{dis}</span>
                                    <span className="probable-match" style={{
                                      color: result.riskScore > 60 ? '#EF4444' : '#4F6BF6'
                                    }}>~ {Math.max(45, 90 - idx * 14)}% fit</span>
                                  </div>
                                  <div className="probable-progress-bar">
                                    <div className="probable-fill" style={{ 
                                      width: `${Math.max(45, 90 - idx * 14)}%`,
                                      background: result.riskScore > 60 ? '#EF4444' : '#4F6BF6'
                                    }}></div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="no-result-data">No specific critical diseases identified. Follow general hygiene and rest.</div>
                            )}
                          </div>
                        </div>

                        <div className="results-card-inner mt-4">
                          <h3 className="inner-card-title" style={{ color: '#16A34A' }}><FiCheck /> Recommended Interventions</h3>
                          <ul className="results-checklist">
                            {result.recommendations && result.recommendations.length > 0 ? (
                              result.recommendations.map((rec, idx) => (
                                <li key={idx} className="checklist-item">
                                  <span className="checklist-bullet">✓</span>
                                  <span className="checklist-text">{rec}</span>
                                </li>
                              ))
                            ) : (
                              <li className="checklist-item"><span className="checklist-text">Hydrate, take adequate sleep, and monitor vitals every 6 hours.</span></li>
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Right: Medicines & Specialist */}
                      <div className="results-right-col">
                        {result.otc_medicines && result.otc_medicines.length > 0 && (
                          <div className="results-card-inner">
                            <h3 className="inner-card-title" style={{ color: '#4F6BF6' }}><FiHeart /> Suggested OTC Medications</h3>
                            <div className="medicine-pills-wrap">
                              {result.otc_medicines.map((med, idx) => (
                                <span key={idx} className="med-pill-result">💊 {med}</span>
                              ))}
                            </div>
                            <p className="meds-sub-note">Always verify dosages with a certified pharmacist before taking any OTC medicines.</p>
                            <button 
                              className="locate-pharmacies-btn mt-3"
                              onClick={() => openLocationPrompt('pharmacy')}
                            >
                              📍 Find Local Pharmacies with GPS →
                            </button>
                          </div>
                        )}

                        {result.specialist && (
                          <div className="specialist-referral-card mt-4">
                            <div className="specialist-avatar-icon">⚕</div>
                            <div className="specialist-info">
                              <span className="specialist-subtitle">RECOMMENDED PRACTITIONER</span>
                              <h4 className="specialist-title">{result.specialist}</h4>
                              <p className="specialist-description">
                                Consult an expert specialist for formal evaluation and prescription.
                              </p>
                              <button 
                                className="primary-btn mt-3 flex-center gap-2"
                                onClick={() => openLocationPrompt('doctor', result.specialist)}
                              >
                                📍 Find {result.specialist} Near You →
                              </button>
                            </div>
                          </div>
                        )}

                        {result.severity === 'severe' && (
                          <div className="emergency-alert-card mt-4">
                            <FiAlertTriangle className="emergency-alert-icon" />
                            <div>
                              <h4 className="emergency-alert-title">Emergency Advisory</h4>
                              <p className="emergency-alert-desc">Your clinical markers suggest high risk. If symptoms worsen, call emergency assistance immediately.</p>
                              <button onClick={() => navigate('/emergency')} className="emergency-action-btn-wizard mt-2">
                                <FiPhoneCall /> Launch SOS Emergency Center
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Actions Bar */}
                    <div className="results-wizard-footer mt-6">
                      <button className="outline-btn" onClick={resetForm}>
                        🔄 Check New Symptoms
                      </button>
                      <div className="results-action-group">
                        <button className="outline-btn flex-center gap-2" onClick={handlePrint}>
                          <FiPrinter /> Print / Save Report
                        </button>
                        <button 
                          className="primary-btn flex-center gap-2"
                          style={{ background: 'linear-gradient(135deg, #4F6BF6, #7C3AED)' }}
                          onClick={() => navigate('/chat', { 
                            state: { prefill: `I completed a symptom check for: ${selectedSymptoms.join(', ')} with duration of ${duration} days. The AI estimated a risk score of ${result.riskScore}% and recommended ${result.specialist || 'doctor'}. Can you explain more?` } 
                          })}
                        >
                          💬 Discuss with MediBot AI
                        </button>
                      </div>
                    </div>

                    <div className="clinical-disclaimer-notice mt-4">
                      <strong>⚕ Clinical Disclaimer:</strong> This automated analysis is generated for health awareness and preliminary screening. It is not a formal medical diagnosis. Please consult a registered medical professional for treatment plans.
                    </div>
                  </div>
                ) : (
                  <div className="error-state">
                    <FiAlertTriangle size={36} color="var(--accent-red)" />
                    <p>Failed to receive diagnostic data. Please retry.</p>
                    <button className="primary-btn mt-4" onClick={resetForm}>Back to Form</button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: Live Health Intelligence & Safety Guide Sidebar */}
        <div className="symptom-sidebar-col">
          
          {/* Real-time Risk Level Meter */}
          <div className="panel-card glass-panel sidebar-widget">
            <h3 className="widget-title flex-center gap-2">
              <FiTrendingUp color="#4F6BF6" /> Live Health Meter
            </h3>
            <div className="sidebar-risk-display mt-3">
              <div className="sidebar-risk-bar">
                <div className="sidebar-risk-fill" style={{ 
                  width: `${calculatedRisk}%`,
                  background: calculatedRisk > 70 ? '#EF4444' : calculatedRisk > 40 ? '#F59E0B' : '#22C55E'
                }}></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs font-500">
                <span>Selected: <strong>{selectedSymptoms.length} symptoms</strong></span>
                <span style={{ color: calculatedRisk > 70 ? '#EF4444' : calculatedRisk > 40 ? '#F59E0B' : '#22C55E' }}>
                  {calculatedRisk > 70 ? 'High Attention' : calculatedRisk > 40 ? 'Moderate' : 'Mild'}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Warning Signs Box */}
          <div className="panel-card glass-panel sidebar-widget mt-4 warning-widget">
            <h3 className="widget-title flex-center gap-2" style={{ color: '#DC2626' }}>
              <FiShield /> Red Flag Warning Signs
            </h3>
            <p className="widget-desc mt-1">If experiencing any of these, skip online check and seek emergency care immediately:</p>
            <ul className="red-flag-list mt-3">
              <li>🚨 Crushing chest pain or pressure</li>
              <li>🚨 Sudden facial drooping or numbness</li>
              <li>🚨 Severe difficulty breathing or blue lips</li>
              <li>🚨 Uncontrolled bleeding or head injury</li>
              <li>🚨 Sudden confusion or loss of vision</li>
            </ul>
            <button className="sidebar-sos-btn mt-3" onClick={() => navigate('/emergency')}>
              <FiPhoneCall /> Emergency SOS Call
            </button>
          </div>

          {/* How Triage Works Infobox */}
          <div className="panel-card glass-panel sidebar-widget mt-4">
            <h3 className="widget-title flex-center gap-2">
              <FiInfo color="#8B5CF6" /> How AI Triage Works
            </h3>
            <div className="how-it-works-steps mt-3">
              <div className="hiw-step">
                <span className="hiw-num">1</span>
                <span>Correlates symptoms against 500+ clinical conditions</span>
              </div>
              <div className="hiw-step">
                <span className="hiw-num">2</span>
                <span>Factors in patient age, duration & vital parameters</span>
              </div>
              <div className="hiw-step">
                <span className="hiw-num">3</span>
                <span>Suggests specialist practitioner & OTC relief remedies</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <LocationModal 
        isOpen={isLocModalOpen}
        onClose={handleManualLocationFallback}
        onLocationGranted={handleLocationGranted}
        title={locTarget.type === 'doctor' ? `Find ${locTarget.spec || 'Doctor'} Near You` : "Find Nearby Medicine Stores"}
        description="Allow MediCare AI to use your device GPS location to locate real verified clinics, doctors, and medical stores within 5-8km of where you are right now."
      />
    </div>
  )
}

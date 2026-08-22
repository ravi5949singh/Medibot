import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiMic, FiPhoneCall, FiActivity, FiMapPin, FiCalendar, FiFileText, FiClock, FiCheck, FiNavigation, FiHeart, FiUser } from 'react-icons/fi'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './Home.css'

const SUGGESTION_POOL = [
  { term: 'Cardiologist', type: 'doctor', spec: 'Cardiologist' },
  { term: 'Dermatologist', type: 'doctor', spec: 'Dermatologist' },
  { term: 'Pediatrician', type: 'doctor', spec: 'Pediatrician' },
  { term: 'General Physician', type: 'doctor', spec: 'General Physician' },
  { term: 'Paracetamol', type: 'medicine' },
  { term: 'Amoxicillin', type: 'medicine' },
  { term: 'Ibuprofen', type: 'medicine' },
  { term: 'Cough Syrup', type: 'medicine' },
  { term: 'Fever', type: 'symptom' },
  { term: 'Headache', type: 'symptom' },
  { term: 'Stomach Pain', type: 'symptom' },
  { term: 'Cough & Cold', type: 'symptom' },
  { term: 'Diabetes', type: 'symptom' }
]

const MOCK_DOCTORS = [
  { id: '1', name: 'Dr. Ravi Sharma', spec: 'Cardiologist', rating: '4.9', distance: '1.2 km' },
  { id: '2', name: 'Dr. Priya Patel', spec: 'Pediatrician', rating: '4.8', distance: '1.8 km' },
  { id: '3', name: 'Dr. Amit Verma', spec: 'Dermatologist', rating: '4.7', distance: '2.5 km' },
  { id: '4', name: 'Dr. Sunita Rao', spec: 'General Physician', rating: '4.6', distance: '2.9 km' }
]

const MOCK_PHARMACIES = [
  { id: '1', name: 'Metro Pharmacy & Wellness', address: 'Plot 45, Arera Colony', phone: '+91 98765 01234' },
  { id: '2', name: 'Apollo Pharmacy 24/7', address: 'MP Nagar Zone II', phone: '+91 98765 12345' },
  { id: '3', name: 'Reddy Meds & Surgical', address: 'Bittan Market Main Rd', phone: '+91 98765 23456' },
  { id: '4', name: 'LifeCare Chemists', address: 'Kolar Road Square', phone: '+91 98765 34567' }
]

const MOCK_TIPS = [
  { title: 'Stay Hydrated Today', body: 'Drinking 8 glasses of water helps maintain blood pressure, digestive ease, and overall mental focus.', icon: '💧' },
  { title: 'Opt for Whole Grains', body: 'Whole wheat, oats, and brown rice provide rich fiber profiles that balance sugar spikes naturally.', icon: '🌾' },
  { title: 'Prioritize Sound Sleep', body: 'Aim for 7-8 hours of uninterrupted rest to facilitate cellular repair and memory consolidation.', icon: '💤' },
  { title: 'Take Active Micro-Breaks', body: 'Every 45 minutes of desk work, stand up and stretch for 3 minutes to relieve lumbar muscle strain.', icon: '🧘' }
]

export default function Home() {
  const navigate = useNavigate()
  
  // Profile Data
  const [profile, setProfile] = useState({ name: 'User' })
  useEffect(() => {
    try {
      const saved = localStorage.getItem('medicare_profile')
      if (saved) setProfile(JSON.parse(saved))
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const history = localStorage.getItem('medicare_search_history')
      return history ? JSON.parse(history) : ['Paracetamol', 'Cardiologist', 'Fever remedy']
    } catch {
      return []
    }
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [quickConsultInput, setQuickConsultInput] = useState('')

  // Map & Tip Carousel
  const [tipIndex, setTipIndex] = useState(0)

  // Autocomplete Engine
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions([])
      return
    }
    const filtered = SUGGESTION_POOL.filter(item => 
      item.term.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setSuggestions(filtered)
  }, [searchQuery])

  // Speech Recognition (Voice Search)
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please try Chrome/Edge.')
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onstart = () => {
      setIsListening(true)
    }

    rec.onerror = (e) => {
      console.error('Speech error', e)
      setIsListening(false)
    }

    rec.onend = () => {
      setIsListening(false)
    }

    rec.onresult = (event) => {
      const speechToText = event.results[0][0].transcript
      setSearchQuery(speechToText)
      handleExecuteSearch(speechToText)
    }

    rec.start()
  }

  // Execute Search
  const handleExecuteSearch = (queryText) => {
    const clean = (queryText || searchQuery).trim()
    if (!clean) return

    // Save to history
    const updatedHistory = [clean, ...searchHistory.filter(h => h !== clean)].slice(0, 5)
    setSearchHistory(updatedHistory)
    localStorage.setItem('medicare_search_history', JSON.stringify(updatedHistory))
    setShowSuggestions(false)

    // Match suggestion or determine routing
    const match = SUGGESTION_POOL.find(item => item.term.toLowerCase() === clean.toLowerCase())
    
    if (match) {
      if (match.type === 'doctor') {
        navigate('/find-doctors', { state: { specialization: match.spec } })
      } else if (match.type === 'medicine') {
        navigate('/medicine-stores', { state: { medicine: match.term } })
      } else if (match.type === 'symptom') {
        navigate('/chat', { state: { prefill: `I am experiencing ${match.term}. Can you analyze my symptom?` } })
      }
    } else {
      // Fallback guess logic
      const lower = clean.toLowerCase()
      if (lower.includes('doctor') || lower.includes('cardiologist') || lower.includes('pediatrician') || lower.includes('physician') || lower.includes('dermatologist')) {
        navigate('/find-doctors', { state: { specialization: clean } })
      } else if (lower.includes('med') || lower.includes('tablet') || lower.includes('pharmacy') || lower.includes('paracetamol') || lower.includes('ibuprofen')) {
        navigate('/medicine-stores', { state: { medicine: clean } })
      } else {
        // Redirect to AI Chat with prompt
        navigate('/chat', { state: { prefill: clean } })
      }
    }
  }

  // Quick Consult Box submit
  const handleQuickConsultSubmit = (e) => {
    e.preventDefault()
    if (!quickConsultInput.trim()) return
    navigate('/chat', { state: { prefill: quickConsultInput } })
  }

  // Dynamic Map Mounting
  useEffect(() => {
    const mapContainer = L.DomUtil.get('home-map')
    if (mapContainer != null) {
      mapContainer._leaflet_id = null
    }

    const lat = 23.2599
    const lng = 77.4126
    const map = L.map('home-map', { zoomControl: false }).setView([lat, lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map)

    // User Location Marker
    L.circle([lat, lng], { radius: 200, color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.15 }).addTo(map)

    // Doctor Markers (Red Cross)
    const docIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/809/809988.png',
      iconSize: [20, 20]
    })
    L.marker([lat + 0.008, lng - 0.005], { icon: docIcon }).addTo(map).bindPopup('Dr. Ravi Sharma (Cardiologist)')
    L.marker([lat - 0.006, lng + 0.009], { icon: docIcon }).addTo(map).bindPopup('Dr. Priya Patel (Pediatrician)')

    // Pharmacy Markers (Blue Pill)
    const phIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/881/881501.png',
      iconSize: [20, 20]
    })
    L.marker([lat + 0.003, lng + 0.007], { icon: phIcon }).addTo(map).bindPopup('Metro Pharmacy')
    L.marker([lat - 0.005, lng - 0.004], { icon: phIcon }).addTo(map).bindPopup('Apollo Pharmacy')

  }, [])

  // Health Tips Rotator
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % MOCK_TIPS.length)
    }, 6000)
    return () => clearInterval(tipTimer)
  }, [])

  return (
    <div className="home-dashboard-container page-content">
      {/* LEFT COLUMN: Hero, Search, Actions, Inline Consult */}
      <div className="home-main-col">
        
        {/* PREMIUM HERO SECTION WITH 3D CSS MEDIBOT */}
        <section className="home-hero-hero-card panel-card glass-panel relative overflow-hidden">
          <div className="hero-grid-split">
            
            <div className="hero-text-side">
              <span className="hero-welcome-badge"><FiActivity className="pulse-slow" /> ACTIVE TELEHEALTH PORTAL</span>
              <h1 className="hero-heading">Welcome Back, <span className="gradient-text">{profile.name}</span></h1>
              <p className="hero-subheading text-secondary">
                Meet **MediBot**, your clinical AI medical assistant. Tell it your symptoms, scan health files, or search nearby clinics instantly.
              </p>
              
              <div className="hero-status-widgets mt-4">
                <div className="status-item-mini">
                  <span className="dot-indicator green"></span>
                  <span className="text-secondary font-500">AI Engine: Online</span>
                </div>
                <div className="status-item-mini">
                  <span className="dot-indicator blue"></span>
                  <span className="text-secondary font-500">4 Clinics Near You</span>
                </div>
              </div>
            </div>

            {/* 3D MEDICAL ANIMATION HERO */}
            <div className="hero-robot-side">
              <div className="medical-anim-container">
                {/* ECG / Heartbeat line */}
                <div className="ecg-wrapper">
                  <svg className="ecg-svg" viewBox="0 0 320 80" preserveAspectRatio="none">
                    <polyline
                      className="ecg-line"
                      points="0,50 40,50 55,50 65,10 75,70 85,15 95,50 140,50 155,50 165,10 175,70 185,15 195,50 240,50 255,50 265,10 275,70 285,15 295,50 320,50"
                    />
                  </svg>
                </div>

                {/* DNA Helix rings */}
                <div className="dna-helix">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`dna-ring dna-ring-${i}`}>
                      <div className="dna-dot left"></div>
                      <div className="dna-bar"></div>
                      <div className="dna-dot right"></div>
                    </div>
                  ))}
                </div>

                {/* Central medical cross */}
                <div className="med-cross-center">
                  <div className="med-cross-icon">✚</div>
                  <div className="med-cross-pulse"></div>
                  <div className="med-cross-pulse delay-1"></div>
                </div>

                {/* Floating Medical Icons */}
                <div className="med-float-icon flt-1">💊</div>
                <div className="med-float-icon flt-2">🧬</div>
                <div className="med-float-icon flt-3">🩺</div>
                <div className="med-float-icon flt-4">🧪</div>
                <div className="med-float-icon flt-5">❤️</div>
              </div>
            </div>

          </div>
        </section>

        {/* VOICE-ENABLED GLOBAL SEARCH BAR */}
        <section className="home-search-panel panel-card glass-panel mt-6">
          <div className="search-bar-wrapper">
            <FiSearch className="search-icon-large" />
            <input
              type="text"
              placeholder="Search doctors, medicines, symptoms, health tips..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyPress={(e) => e.key === 'Enter' && handleExecuteSearch()}
              className="search-input-large"
            />
            
            <button 
              type="button" 
              onClick={handleVoiceSearch} 
              className={`search-voice-btn-large ${isListening ? 'listening' : ''}`}
              title="Voice Search"
            >
              <FiMic />
            </button>
            <button 
              type="button" 
              onClick={() => handleExecuteSearch()} 
              className="search-submit-btn-large"
            >
              Search
            </button>
          </div>

          {/* Autocomplete suggestions overlay */}
          {showSuggestions && (
            <div className="suggestions-overlay-card">
              {suggestions.length > 0 ? (
                <div className="suggestions-list">
                  <div className="suggestion-section-title">SUGGESTED RESULTS</div>
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onMouseDown={() => {
                        setSearchQuery(item.term)
                        handleExecuteSearch(item.term)
                      }}
                      className="suggestion-item-btn"
                    >
                      <span className="suggestion-term">{item.term}</span>
                      <span className={`suggestion-type-badge ${item.type}`}>
                        {item.type.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="suggestions-list">
                  <button
                    onMouseDown={() => handleExecuteSearch(searchQuery)}
                    className="suggestion-item-btn"
                  >
                    <span>Ask MediBot about: <strong>"{searchQuery}"</strong></span>
                    <span className="suggestion-type-badge ai">AI ASSIST</span>
                  </button>
                </div>
              ) : (
                <div className="recent-history-section">
                  <div className="suggestion-section-title"><FiClock size={12} /> RECENT SEARCHES</div>
                  {searchHistory.map((item, idx) => (
                    <button
                      key={idx}
                      onMouseDown={() => {
                        setSearchQuery(item)
                        handleExecuteSearch(item)
                      }}
                      className="suggestion-history-item"
                    >
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* QUICK ACTIONS GRID */}
        <section className="home-quick-actions mt-6">
          <h2 className="section-title">Clinical Portals</h2>
          <div className="quick-actions-grid mt-3">
            
            <div className="action-card-glass symptom-card" onClick={() => navigate('/symptom-checker')}>
              <div className="action-icon-circle bg-green-light"><FiActivity /></div>
              <h3 className="action-title">Symptom Analyser</h3>
              <p className="action-desc">Check health anomalies and get instant diagnostic probabilities.</p>
              <span className="action-link-chevron">Get Checked →</span>
            </div>

            <div className="action-card-glass emergency-card" onClick={() => navigate('/emergency')}>
              <div className="action-icon-circle bg-red-light"><FiPhoneCall /></div>
              <h3 className="action-title">Trauma & SOS Center</h3>
              <p className="action-desc">Auto-share live GPS coordinates and place hot emergency calls.</p>
              <span className="action-link-chevron">Activate SOS →</span>
            </div>

            <div className="action-card-glass appointment-card" onClick={() => navigate('/appointments')}>
              <div className="action-icon-circle bg-blue-light"><FiCalendar /></div>
              <h3 className="action-title">Schedule Visit</h3>
              <p className="action-desc">Secure slots with verified cardiologists, pediatricians, or therapists.</p>
              <span className="action-link-chevron">Book Slot →</span>
            </div>

            <div className="action-card-glass records-card" onClick={() => navigate('/records')}>
              <div className="action-icon-circle bg-purple-light"><FiFileText /></div>
              <h3 className="action-title">Health Records</h3>
              <p className="action-desc">Store lab results, medical prescriptions, and track BMI indicators.</p>
              <span className="action-link-chevron">View Records →</span>
            </div>

          </div>
        </section>

        {/* AI CHAT QUICK CONSULT PANEL */}
        <section className="home-quick-consult panel-card glass-panel mt-6">
          <h2 className="panel-title flex-center gap-2"><FiHeart color="var(--primary)" /> Express Symptom Chat</h2>
          <p className="section-sub-desc text-secondary mt-1">Get an instant preliminary clinical review by detailing your condition below.</p>
          
          <form onSubmit={handleQuickConsultSubmit} className="consult-form-inline mt-4">
            <textarea
              placeholder="e.g. 'I have a mild fever since yesterday with sore throat. Is it critical?'"
              value={quickConsultInput}
              onChange={e => setQuickConsultInput(e.target.value)}
              className="consult-textarea"
              rows={2}
            />
            <button type="submit" className="consult-submit-btn flex-center gap-2" disabled={!quickConsultInput.trim()}>
              Consult MediBot <FiActivity />
            </button>
          </form>
        </section>

      </div>

      {/* RIGHT COLUMN: Doctors Panel, Map, Pharmacies Panel, Tips */}
      <div className="home-side-col">
        
        {/* DOCTOR FINDER PANEL */}
        <div className="panel-card glass-panel home-doctors-sidebar flex flex-direction-column">
          <div className="flex justify-between items-center mb-4">
            <h2 className="panel-title">Nearby Specialists</h2>
            <button className="view-all-btn" onClick={() => navigate('/find-doctors')}>View All</button>
          </div>

          <div className="side-list-container flex-1">
            {MOCK_DOCTORS.map(doc => (
              <div key={doc.id} className="side-doc-row hover-scale" onClick={() => navigate('/find-doctors', { state: { specialization: doc.spec } })}>
                <div className="doc-avatar-small">
                  <span>{doc.name.split(' ').slice(1).join('')[0]}</span>
                </div>
                <div className="doc-meta-small flex-1">
                  <span className="doc-name-small">{doc.name}</span>
                  <span className="doc-spec-small text-secondary">{doc.spec}</span>
                </div>
                <div className="doc-rating-small">
                  <span>★ {doc.rating}</span>
                  <span className="doc-dist-small">{doc.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LEAFLET GEOLOCATION MAP */}
        <div className="panel-card glass-panel home-map-card mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="panel-title flex-center gap-2"><FiMapPin /> Emergency ER Locator</h2>
            <button className="view-all-btn" onClick={() => navigate('/emergency')}>SOS Center</button>
          </div>
          <div id="home-map" className="home-leaflet-map" style={{ height: '170px', borderRadius: '8px', border: '1px solid var(--border)' }}></div>
          <div className="map-legend-dots mt-2">
            <span className="legend-dot green"></span> <span className="text-secondary font-500 mr-2 text-xs">Clinc</span>
            <span className="legend-dot red"></span> <span className="text-secondary font-500 text-xs">Emergency Hosp</span>
          </div>
        </div>

        {/* PHARMACIES SIDEBAR */}
        <div className="panel-card glass-panel home-pharmacies-sidebar mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="panel-title">Nearby Pharmacies</h2>
            <button className="view-all-btn" onClick={() => navigate('/medicine-stores')}>View All</button>
          </div>

          <div className="side-list-container">
            {MOCK_PHARMACIES.map(ph => (
              <div key={ph.id} className="side-doc-row hover-scale" onClick={() => navigate('/medicine-stores', { state: { pharmacy: ph.name } })}>
                <div className="ph-avatar-small">💊</div>
                <div className="doc-meta-small flex-1">
                  <span className="doc-name-small">{ph.name}</span>
                  <span className="doc-spec-small text-secondary">{ph.address}</span>
                </div>
                <a href={`tel:${ph.phone}`} className="ph-call-btn-small" onClick={(e) => e.stopPropagation()}>
                  📞
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* DAILY HEALTH TIPS CAROUSEL */}
        <div className="panel-card glass-panel home-tips-carousel mt-6 bg-glow-primary">
          <div className="tips-carousel-item fade-in" key={tipIndex}>
            <span className="tip-carousel-icon">{MOCK_TIPS[tipIndex].icon}</span>
            <h3 className="tip-carousel-title mt-2">{MOCK_TIPS[tipIndex].title}</h3>
            <p className="tip-carousel-body text-secondary mt-1">{MOCK_TIPS[tipIndex].body}</p>
          </div>
          <div className="tip-carousel-bullets mt-3">
            {MOCK_TIPS.map((_, idx) => (
              <span key={idx} className={`carousel-bullet ${idx === tipIndex ? 'active' : ''}`} onClick={() => setTipIndex(idx)}></span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

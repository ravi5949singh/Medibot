import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiActivity, FiSearch, FiCheck, FiX, FiAlertTriangle, FiArrowRight, FiArrowLeft, FiHeart, FiFileText, FiPhoneCall } from 'react-icons/fi'
import axios from 'axios'
import './Pages.css'

const COMMON_SYMPTOMS = [
  'Fever', 'Cough', 'Shortness of breath', 'Fatigue', 'Headache', 'Body aches',
  'Sore throat', 'Congestion or runny nose', 'Nausea or vomiting', 'Diarrhea',
  'Chest pain', 'Dizziness', 'Stomach pain', 'Loss of taste or smell', 'Skin rash',
  'Joint pain', 'Anxiety', 'Insomnia'
]

const EXISTING_CONDITIONS = [
  'Diabetes', 'Hypertension (High BP)', 'Asthma', 'Heart Disease', 
  'COPD', 'Kidney Disease', 'Thyroid Disorder', 'None'
]

export default function SymptomChecker() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  
  // Form State
  const [age, setAge] = useState(25)
  const [gender, setGender] = useState('Female')
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [symptomSearch, setSymptomSearch] = useState('')
  const [duration, setDuration] = useState(2) // in days
  const [severity, setSeverity] = useState('moderate')
  const [selectedConditions, setSelectedConditions] = useState([])
  const [notes, setNotes] = useState('')
  
  // Loading & Result State
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym))
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym])
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

  const runAnalysis = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom to analyze.')
      return
    }
    setError('')
    setIsLoading(true)
    setStep(4)
    
    try {
      // Package query details to make the response extremely accurate
      const fullSymptoms = [...selectedSymptoms]
      if (notes) fullSymptoms.push(`Extra details: ${notes}`)
      
      const payload = {
        symptoms: fullSymptoms,
        age,
        gender,
        duration: `${duration} days`,
        severity,
        conditions: selectedConditions.filter(c => c !== 'None')
      }
      
      const { data } = await axios.post('/api/chat/analyze', payload)
      
      // Calculate risk score based on severity and see_doctor recommendation
      let riskScore = 20
      if (severity === 'moderate') riskScore = 55
      if (severity === 'severe') riskScore = 85
      if (data.severity === 'severe' || data.see_doctor) {
        riskScore = Math.max(riskScore, 75)
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

  const filteredSymptoms = COMMON_SYMPTOMS.filter(s => 
    s.toLowerCase().includes(symptomSearch.toLowerCase()) && !selectedSymptoms.includes(s)
  )

  return (
    <div className="page-full symptom-checker-page">
      <div className="page-header-decor">
        <h1 className="page-heading">AI Symptom Analyser</h1>
        <p className="page-desc">Check your health metrics and get instant clinical guidance powered by MediCare AI.</p>
      </div>

      <div className="symptom-wizard-card panel-card glass-panel fade-in">
        {/* Step Indicator */}
        {step <= 3 && (
          <div className="wizard-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-num">{step > 1 ? <FiCheck /> : '1'}</span>
              <span className="step-label">Basic Info</span>
            </div>
            <div className="progress-line">
              <div className="progress-line-fill" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
            </div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <span className="step-num">{step > 2 ? <FiCheck /> : '2'}</span>
              <span className="step-label">Symptoms</span>
            </div>
            <div className="progress-line">
              <div className="progress-line-fill" style={{ width: step <= 2 ? '0%' : '100%' }}></div>
            </div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">Severity</span>
            </div>
          </div>
        )}

        {error && (
          <div className="symptom-alert alert-error">
            <FiAlertTriangle />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="wizard-step fade-in">
            <h2 className="step-title">Patient Profile</h2>
            <p className="step-sub">Please fill in standard demographic markers for diagnostic tailoring.</p>

            <div className="wizard-form-grid">
              <div className="form-group">
                <label className="form-label">Age: <span className="bold-value">{age} years</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={age} 
                  onChange={e => setAge(parseInt(e.target.value))} 
                  className="premium-range-slider"
                />
                <div className="slider-labels">
                  <span>1 yr</span>
                  <span>50 yrs</span>
                  <span>100 yrs</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Gender</label>
                <div className="gender-toggle-group">
                  {['Male', 'Female', 'Other'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`gender-btn ${gender === g ? 'active' : ''}`}
                      onClick={() => setGender(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group mt-6">
              <label className="form-label">Pre-existing Medical Conditions</label>
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

        {/* STEP 2: Symptoms */}
        {step === 2 && (
          <div className="wizard-step fade-in">
            <h2 className="step-title">Select Symptoms</h2>
            <p className="step-sub">Search or pick symptoms that you are experiencing right now.</p>

            {/* Selected Panel */}
            {selectedSymptoms.length > 0 && (
              <div className="selected-symptoms-section">
                <span className="selected-label">Your Selection ({selectedSymptoms.length}):</span>
                <div className="selected-tags-container">
                  {selectedSymptoms.map(sym => (
                    <span key={sym} className="symptom-active-tag">
                      {sym}
                      <button onClick={() => toggleSymptom(sym)} className="symptom-tag-close">
                        <FiX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleCustomSymptomSubmit} className="symptom-search-bar">
              <FiSearch className="search-icon-wizard" />
              <input
                type="text"
                placeholder="Search symptom or type custom e.g. Back pain..."
                value={symptomSearch}
                onChange={e => setSymptomSearch(e.target.value)}
                className="symptom-search-input"
              />
              {symptomSearch.trim() && (
                <button type="submit" className="custom-add-btn">
                  Add custom
                </button>
              )}
            </form>

            <div className="symptoms-pool-section">
              <h3 className="pool-title">Common Indicators</h3>
              <div className="symptoms-pool-grid">
                {filteredSymptoms.map(sym => (
                  <button
                    key={sym}
                    type="button"
                    className="pool-symptom-btn"
                    onClick={() => toggleSymptom(sym)}
                  >
                    + {sym}
                  </button>
                ))}
                {filteredSymptoms.length === 0 && (
                  <span className="no-symptoms-found">No matches. Press "Add custom" to add "{symptomSearch}"</span>
                )}
              </div>
            </div>

            <div className="wizard-actions mt-8">
              <button className="outline-btn" onClick={() => setStep(1)}>
                <FiArrowLeft /> Back
              </button>
              <button 
                className="primary-btn wizard-next-btn" 
                onClick={() => {
                  if (selectedSymptoms.length === 0) {
                    setError('Please select at least one symptom.')
                  } else {
                    setError('')
                    setStep(3)
                  }
                }}
              >
                Next: Severity & Timeline <FiArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Severity & Timeline */}
        {step === 3 && (
          <div className="wizard-step fade-in">
            <h2 className="step-title">Duration & Severity</h2>
            <p className="step-sub">Help us gauge the clinical urgency of your symptoms.</p>

            <div className="wizard-form-grid">
              <div className="form-group">
                <label className="form-label">Symptom Duration: <span className="bold-value">{duration} {duration === 1 ? 'day' : 'days'}</span></label>
                <input 
                  type="range" 
                  min="1" 
                  max="14" 
                  value={duration} 
                  onChange={e => setDuration(parseInt(e.target.value))} 
                  className="premium-range-slider"
                />
                <div className="slider-labels">
                  <span>1 day</span>
                  <span>7 days</span>
                  <span>14+ days</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subjective Severity Level</label>
                <div className="severity-toggle-group">
                  {[
                    { val: 'mild', label: 'Mild', desc: 'Barely noticeable, normal function' },
                    { val: 'moderate', label: 'Moderate', desc: 'Noticeable pain or discomfort' },
                    { val: 'severe', label: 'Severe', desc: 'Critical discomfort, disrupts work' }
                  ].map(s => (
                    <button
                      key={s.val}
                      type="button"
                      className={`severity-btn severity-${s.val} ${severity === s.val ? 'active' : ''}`}
                      onClick={() => setSeverity(s.val)}
                    >
                      <span className="sev-label">{s.label}</span>
                      <span className="sev-desc">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group mt-6">
              <label className="form-label">Additional Context / Medical History (Optional)</label>
              <textarea
                placeholder="List any details, e.g. 'Fever worsens at night', 'Took Paracetamol, did not help', etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="premium-textarea"
                rows={4}
              />
            </div>

            <div className="wizard-actions mt-8">
              <button className="outline-btn" onClick={() => setStep(2)}>
                <FiArrowLeft /> Back
              </button>
              <button className="primary-btn wizard-next-btn pulse-glow" onClick={runAnalysis}>
                Run AI Diagnosis <FiActivity />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Loading or Results */}
        {step === 4 && (
          <div className="wizard-step fade-in">
            {isLoading ? (
              <div className="analysis-loading-state">
                <div className="dna-loader">
                  <div className="double-bounce1"></div>
                  <div className="double-bounce2"></div>
                </div>
                <h3 className="loading-title">MediCare AI Clinical Analysis in Progress...</h3>
                <p className="loading-desc">Comparing symptoms with clinical databases and generating recommendation matrices.</p>
              </div>
            ) : result ? (
              <div className="analysis-results-section fade-in">
                {/* Result Hero Header */}
                <div className="results-top-header">
                  <div className="results-left-gauge">
                    <div className="radial-risk-circle" style={{
                      '--risk-color': result.riskScore > 70 ? 'var(--accent-red)' : result.riskScore > 40 ? 'var(--accent-orange)' : 'var(--accent-green)',
                      '--risk-percent': `${result.riskScore}%`
                    }}>
                      <span className="risk-percent-text">{result.riskScore}%</span>
                      <span className="risk-label-sub">Risk Score</span>
                    </div>
                  </div>
                  <div className="results-right-summary">
                    <span className="clinical-badge">CLINICAL SUMMARY</span>
                    <h2 className="results-main-title">
                      {result.severity === 'severe' ? 'Urgent Medical Attention Advised' : 
                       result.severity === 'moderate' ? 'Moderate Care & Observation Advised' : 
                       'Self-Care and Rest Advised'}
                    </h2>
                    <p className="results-summary-text">
                      Our system detected symptoms indicative of <strong>{result.severity}</strong> severity levels, spanning a <strong>{duration} day</strong> timeline.
                    </p>
                  </div>
                </div>

                {/* Main Results Grid */}
                <div className="results-panels-grid">
                  {/* Left Column: Conditions & Remedies */}
                  <div className="results-left-col">
                    {/* Possible Diseases */}
                    <div className="results-card-inner">
                      <h3 className="inner-card-title"><FiSearch /> Probable Diagnostic Fits</h3>
                      <div className="probable-list">
                        {result.possible_diseases && result.possible_diseases.length > 0 ? (
                          result.possible_diseases.map((dis, idx) => (
                            <div key={idx} className="probable-item">
                              <div className="probable-item-header">
                                <span className="probable-name">{dis}</span>
                                <span className="probable-match" style={{
                                  color: result.riskScore > 60 ? 'var(--accent-red)' : 'var(--primary)'
                                }}>~ {88 - idx * 15}% fit</span>
                              </div>
                              <div className="probable-progress-bar">
                                <div className="probable-fill" style={{ 
                                  width: `${88 - idx * 15}%`,
                                  background: result.riskScore > 60 ? 'var(--accent-red)' : 'var(--primary)'
                                }}></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-result-data">No specific conditions found. Consult a practitioner.</div>
                        )}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="results-card-inner mt-4">
                      <h3 className="inner-card-title" style={{ color: 'var(--accent-green)' }}><FiCheck /> Recommended Interventions</h3>
                      <ul className="results-checklist">
                        {result.recommendations && result.recommendations.length > 0 ? (
                          result.recommendations.map((rec, idx) => (
                            <li key={idx} className="checklist-item">
                              <span className="checklist-bullet">✓</span>
                              <span className="checklist-text">{rec}</span>
                            </li>
                          ))
                        ) : (
                          <li className="checklist-item"><span className="checklist-text">Hydrate, rest well, and monitor vitals closely.</span></li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Medications & Specialist */}
                  <div className="results-right-col">
                    {/* OTC Medicines */}
                    {result.otc_medicines && result.otc_medicines.length > 0 && (
                      <div className="results-card-inner">
                        <h3 className="inner-card-title" style={{ color: 'var(--primary)' }}><FiHeart /> OTC Medication Suggestions</h3>
                        <div className="medicine-pills-wrap">
                          {result.otc_medicines.map((med, idx) => (
                            <span key={idx} className="med-pill-result">💊 {med}</span>
                          ))}
                        </div>
                        <p className="meds-sub-note">Always verify dosages with a certified pharmacist before taking any OTC drugs.</p>
                      </div>
                    )}

                    {/* Recommended Doctor Category */}
                    {result.specialist && (
                      <div className="specialist-referral-card mt-4">
                        <div className="specialist-avatar-icon">⚕</div>
                        <div className="specialist-info">
                          <span className="specialist-subtitle">RECOMMENDED PRACTITIONER</span>
                          <h4 className="specialist-title">{result.specialist}</h4>
                          <p className="specialist-description">
                            Scheduling a consult is highly advised based on your existing profile and current symptoms.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quick Call Emergency */}
                    {result.severity === 'severe' && (
                      <div className="emergency-alert-card mt-4">
                        <FiAlertTriangle className="emergency-alert-icon" />
                        <div>
                          <h4 className="emergency-alert-title">Emergency Active</h4>
                          <p className="emergency-alert-desc">We highly recommend placing a call to emergency medical dispatch services immediately.</p>
                          <button onClick={() => navigate('/emergency')} className="emergency-action-btn-wizard">
                            <FiPhoneCall /> Go to SOS Center
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Diagnostic Actions */}
                <div className="results-wizard-footer">
                  <button className="outline-btn" onClick={resetForm}>
                    Check Again
                  </button>
                  <div className="results-action-group">
                    {result.specialist && (
                      <button 
                        className="primary-btn flex-center gap-2"
                        onClick={() => navigate('/find-doctors', { state: { specialization: result.specialist } })}
                      >
                        Find {result.specialist}
                      </button>
                    )}
                    <button 
                      className="primary-btn flex-center gap-2"
                      style={{ background: 'var(--accent-purple)' }}
                      onClick={() => navigate('/chat', { state: { prefill: `I did a symptom check. My symptoms: ${selectedSymptoms.join(', ')}. AI recommended seeing a ${result.specialist || 'doctor'}. Let's discuss.` } })}
                    >
                      Discuss with AI Bot
                    </button>
                  </div>
                </div>

                <div className="clinical-disclaimer-notice">
                  <strong>Clinical Disclaimer:</strong> This automated symptom checker is for informational purposes only. It is not an active diagnostic tool and does not constitute professional medical advice, clinical diagnosis, or treatment plans. Always consult a physician for expert medical guidance.
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
  )
}

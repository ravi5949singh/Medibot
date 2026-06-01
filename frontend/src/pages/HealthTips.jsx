import { useState } from 'react'
import './Pages.css'

const dailyTips = [
  { emoji: '💧', title: 'Stay Hydrated', text: 'Drink at least 8 glasses of water daily. Proper hydration helps your body function optimally and flush toxins.' },
  { emoji: '🏃', title: 'Exercise Regularly', text: 'Aim for 30 minutes of moderate exercise daily. Walking, yoga, or cycling can boost immunity and reduce stress.' },
  { emoji: '😴', title: 'Quality Sleep', text: 'Get 7-8 hours of sleep each night. Good sleep is essential for immune function and mental health.' },
  { emoji: '🥗', title: 'Balanced Diet', text: 'Include fruits, vegetables, whole grains, and lean protein in every meal for optimal nutrition.' },
  { emoji: '🧘', title: 'Manage Stress', text: 'Practice meditation or deep breathing exercises. Chronic stress weakens immunity and affects mental health.' },
  { emoji: '🧴', title: 'Hand Hygiene', text: 'Wash hands frequently with soap for at least 20 seconds. It\'s the simplest way to prevent infections.' },
]

export default function HealthTips() {
  const [unitSystem, setUnitSystem] = useState('metric') // 'metric' | 'imperial'
  const [weight, setWeight] = useState(70) // kg in metric, lbs in imperial
  const [heightCm, setHeightCm] = useState(170) // cm
  const [heightFt, setHeightFt] = useState(5) // feet
  const [heightIn, setHeightIn] = useState(7) // inches

  // Handles conversions when switching unit systems
  const handleUnitToggle = (newSystem) => {
    if (newSystem === unitSystem) return
    
    if (newSystem === 'imperial') {
      // Metric -> Imperial
      const lbs = Math.round(weight * 2.20462 * 10) / 10
      const totalInches = heightCm / 2.54
      const ft = Math.floor(totalInches / 12)
      const inch = Math.round(totalInches % 12)
      
      setWeight(lbs)
      setHeightFt(ft || 5)
      setHeightIn(inch === 12 ? 0 : inch)
      if (inch === 12) setHeightFt((ft || 5) + 1)
    } else {
      // Imperial -> Metric
      const kg = Math.round(weight / 2.20462 * 10) / 10
      const cm = Math.round(((heightFt * 12) + heightIn) * 2.54)
      
      setWeight(kg)
      setHeightCm(cm)
    }
    
    setUnitSystem(newSystem)
  }

  // Live BMI calculation
  let calculatedBmi = 0
  if (unitSystem === 'metric') {
    if (heightCm > 0) {
      calculatedBmi = weight / Math.pow(heightCm / 100, 2)
    }
  } else {
    const totalInches = (heightFt * 12) + heightIn
    if (totalInches > 0) {
      calculatedBmi = (703 * weight) / Math.pow(totalInches, 2)
    }
  }
  
  const bmi = calculatedBmi > 0 ? parseFloat(calculatedBmi.toFixed(1)) : 0

  // Category mapping
  let category = 'Normal Weight'
  let color = '#22C55E' // Green
  let progressPercent = 50
  let adviceTitle = 'Maintain Your Balance!'
  let adviceText = 'Great job! Your BMI falls in the healthy weight range. Keep up your active lifestyle, eat a balanced diet rich in whole foods, and stay hydrated to maintain your excellent health.'

  if (bmi > 0) {
    if (bmi < 18.5) {
      category = 'Underweight'
      color = '#3B82F6' // Blue
      progressPercent = Math.min(33, (bmi / 18.5) * 33)
      adviceTitle = 'Healthy Weight Gain Tips'
      adviceText = 'Your BMI suggests you are underweight. Focus on eating nutrient-dense, calorie-dense foods (nuts, seeds, avocados, eggs, full-fat dairy). Consider resistance training to build healthy muscle mass, and consult a nutritionist.'
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'Normal Weight'
      color = '#22C55E' // Green
      progressPercent = 33 + ((bmi - 18.5) / 6.5) * 33
      adviceTitle = 'Keep Up the Good Work!'
      adviceText = 'Your BMI is in the optimal healthy range. Focus on diverse, nutrient-rich meals, complete 150 minutes of moderate cardiorespiratory exercise per week (e.g. brisk walking), sleep 7-8 hours nightly, and drink plenty of water.'
    } else if (bmi >= 25 && bmi < 30) {
      category = 'Overweight'
      color = '#F59E0B' // Yellow / Orange
      progressPercent = 66 + ((bmi - 25) / 5) * 19
      adviceTitle = 'Gentle Weight Management'
      adviceText = 'Your BMI indicates you are slightly overweight. Incorporate more high-fiber foods, vegetables, and lean proteins into your meals while cutting back on sugary drinks and refined carbs. Aim for 30-45 minutes of daily moderate activity.'
    } else {
      category = 'Obese'
      color = '#EF4444' // Red
      progressPercent = 85 + Math.min(15, ((bmi - 30) / 20) * 15)
      adviceTitle = 'Important Health Guidelines'
      adviceText = 'Your BMI falls into the obesity category, which carries higher risk for cardiovascular issues. We highly recommend a balanced, calorie-controlled diet and gentle, low-impact daily exercise (like swimming or walking). Please consult a physician for expert medical advice.'
    }
  }

  return (
    <div className="page-full">
      <h1 className="page-heading">Daily Health Tips & Wellness</h1>
      <p className="page-desc">Calculate your BMI and read expert health advice to stay fit every day</p>

      <div className="healthtips-container">
        {/* Left Side: BMI Calculator */}
        <div className="bmi-calculator-card">
          <h2 className="bmi-title">📉 Wellness BMI Calculator</h2>
          <p className="bmi-desc">Check if your body mass is in a healthy range</p>

          {/* Unit Toggle Segmented Control */}
          <div className="bmi-unit-toggle">
            <button 
              className={`bmi-toggle-btn ${unitSystem === 'metric' ? 'active' : ''}`}
              onClick={() => handleUnitToggle('metric')}
            >
              Metric (kg/cm)
            </button>
            <button 
              className={`bmi-toggle-btn ${unitSystem === 'imperial' ? 'active' : ''}`}
              onClick={() => handleUnitToggle('imperial')}
            >
              Imperial (lbs/ft-in)
            </button>
          </div>

          {/* Inputs Section */}
          <div className="bmi-inputs">
            {/* Height Input */}
            <div className="bmi-input-group">
              <div className="bmi-label-row">
                <span className="bmi-label">Height</span>
                <span className="bmi-value-badge">
                  {unitSystem === 'metric' 
                    ? `${heightCm} cm` 
                    : `${heightFt} ft ${heightIn} in`}
                </span>
              </div>
              
              {unitSystem === 'metric' ? (
                <div className="bmi-slider-container">
                  <input 
                    type="range" 
                    min="100" 
                    max="240" 
                    value={heightCm}
                    onChange={e => setHeightCm(parseInt(e.target.value))}
                    className="bmi-slider"
                  />
                  <input 
                    type="number"
                    min="100"
                    max="240"
                    value={heightCm}
                    onChange={e => setHeightCm(Math.max(100, Math.min(240, parseInt(e.target.value) || 100)))}
                    className="bmi-number-input"
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="bmi-slider-container">
                    <span className="bmi-sublabel">Feet:</span>
                    <input 
                      type="range" 
                      min="2" 
                      max="8" 
                      value={heightFt}
                      onChange={e => setHeightFt(parseInt(e.target.value))}
                      className="bmi-slider"
                    />
                    <input 
                      type="number"
                      min="2"
                      max="8"
                      value={heightFt}
                      onChange={e => setHeightFt(Math.max(2, Math.min(8, parseInt(e.target.value) || 2)))}
                      className="bmi-number-input"
                    />
                  </div>
                  <div className="bmi-slider-container">
                    <span className="bmi-sublabel">Inches:</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="11" 
                      value={heightIn}
                      onChange={e => setHeightIn(parseInt(e.target.value))}
                      className="bmi-slider"
                    />
                    <input 
                      type="number"
                      min="0"
                      max="11"
                      value={heightIn}
                      onChange={e => setHeightIn(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
                      className="bmi-number-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Weight Input */}
            <div className="bmi-input-group">
              <div className="bmi-label-row">
                <span className="bmi-label">Weight</span>
                <span className="bmi-value-badge">
                  {weight} {unitSystem === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
              <div className="bmi-slider-container">
                <input 
                  type="range" 
                  min={unitSystem === 'metric' ? '20' : '40'} 
                  max={unitSystem === 'metric' ? '200' : '440'} 
                  value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value))}
                  className="bmi-slider"
                  step="0.5"
                />
                <input 
                  type="number"
                  min={unitSystem === 'metric' ? '20' : '40'} 
                  max={unitSystem === 'metric' ? '200' : '440'} 
                  value={weight}
                  onChange={e => setWeight(Math.max(20, Math.min(600, parseFloat(e.target.value) || 20)))}
                  className="bmi-number-input"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Results Score Box */}
          <div className="bmi-results-box" style={{ borderColor: color }}>
            <div className="bmi-score-wrapper">
              <div className="bmi-score-number" style={{ color: color }}>
                {bmi > 0 ? bmi : '--.-'}
              </div>
              <div>
                <div className="bmi-score-label">Your Calculated BMI</div>
                <div className="bmi-category-badge" style={{ background: color + '1A', color: color }}>
                  {category}
                </div>
              </div>
            </div>

            {/* Visual Slided Gauge Tracker */}
            <div className="bmi-gauge-wrapper">
              <div className="bmi-gauge-labels">
                <span>&lt; 18.5</span>
                <span>18.5 - 24.9</span>
                <span>25.0 - 29.9</span>
                <span>30.0+</span>
              </div>
              <div className="bmi-gauge-track-container">
                <div className="bmi-gauge-pointer" style={{ left: `${progressPercent}%`, borderColor: color }}></div>
              </div>
            </div>
          </div>

          {/* Dynamic Personalized Health Tips Box */}
          <div className="bmi-advice-card" style={{ borderLeftColor: color }}>
            <h3 className="bmi-advice-title" style={{ color: color }}>🌟 {adviceTitle}</h3>
            <p className="bmi-advice-text">{adviceText}</p>
          </div>
        </div>

        {/* Right Side: Health Tips Grid */}
        <div className="tips-column">
          <h2 className="bmi-title" style={{ marginBottom: '16px' }}>💡 Daily Wellness Guidance</h2>
          <div className="tips-list">
            {dailyTips.map((tip, i) => (
              <div key={i} className="tip-card fade-in" id={`tip-${i}`}>
                <div className="tip-emoji">{tip.emoji}</div>
                <div style={{ flex: 1 }}>
                  <h3 className="tip-title">{tip.title}</h3>
                  <p className="tip-text">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

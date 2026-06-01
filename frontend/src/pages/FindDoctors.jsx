import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FiMapPin, FiStar, FiPhone, FiNavigation } from 'react-icons/fi'
import { searchDoctors } from '../services/api'
import DirectionModal from '../components/Map/DirectionModal'
import './Pages.css'

export default function FindDoctors() {
  const location = useLocation()
  const [pincode, setPincode] = useState('462001')
  const [area, setArea] = useState('')
  const [specialization, setSpecialization] = useState(location.state?.specialization || '')
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)


  useEffect(() => {
    handleSearch()
  }, []) // Initial load

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const result = await searchDoctors(pincode, area, specialization)
      setDoctors(result.doctors || [])
    } catch (error) {
      console.error('Failed to search doctors', error)
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCallDoctor = (doc) => {
    try {
      const appointments = JSON.parse(localStorage.getItem('medicare_appointments') || '[]')
      const newActivity = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        doctorName: doc.name,
        specialization: doc.specialization || doc.spec || 'General Physician',
        phone: doc.phone,
        address: doc.clinic_address || doc.address,
        latitude: doc.latitude,
        longitude: doc.longitude,
        type: 'Call',
        date: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })
      }
      appointments.unshift(newActivity)
      localStorage.setItem('medicare_appointments', JSON.stringify(appointments))
    } catch (e) {
      console.error('Failed to log call activity', e)
    }
  }

  const handleVisitDoctor = (doc) => {
    setSelectedDoctor(doc)
    try {
      const appointments = JSON.parse(localStorage.getItem('medicare_appointments') || '[]')
      const newActivity = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        doctorName: doc.name,
        specialization: doc.specialization || doc.spec || 'General Physician',
        phone: doc.phone,
        address: doc.clinic_address || doc.address,
        latitude: doc.latitude,
        longitude: doc.longitude,
        type: 'Directions Checked',
        date: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })
      }
      appointments.unshift(newActivity)
      localStorage.setItem('medicare_appointments', JSON.stringify(appointments))
    } catch (e) {
      console.error('Failed to log visit activity', e)
    }
  }

  // Fallback avatar color generator
  const getAvatarColor = (name) => {
    const colors = ['#4F6BF6', '#22C55E', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899']
    return colors[name.length % colors.length]
  }

  return (
    <div className="page-full">
      <h1 className="page-heading">Find Doctors Near You</h1>
      <p className="page-desc">Search for the best doctors and specialists in your area</p>

      <div className="search-filters">
        <input 
          className="filter-input" 
          id="pincode-input" 
          placeholder="Enter Pincode" 
          value={pincode} 
          onChange={e => setPincode(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <input 
          className="filter-input" 
          id="area-input" 
          placeholder="Local Area (optional)" 
          value={area} 
          onChange={e => setArea(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <input 
          className="filter-input" 
          id="spec-input" 
          placeholder="Specialization (optional)" 
          value={specialization} 
          onChange={e => setSpecialization(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="filter-btn" id="search-doctors-btn" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="results-grid">
        {doctors.length === 0 && !isLoading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No doctors found for this pincode or specialization.
          </div>
        )}
        
        {doctors.map(doc => (
          <div key={doc._id || doc.id} className="result-card fade-in" id={`doc-result-${doc._id || doc.id}`}>
            <div className="result-card-header">
              <div className="result-avatar" style={{ background: getAvatarColor(doc.name) }}>
                {doc.name.split(' ').slice(1, 3).map(n => n?.[0]).join('') || doc.name[0]}
              </div>
              <div>
                <div className="result-name">{doc.name}</div>
                <div className="result-spec">{doc.specialization || doc.spec}</div>
              </div>
            </div>
            <div className="result-meta">
              <span><FiMapPin size={12} /> 2.8 km</span>
              <span><FiStar size={12} /> {doc.rating || '4.5'}</span>
              <span>{doc.clinic_address || doc.address}</span>
            </div>
            <div className="result-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <a href={`tel:${doc.phone}`} onClick={() => handleCallDoctor(doc)} className="result-btn result-btn--primary" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#4F6BF6', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                <FiPhone size={14} /> Call
              </a>
              <button onClick={() => handleVisitDoctor(doc)} className="result-btn result-btn--outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #E5E7EB', color: '#64748B', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                <FiNavigation size={14} /> Directions
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <DirectionModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
      )}
    </div>
  )
}

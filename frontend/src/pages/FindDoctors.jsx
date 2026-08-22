import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FiMapPin, FiStar, FiPhone, FiNavigation, FiCrosshair } from 'react-icons/fi'
import { searchDoctors } from '../services/api'
import DirectionModal from '../components/Map/DirectionModal'
import LocationModal from '../components/LocationModal/LocationModal'
import './Pages.css'

export default function FindDoctors() {
  const location = useLocation()
  const [pincode, setPincode] = useState('462001')
  const [area, setArea] = useState('')
  const [specialization, setSpecialization] = useState(location.state?.specialization || '')
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [locationLabel, setLocationLabel] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [isLocModalOpen, setIsLocModalOpen] = useState(false)

  // Auto-search on mount (if coordinates passed or initial load)
  useEffect(() => {
    if (location.state?.latitude && location.state?.longitude) {
      handleSearchByCoords(location.state.latitude, location.state.longitude, location.state.specialization || specialization)
    } else {
      handleSearch()
    }
  }, [location.state])

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const result = await searchDoctors(pincode, area, specialization)
      setDoctors(result.doctors || [])
      if (result.location) {
        setLocationLabel(result.location)
      }
      if (result.pincode && !pincode) {
        setPincode(result.pincode)
      }
    } catch (error) {
      console.error('Failed to search doctors', error)
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchByCoords = async (latitude, longitude, spec = specialization) => {
    setIsLoading(true)
    try {
      const result = await searchDoctors('', '', spec, latitude, longitude)
      setDoctors(result.doctors || [])
      if (result.location) {
        setLocationLabel(result.location)
      }
      if (result.pincode) {
        setPincode(result.pincode)
      }
    } catch (error) {
      console.error('GPS search error', error)
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGPSLocationGranted = (coords) => {
    if (coords.pincode) setPincode(coords.pincode)
    if (coords.city || coords.area) setLocationLabel(coords.area || coords.city)
    handleSearchByCoords(coords.latitude, coords.longitude)
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

  const getAvatarColor = (name = '') => {
    const colors = ['#4F6BF6', '#22C55E', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899']
    return colors[name.length % colors.length]
  }

  return (
    <div className="page-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-heading">Find Doctors & Clinics Near You</h1>
          <p className="page-desc">Search verified doctors, medical specialists, and clinics by entering any Indian pincode or using your live GPS location</p>
        </div>
        <button 
          className="primary-btn flex-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4F6BF6, #7C3AED)', padding: '10px 18px', borderRadius: '12px' }}
          onClick={() => setIsLocModalOpen(true)}
        >
          <FiCrosshair /> Use My Live GPS Location
        </button>
      </div>

      <div className="search-filters mt-4">
        <input 
          className="filter-input" 
          id="pincode-input" 
          placeholder="Enter 6-Digit Pincode (e.g. 110001, 462001)" 
          value={pincode} 
          onChange={e => setPincode(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <input 
          className="filter-input" 
          id="area-input" 
          placeholder="Local Area / Landmark (optional)" 
          value={area} 
          onChange={e => setArea(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <input 
          className="filter-input" 
          id="spec-input" 
          placeholder="Specialization (e.g. Cardiologist, Dentist)" 
          value={specialization} 
          onChange={e => setSpecialization(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="filter-btn" id="search-doctors-btn" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search Doctors'}
        </button>
      </div>

      {locationLabel && (
        <div style={{ marginTop: '14px', fontSize: '0.88rem', color: '#4F6BF6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiMapPin /> Showing clinics and doctors near: <span style={{ color: '#1E293B', fontWeight: 700 }}>{locationLabel}</span>
        </div>
      )}

      <div className="results-grid" style={{ marginTop: '20px' }}>
        {doctors.length === 0 && !isLoading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No doctors or clinics found for this location. Click "Use My Live GPS Location" or try a nearby pincode.
          </div>
        )}
        
        {doctors.map(doc => (
          <div key={doc._id || doc.id} className="result-card fade-in" id={`doc-result-${doc._id || doc.id}`}>
            <div className="result-card-header">
              <div className="result-avatar" style={{ background: getAvatarColor(doc.name) }}>
                {doc.name.replace(/^Dr\.\s*/i, '').slice(0, 2).toUpperCase() || 'DR'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="result-name" style={{ fontWeight: 700 }}>{doc.name}</div>
                <div className="result-spec" style={{ color: '#4F6BF6', fontWeight: 600, fontSize: '0.82rem' }}>
                  {doc.specialization || doc.spec || 'General Physician'}
                </div>
              </div>
            </div>

            <div className="result-meta" style={{ marginTop: '12px' }}>
              <span><FiMapPin size={12} /> Pincode: {doc.pincode || pincode}</span>
              <span><FiStar size={12} style={{ color: '#F59E0B' }} /> {doc.rating || '4.5'}</span>
              <div style={{ width: '100%', marginTop: '4px', fontSize: '0.8rem', color: '#64748B' }}>
                🏢 {doc.clinic_address || doc.address}
              </div>
            </div>

            <div className="result-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <a href={`tel:${doc.phone}`} onClick={() => handleCallDoctor(doc)} className="result-btn result-btn--primary" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#4F6BF6', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 600 }}>
                <FiPhone size={14} /> Call
              </a>
              <button onClick={() => handleVisitDoctor(doc)} className="result-btn result-btn--outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#fff', border: '1.5px solid #E5E7EB', color: '#475569', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <FiNavigation size={14} /> Directions
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <DirectionModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
      )}

      <LocationModal 
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        onLocationGranted={handleGPSLocationGranted}
        title="Detect Nearby Doctors & Clinics"
        description="Allow location access to instantly find verified specialists and hospitals within 5-8km of your current GPS position."
      />
    </div>
  )
}

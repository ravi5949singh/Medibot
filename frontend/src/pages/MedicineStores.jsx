import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FiMapPin, FiPhone, FiNavigation } from 'react-icons/fi'
import { searchPharmacies } from '../services/api'
import DirectionModal from '../components/Map/DirectionModal'
import './Pages.css'

export default function MedicineStores() {
  const location = useLocation()
  const [pincode, setPincode] = useState('462001')
  const [area, setArea] = useState('')
  const [medicine, setMedicine] = useState(location.state?.medicine || '')
  const [stores, setStores] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)


  useEffect(() => {
    handleSearch()
  }, []) // Initial load

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const result = await searchPharmacies(pincode, area, medicine)
      setStores(result.pharmacies || [])
    } catch (error) {
      console.error('Failed to search pharmacies', error)
      setStores([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCallStore = (store) => {
    try {
      const appointments = JSON.parse(localStorage.getItem('medicare_appointments') || '[]')
      const newActivity = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        doctorName: store.name,
        specialization: 'Pharmacy Store',
        phone: store.phone,
        address: store.address,
        latitude: store.latitude,
        longitude: store.longitude,
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
      console.error('Failed to log pharmacy call', e)
    }
  }

  const handleVisitStore = (store) => {
    setSelectedStore(store)
    try {
      const appointments = JSON.parse(localStorage.getItem('medicare_appointments') || '[]')
      const newActivity = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
        doctorName: store.name,
        specialization: 'Pharmacy Store',
        phone: store.phone,
        address: store.address,
        latitude: store.latitude,
        longitude: store.longitude,
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
      console.error('Failed to log pharmacy visit', e)
    }
  }

  // Fallback avatar color generator
  const getAvatarColor = (name) => {
    const colors = ['#4F6BF6', '#22C55E', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899']
    return colors[name.length % colors.length]
  }

  return (
    <div className="page-full">
      <h1 className="page-heading">Nearby Medicine Stores</h1>
      <p className="page-desc">Find pharmacies and medical stores near your location</p>

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
          id="medicine-input" 
          placeholder="Medicine Name (optional)" 
          value={medicine} 
          onChange={e => setMedicine(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="filter-btn" id="search-pharmacy-btn" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="results-grid">
        {stores.length === 0 && !isLoading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No medicine stores found for this search.
          </div>
        )}
        
        {stores.map(store => (
          <div key={store._id || store.id} className="result-card fade-in" id={`pharmacy-result-${store._id || store.id}`}>
            <div className="result-card-header">
              <div className="result-avatar" style={{ background: getAvatarColor(store.name) }}>
                💊
              </div>
              <div>
                <div className="result-name">{store.name}</div>
                <div className="result-spec">{store.address}</div>
              </div>
            </div>
            {store.medicines && store.medicines.length > 0 && (
              <div className="store-medicines" style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {store.medicines.slice(0, 4).map((med, idx) => (
                  <span key={idx} style={{ fontSize: '0.72rem', background: '#F3F4F6', color: '#374151', padding: '2px 8px', borderRadius: '12px' }}>
                    {med}
                  </span>
                ))}
                {store.medicines.length > 4 && (
                  <span style={{ fontSize: '0.72rem', color: '#9CA3AF', alignSelf: 'center' }}>
                    +{store.medicines.length - 4} more
                  </span>
                )}
              </div>
            )}
            <div className="result-meta" style={{ marginTop: '10px' }}>
              <span><FiMapPin size={12} /> 1.5 km</span>
              <span>📞 {store.phone || 'N/A'}</span>
            </div>
            <div className="result-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              {store.phone ? (
                <a href={`tel:${store.phone}`} onClick={() => handleCallStore(store)} className="result-btn result-btn--primary" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#4F6BF6', color: '#fff', padding: '8px', borderRadius: '6px' }}>
                  <FiPhone size={14} /> Call
                </a>
              ) : (
                <button className="result-btn result-btn--primary" style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }} disabled>
                  <FiPhone size={14} /> Call
                </button>
              )}
              <button onClick={() => handleVisitStore(store)} className="result-btn result-btn--outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #E5E7EB', color: '#64748B', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                <FiNavigation size={14} /> Directions
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedStore && (
        <DirectionModal doctor={selectedStore} onClose={() => setSelectedStore(null)} />
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FiMapPin, FiPhone, FiNavigation, FiCrosshair } from 'react-icons/fi'
import { searchPharmacies } from '../services/api'
import DirectionModal from '../components/Map/DirectionModal'
import LocationModal from '../components/LocationModal/LocationModal'
import './Pages.css'

export default function MedicineStores() {
  const location = useLocation()
  const [pincode, setPincode] = useState('462001')
  const [area, setArea] = useState('')
  const [medicine, setMedicine] = useState(location.state?.medicine || '')
  const [stores, setStores] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [locationLabel, setLocationLabel] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [isLocModalOpen, setIsLocModalOpen] = useState(false)

  useEffect(() => {
    if (location.state?.latitude && location.state?.longitude) {
      handleSearchByCoords(location.state.latitude, location.state.longitude, location.state.medicine || medicine)
    } else {
      handleSearch()
    }
  }, [location.state])

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const result = await searchPharmacies(pincode, area, medicine)
      setStores(result.pharmacies || [])
      if (result.location) {
        setLocationLabel(result.location)
      }
      if (result.pincode && !pincode) {
        setPincode(result.pincode)
      }
    } catch (error) {
      console.error('Failed to search pharmacies', error)
      setStores([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchByCoords = async (latitude, longitude, med = medicine) => {
    setIsLoading(true)
    try {
      const result = await searchPharmacies('', '', med, latitude, longitude)
      setStores(result.pharmacies || [])
      if (result.location) {
        setLocationLabel(result.location)
      }
      if (result.pincode) {
        setPincode(result.pincode)
      }
    } catch (error) {
      console.error('GPS pharmacy search error', error)
      setStores([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGPSLocationGranted = (coords) => {
    handleSearchByCoords(coords.latitude, coords.longitude)
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

  return (
    <div className="page-full">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="page-heading">Nearby Medicine Stores & Pharmacies</h1>
          <p className="page-desc">Find pharmacies, medical stores, and chemists near your location with available medicines in stock</p>
        </div>
        <button 
          className="primary-btn flex-center gap-2"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', padding: '10px 18px', borderRadius: '12px' }}
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
          id="medicine-input" 
          placeholder="Medicine Name (e.g. Paracetamol, Dolo)" 
          value={medicine} 
          onChange={e => setMedicine(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="filter-btn" id="search-pharmacy-btn" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search Pharmacies'}
        </button>
      </div>

      {locationLabel && (
        <div style={{ marginTop: '14px', fontSize: '0.88rem', color: '#8B5CF6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiMapPin /> Showing pharmacies and medical stores near: <span style={{ color: '#1E293B', fontWeight: 700 }}>{locationLabel}</span>
        </div>
      )}

      <div className="results-grid" style={{ marginTop: '20px' }}>
        {stores.length === 0 && !isLoading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
            No medicine stores found for this search. Click "Use My Live GPS Location" or try a nearby pincode.
          </div>
        )}
        
        {stores.map(store => (
          <div key={store._id || store.id} className="result-card fade-in" id={`pharmacy-result-${store._id || store.id}`}>
            <div className="result-card-header">
              <div className="result-avatar" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', fontSize: '1.4rem' }}>
                💊
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="result-name" style={{ fontWeight: 700 }}>{store.name}</div>
                <div className="result-spec" style={{ color: '#64748B', fontSize: '0.8rem' }}>
                  {store.address}
                </div>
              </div>
            </div>

            {store.medicines && store.medicines.length > 0 && (
              <div className="store-medicines" style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {store.medicines.slice(0, 5).map((med, idx) => (
                  <span key={idx} style={{ fontSize: '0.72rem', background: '#F1F5F9', color: '#334155', padding: '3px 9px', borderRadius: '12px', fontWeight: 500 }}>
                    💊 {med}
                  </span>
                ))}
                {store.medicines.length > 5 && (
                  <span style={{ fontSize: '0.72rem', color: '#64748B', alignSelf: 'center', fontWeight: 500 }}>
                    +{store.medicines.length - 5} more in stock
                  </span>
                )}
              </div>
            )}

            <div className="result-meta" style={{ marginTop: '12px' }}>
              <span><FiMapPin size={12} /> Pincode: {store.pincode || pincode}</span>
              <span>📞 {store.phone || 'Available'}</span>
            </div>

            <div className="result-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              {store.phone ? (
                <a href={`tel:${store.phone}`} onClick={() => handleCallStore(store)} className="result-btn result-btn--primary" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#8B5CF6', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 600 }}>
                  <FiPhone size={14} /> Call Pharmacy
                </a>
              ) : (
                <button className="result-btn result-btn--primary" style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed', background: '#8B5CF6', color: '#fff', padding: '10px', borderRadius: '8px' }} disabled>
                  <FiPhone size={14} /> Call Pharmacy
                </button>
              )}
              <button onClick={() => handleVisitStore(store)} className="result-btn result-btn--outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#fff', border: '1.5px solid #E5E7EB', color: '#475569', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <FiNavigation size={14} /> Directions
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedStore && (
        <DirectionModal doctor={selectedStore} onClose={() => setSelectedStore(null)} />
      )}

      <LocationModal 
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        onLocationGranted={handleGPSLocationGranted}
        title="Detect Nearby Medicine Stores"
        description="Allow location access to automatically locate chemists and 24/7 pharmacies with in-stock medicines near your current GPS position."
      />
    </div>
  )
}

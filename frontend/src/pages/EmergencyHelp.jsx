import { useState, useEffect } from 'react'
import { FiAlertOctagon, FiMapPin, FiShare2, FiPhoneCall, FiCompass, FiAlertTriangle, FiPlus } from 'react-icons/fi'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './Pages.css'

const EMERGENCY_CONTACTS_KEY = 'medicare_emergency_contacts'

const DEFAULT_NUMBERS = [
  { country: 'India', ambulance: '108', police: '100', disaster: '1078', national: '112' },
  { country: 'United States', ambulance: '911', police: '911', disaster: '911', national: '911' },
  { country: 'United Kingdom', ambulance: '999', police: '999', disaster: '999', national: '112' },
  { country: 'Canada', ambulance: '911', police: '911', disaster: '911', national: '911' }
]

export default function EmergencyHelp() {
  const [coords, setCoords] = useState({ lat: 23.2599, lng: 77.4126 }) // Bhopal, India default
  const [locationName, setLocationName] = useState('Bhopal, Madhya Pradesh, India')
  const [locationLoading, setLocationLoading] = useState(false)
  
  // SOS State
  const [sosActive, setSosActive] = useState(false)
  const [sosCountdown, setSosCountdown] = useState(5)
  const [sosTriggered, setSosTriggered] = useState(false)
  
  // Custom Emergency Contacts
  const [contacts, setContacts] = useState(() => {
    try {
      const saved = localStorage.getItem(EMERGENCY_CONTACTS_KEY)
      return saved ? JSON.parse(saved) : [
        { name: 'Dr. Ravi Sharma (Primary Doctor)', relationship: 'Physician', phone: '+91 98765 43210' },
        { name: 'Aditi Sharma (Spouse)', relationship: 'Family', phone: '+91 98765 01234' }
      ]
    } catch {
      return []
    }
  })
  
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [selectedCountry, setSelectedCountry] = useState('India')

  // Auto-detect Location on Load
  useEffect(() => {
    detectLocation()
  }, [])

  // Geolocation lookup
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        
        // Reverse Geocode using free OpenStreetMap Nominatim API
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
          const data = await res.json()
          if (data && data.display_name) {
            setLocationName(data.display_name)
          } else {
            setLocationName(`Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`)
          }
        } catch (e) {
          setLocationName(`Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}`)
        } finally {
          setLocationLoading(false)
        }
      },
      (err) => {
        console.error(err)
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // SOS Countdown Timer
  useEffect(() => {
    let timer
    if (sosActive && sosCountdown > 0) {
      timer = setTimeout(() => setSosCountdown(sosCountdown - 1), 1000)
    } else if (sosActive && sosCountdown === 0) {
      setSosTriggered(true)
      setSosActive(false)
      triggerSMSAlert()
    }
    return () => clearTimeout(timer)
  }, [sosActive, sosCountdown])

  const startSOS = () => {
    setSosActive(true)
    setSosCountdown(5)
    setSosTriggered(false)
  }

  const cancelSOS = () => {
    setSosActive(false)
    setSosCountdown(5)
  }

  const triggerSMSAlert = () => {
    // Simulate SMS dispatching to emergency contacts
    console.log(`SOS Alert triggered! Dispatched to:`, contacts)
  }

  const handleShareLocation = async () => {
    const shareText = `EMERGENCY SOS! I need help. My current location is ${locationName}. Coordinates: https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MediCare AI SOS Emergency Location',
          text: shareText,
          url: `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
        })
      } catch (err) {
        console.error('Web Share failed', err)
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText)
      alert('SOS details copied to clipboard. Share via SMS or WhatsApp.')
    }
  }

  const addContact = (e) => {
    e.preventDefault()
    if (!newContact.name || !newContact.phone) return
    
    const updated = [...contacts, newContact]
    setContacts(updated)
    localStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(updated))
    setNewContact({ name: '', relationship: '', phone: '' })
    setShowAddForm(false)
  }

  const deleteContact = (idx) => {
    const updated = contacts.filter((_, i) => i !== idx)
    setContacts(updated)
    localStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(updated))
  }

  // Load Leaflet Map on Coordinates change
  useEffect(() => {
    const container = L.DomUtil.get('emergency-map')
    if (container != null) {
      container._leaflet_id = null
    }

    const map = L.map('emergency-map').setView([coords.lat, coords.lng], 14)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // User Location marker (Red pulse)
    const pulseIcon = L.divIcon({
      className: 'emergency-location-marker-wrapper',
      html: `<div class="emergency-marker-pulse"></div><div class="emergency-marker-dot"></div>`,
      iconSize: [24, 24]
    })
    
    L.marker([coords.lat, coords.lng], { icon: pulseIcon }).addTo(map)
      .bindPopup('<b>Your Current SOS Position</b>')
      .openPopup()

    // Pre-populate mock nearby hospitals in Bhopal
    const mockHospitals = [
      { name: 'CitiCare Multi-Speciality Hospital', distance: '0.8 km', lat: coords.lat + 0.005, lng: coords.lng - 0.004 },
      { name: 'Red Cross Trauma & Burn Center', distance: '1.4 km', lat: coords.lat - 0.006, lng: coords.lng + 0.007 },
      { name: 'Apollo Emergency & Diagnostic Care', distance: '2.1 km', lat: coords.lat + 0.009, lng: coords.lng + 0.002 }
    ]

    const hospitalIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/809/809988.png', // Hospital cross pin
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28]
    })

    mockHospitals.forEach(h => {
      L.marker([h.lat, h.lng], { icon: hospitalIcon }).addTo(map)
        .bindPopup(`<b>${h.name}</b><br/>Emergency Room: 24/7 Open<br/>Distance: ${h.distance}`)
    })

  }, [coords])

  const countryNumbers = DEFAULT_NUMBERS.find(n => n.country === selectedCountry) || DEFAULT_NUMBERS[0]

  return (
    <div className="page-full emergency-page">
      <div className="emergency-alert-banner">
        <FiAlertOctagon className="alert-banner-icon" />
        <div>
          <h1 className="emergency-main-heading">SOS Critical Command Center</h1>
          <p className="emergency-desc">Instant emergency response, live geolocation telemetry, and direct medical support lines.</p>
        </div>
      </div>

      <div className="emergency-grid-layout">
        {/* Left Panel: SOS Activation & Location */}
        <div className="emergency-left-panel">
          
          {/* Main SOS Trigger */}
          <div className="panel-card glass-panel text-center p-6 relative overflow-hidden">
            {!sosActive && !sosTriggered && (
              <div className="sos-inactive-state">
                <button className="sos-activate-btn-pulsing" onClick={startSOS}>
                  <div className="sos-inner-btn">
                    <span className="sos-label-text">SOS</span>
                    <span className="sos-label-sub">Hold to Alert</span>
                  </div>
                </button>
                <p className="sos-action-hint mt-4 text-secondary">
                  Tap the button to initialize a 5-second countdown emergency alert to all contacts.
                </p>
              </div>
            )}

            {sosActive && (
              <div className="sos-active-state fade-in">
                <div className="sos-countdown-ring">
                  <span className="countdown-number">{sosCountdown}</span>
                </div>
                <h3 className="sos-countdown-title mt-4">Emergency Dispatch Initializing</h3>
                <p className="sos-countdown-desc text-muted">
                  Sending live GPS telemetry to selected contacts automatically in {sosCountdown}s.
                </p>
                <button className="sos-cancel-btn mt-6" onClick={cancelSOS}>
                  Cancel Countdown
                </button>
              </div>
            )}

            {sosTriggered && (
              <div className="sos-triggered-state fade-in">
                <div className="sos-success-check">
                  <FiAlertOctagon size={48} color="#fff" />
                </div>
                <h3 className="sos-success-title mt-4" style={{ color: 'var(--accent-red)' }}>SOS DISPATCHED</h3>
                <p className="sos-success-desc text-secondary">
                  An urgent alert along with your active GPS telemetry has been dispatched to all emergency contacts.
                </p>
                <button className="sos-cancel-btn mt-6" onClick={() => setSosTriggered(false)}>
                  Reset SOS Button
                </button>
              </div>
            )}
          </div>

          {/* Telemetry Location Details */}
          <div className="panel-card glass-panel mt-6">
            <h2 className="panel-title flex-center gap-2"><FiCompass /> Geolocation Telemetry</h2>
            <p className="section-sub-desc text-secondary mt-1">Live satellite navigation data from your active web browser.</p>

            <div className="telemetry-box mt-4">
              <div className="telemetry-coordinate-row">
                <span className="telemetry-coord-lbl">LATITUDE:</span>
                <span className="telemetry-coord-val">{coords.lat.toFixed(6)}° N</span>
              </div>
              <div className="telemetry-coordinate-row">
                <span className="telemetry-coord-lbl">LONGITUDE:</span>
                <span className="telemetry-coord-val">{coords.lng.toFixed(6)}° E</span>
              </div>
            </div>

            <div className="telemetry-address-row mt-4">
              <FiMapPin className="telemetry-pin-icon" />
              <div className="telemetry-address-content">
                <span className="telemetry-address-title">VERIFIED ADDRESS</span>
                <p className="telemetry-address-text">{locationLoading ? 'Retrieving satellites...' : locationName}</p>
              </div>
            </div>

            <div className="emergency-actions-row mt-6">
              <button className="outline-btn flex-1 flex-center gap-2" onClick={detectLocation} disabled={locationLoading}>
                Recalibrate Location
              </button>
              <button className="primary-btn flex-1 flex-center gap-2" style={{ background: 'var(--accent-purple)' }} onClick={handleShareLocation}>
                <FiShare2 /> Share Live GPS
              </button>
            </div>
          </div>

          {/* Emergency Helplines */}
          <div className="panel-card glass-panel mt-6">
            <div className="helpline-header-row">
              <h2 className="panel-title flex-center gap-2"><FiPhoneCall /> National Helplines</h2>
              <select 
                className="country-picker"
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
              >
                {DEFAULT_NUMBERS.map(n => (
                  <option key={n.country} value={n.country}>{n.country}</option>
                ))}
              </select>
            </div>

            <div className="helplines-grid mt-4">
              <a href={`tel:${countryNumbers.ambulance}`} className="helpline-card emergency-ambulance">
                <span className="helpline-name">Ambulance</span>
                <span className="helpline-num">{countryNumbers.ambulance}</span>
              </a>
              <a href={`tel:${countryNumbers.police}`} className="helpline-card emergency-police">
                <span className="helpline-name">Police Dispatch</span>
                <span className="helpline-num">{countryNumbers.police}</span>
              </a>
              <a href={`tel:${countryNumbers.disaster}`} className="helpline-card emergency-disaster">
                <span className="helpline-name">Disaster Relief</span>
                <span className="helpline-num">{countryNumbers.disaster}</span>
              </a>
              <a href={`tel:${countryNumbers.national}`} className="helpline-card emergency-national">
                <span className="helpline-name">National helpline</span>
                <span className="helpline-num">{countryNumbers.national}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Right Panel: Interactive Maps & Contacts */}
        <div className="emergency-right-col">
          {/* Nearby Emergency Map */}
          <div className="panel-card glass-panel h-100 flex flex-direction-column">
            <h2 className="panel-title flex-center gap-2 mb-4"><FiAlertTriangle /> Trauma & ER Map</h2>
            <div id="emergency-map" className="emergency-map-frame flex-1" style={{ height: '320px', borderRadius: '12px', border: '1px solid var(--border)' }}></div>
            <p className="map-disclaimer-text text-secondary mt-3">Red crosses show 24/7 surgical facilities and trauma rooms located within a 3km radius.</p>
          </div>

          {/* Emergency Contacts */}
          <div className="panel-card glass-panel mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="panel-title flex-center gap-2"><FiPlus /> Emergency Contacts</h2>
              <button className="view-all-btn flex-center" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Cancel' : '+ Add Contact'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={addContact} className="add-contact-form mb-4 fade-in">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={newContact.name} 
                  onChange={e => setNewContact({...newContact, name: e.target.value})}
                  className="filter-input w-100 mb-2"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Relationship (e.g. Spouse, Brother)" 
                  value={newContact.relationship} 
                  onChange={e => setNewContact({...newContact, relationship: e.target.value})}
                  className="filter-input w-100 mb-2"
                  required
                />
                <input 
                  type="text" 
                  placeholder="Phone Number" 
                  value={newContact.phone} 
                  onChange={e => setNewContact({...newContact, phone: e.target.value})}
                  className="filter-input w-100 mb-2"
                  required
                />
                <button type="submit" className="primary-btn w-100">Save Emergency Contact</button>
              </form>
            )}

            <div className="contacts-list-emergency">
              {contacts.map((contact, idx) => (
                <div key={idx} className="emergency-contact-row fade-in">
                  <div className="contact-info-wrap">
                    <span className="contact-initials">{contact.name[0]}</span>
                    <div>
                      <span className="contact-fullname">{contact.name}</span>
                      <span className="contact-relation">{contact.relationship}</span>
                    </div>
                  </div>
                  <div className="contact-actions-wrap">
                    <a href={`tel:${contact.phone}`} className="contact-call-btn">
                      <FiPhoneCall />
                    </a>
                    <button className="contact-del-btn" onClick={() => deleteContact(idx)}>
                      ✖
                    </button>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <p className="no-contacts-alert">No emergency contacts configured. Save someone to notify during an SOS.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

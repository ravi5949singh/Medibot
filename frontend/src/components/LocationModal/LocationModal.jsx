import { useState } from 'react'
import { FiMapPin, FiNavigation, FiCheck, FiX, FiAlertCircle, FiCompass } from 'react-icons/fi'
import './LocationModal.css'

/**
 * Fetch fallback location via IP if device GPS times out or is unavailable
 */
async function fetchIpLocation() {
  try {
    const res = await fetch('https://ipwho.is/')
    const data = await res.json()
    if (data && data.success && data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        pincode: data.postal || '',
        city: data.city || data.region || 'Your City',
        area: `${data.city || ''}, ${data.region || ''}`.trim()
      }
    }
  } catch (err) {
    console.warn('ipwho fallback notice:', err)
  }

  try {
    const res2 = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client')
    const data2 = await res2.json()
    if (data2 && data2.latitude && data2.longitude) {
      return {
        latitude: data2.latitude,
        longitude: data2.longitude,
        pincode: data2.postcode || '',
        city: data2.city || data2.locality || 'Your City',
        area: `${data2.locality || data2.city || ''}, ${data2.principalSubdivision || ''}`.trim()
      }
    }
  } catch (err2) {
    console.warn('bigdatacloud fallback notice:', err2)
  }

  return null
}

export default function LocationModal({ 
  isOpen, 
  onClose, 
  onLocationGranted, 
  title = "Find Nearby Clinics & Doctors", 
  description = "Allow MediCare AI to use your location to automatically find verified doctors, hospitals, and pharmacies near you." 
}) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  if (!isOpen) return null

  const handleRequestLocation = async () => {
    setIsDetecting(true)
    setStatusMessage('Detecting your GPS location...')

    let resolved = false

    // Function to finish and notify parent
    const completeLocation = (locationData) => {
      if (resolved) return
      resolved = true
      setIsDetecting(false)
      onLocationGranted(locationData)
      onClose()
    }

    // Backup timer: If browser GPS hangs for > 3.5s (common on desktops), use IP location
    const fallbackTimer = setTimeout(async () => {
      if (!resolved) {
        setStatusMessage('Connecting to local network location...')
        const ipLoc = await fetchIpLocation()
        if (ipLoc) {
          completeLocation(ipLoc)
        } else {
          // Default to central India if everything fails
          completeLocation({ latitude: 23.2599, longitude: 77.4126, city: 'Local Area', pincode: '462001' })
        }
      }
    }, 3500)

    // Try HTML5 Browser Geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(fallbackTimer)
          const { latitude, longitude } = position.coords

          // Optional reverse geocode to get city/pincode
          let pincode = ''
          let city = ''
          try {
            const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
            const revData = await revRes.json()
            if (revData && revData.address) {
              pincode = revData.address.postcode || ''
              city = revData.address.city || revData.address.town || revData.address.suburb || ''
            }
          } catch {
            // Non-critical
          }

          completeLocation({
            latitude,
            longitude,
            pincode,
            city: city || 'Your Area',
            area: city
          })
        },
        async (error) => {
          console.warn('Browser GPS notice (using IP fallback):', error.message)
          clearTimeout(fallbackTimer)
          setStatusMessage('Detecting local area...')
          const ipLoc = await fetchIpLocation()
          if (ipLoc) {
            completeLocation(ipLoc)
          } else {
            completeLocation({ latitude: 23.2599, longitude: 77.4126, city: 'Local Area', pincode: '462001' })
          }
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      )
    } else {
      clearTimeout(fallbackTimer)
      const ipLoc = await fetchIpLocation()
      if (ipLoc) {
        completeLocation(ipLoc)
      } else {
        completeLocation({ latitude: 23.2599, longitude: 77.4126, city: 'Local Area', pincode: '462001' })
      }
    }
  }

  return (
    <div className="location-modal-overlay fade-in" onClick={onClose}>
      <div className="location-modal-card glass-panel" onClick={e => e.stopPropagation()}>
        <button className="location-modal-close" onClick={onClose} title="Close">
          <FiX size={18} />
        </button>

        <div className="location-modal-icon-wrap">
          <div className="loc-pulse-circle"></div>
          <FiMapPin className="location-modal-pin" />
        </div>

        <h2 className="location-modal-title">{title}</h2>
        <p className="location-modal-desc">{description}</p>

        {statusMessage && (
          <div className="location-status-badge mt-3">
            <span className="loc-spinner-small"></span>
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="location-modal-actions mt-5">
          <button 
            className="primary-btn location-allow-btn flex-center gap-2"
            onClick={handleRequestLocation}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <>
                <span className="loc-spinner"></span>
                <span>Locating Nearby Clinics...</span>
              </>
            ) : (
              <>
                <FiNavigation />
                <span>Allow Location & Show Nearby Clinics</span>
              </>
            )}
          </button>
          <button className="outline-btn location-manual-btn" onClick={onClose}>
            Enter Pincode Manually
          </button>
        </div>

        <div className="location-privacy-note mt-4">
          🔒 Works on both Mobile & Desktop. Your coordinates are used only to find facilities near you.
        </div>
      </div>
    </div>
  )
}

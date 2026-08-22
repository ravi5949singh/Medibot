import { useState } from 'react'
import { FiMapPin, FiNavigation, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi'
import './LocationModal.css'

export default function LocationModal({ isOpen, onClose, onLocationGranted, title = "Find Nearby Clinics & Pharmacies", description = "Allow MediCare AI to access your device GPS location to automatically find real verified clinics, doctors, and medical stores near you." }) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser. Please enter your pincode manually.')
      return
    }

    setIsDetecting(true)
    setErrorMessage('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false)
        const { latitude, longitude } = position.coords
        onLocationGranted({ latitude, longitude })
        onClose()
      },
      (error) => {
        setIsDetecting(false)
        console.warn('Geolocation error:', error)
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Location permission was denied. Please allow location access in your browser or search by pincode.')
        } else {
          setErrorMessage('Unable to retrieve your location. Please check your GPS or enter pincode.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
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

        {errorMessage && (
          <div className="location-error-box mt-3">
            <FiAlertCircle size={16} />
            <span>{errorMessage}</span>
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
                <span>Detecting Exact GPS...</span>
              </>
            ) : (
              <>
                <FiNavigation />
                <span>Allow GPS & Show Local Clinics</span>
              </>
            )}
          </button>
          <button className="outline-btn location-manual-btn" onClick={onClose}>
            Enter Pincode Manually
          </button>
        </div>

        <div className="location-privacy-note mt-4">
          🔒 Your location is only used to calculate proximity to nearby medical facilities and is never stored or shared.
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiBell, FiMapPin } from 'react-icons/fi'
import './Header.css'

export default function Header() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({ name: 'User' })
  const [avatar, setAvatar] = useState(null)
  const [headerSearch, setHeaderSearch] = useState('')

  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const savedProfile = localStorage.getItem('medicare_profile')
        const savedAvatar = localStorage.getItem('medicare_avatar')
        if (savedProfile) setProfile(JSON.parse(savedProfile))
        if (savedAvatar) setAvatar(JSON.parse(savedAvatar))
      } catch (e) {
        console.error('Failed to load profile in header', e)
      }
    }

    handleStorageUpdate()
    // Poll or listen for changes so it updates instantly when changed in Settings
    window.addEventListener('storage', handleStorageUpdate)
    const interval = setInterval(handleStorageUpdate, 2000)

    return () => {
      window.removeEventListener('storage', handleStorageUpdate)
      clearInterval(interval)
    }
  }, [])

  const handleHeaderSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      const query = headerSearch.trim()
      if (!query) return
      
      const lower = query.toLowerCase()
      if (lower.includes('doctor') || lower.includes('cardiologist') || lower.includes('pedi') || lower.includes('derma') || lower.includes('general')) {
        navigate('/find-doctors', { state: { specialization: query } })
      } else if (lower.includes('med') || lower.includes('pill') || lower.includes('tablet') || lower.includes('pharmacy') || lower.includes('paracetamol')) {
        navigate('/medicine-stores', { state: { medicine: query } })
      } else {
        navigate('/chat', { state: { prefill: query } })
      }
      setHeaderSearch('')
    }
  }

  return (
    <header className="header">
      <div className="header-search">
        <FiSearch className="search-icon" />
        <input
          type="text"
          id="global-search"
          placeholder="Search doctors, clinics, medicines..."
          className="search-input"
          value={headerSearch}
          onChange={e => setHeaderSearch(e.target.value)}
          onKeyPress={handleHeaderSearchSubmit}
        />
      </div>

      <div className="header-right">
        <button className="location-btn" id="location-btn" onClick={() => navigate('/emergency')}>
          <FiMapPin size={16} />
          <span>{profile.city || '462001'}</span>
        </button>

        <button className="notif-btn" id="notification-btn" onClick={() => navigate('/settings')}>
          <FiBell size={18} />
          <span className="notif-dot"></span>
        </button>

        <div className="avatar-wrap" id="user-avatar" onClick={() => navigate('/settings')} title="Go to Settings">
          {avatar ? (
            <img src={avatar} alt="Profile" className="avatar-img-circle" />
          ) : (
            <div className="avatar-circle">
              <span>{profile.name ? profile.name[0].toUpperCase() : 'U'}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


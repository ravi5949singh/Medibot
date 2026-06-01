import { NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiMessageCircle, FiSearch, FiShoppingBag, FiHeart, FiClock, FiCalendar, FiFileText, FiSettings, FiPhone, FiActivity } from 'react-icons/fi'
import './Sidebar.css'

const navItems = [
  { path: '/', icon: <FiHome />, label: 'Home' },
  { path: '/chat', icon: <FiMessageCircle />, label: 'AI Chat Assistant' },
  { path: '/symptom-checker', icon: <FiActivity />, label: 'Symptom Checker' },
  { path: '/find-doctors', icon: <FiSearch />, label: 'Find Doctors' },
  { path: '/medicine-stores', icon: <FiShoppingBag />, label: 'Medicine Stores' },
  { path: '/emergency', icon: <FiPhone />, label: 'SOS Emergency' },
  { path: '/health-tips', icon: <FiHeart />, label: 'Health Tips' },
  { path: '/history', icon: <FiClock />, label: 'My History' },
  { path: '/appointments', icon: <FiCalendar />, label: 'Appointments' },
  { path: '/records', icon: <FiFileText />, label: 'Health Records' },
  { path: '/settings', icon: <FiSettings />, label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="16" r="15" fill="url(#brandGrad)" />
            <path d="M16 8v16M8 16h16" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#4F8CFF" />
                <stop offset="100%" stopColor="#6C5CE7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">MediCare AI</span>
          <span className="brand-tagline">Your Health Assistant</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="emergency-btn" id="emergency-sos-btn" onClick={() => navigate('/emergency')}>
          <div className="emergency-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </div>
          <div className="emergency-text">
            <span className="emergency-title">Emergency SOS</span>
            <span className="emergency-sub">Get immediate help</span>
          </div>
        </button>

        <div className="disclaimer-box">
          <div className="disclaimer-icon">⚕</div>
          <div className="disclaimer-label">Disclaimer</div>
          <p className="disclaimer-text">
            This AI assistant provides general health information only and is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </aside>
  )
}

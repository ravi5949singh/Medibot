import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPhone, FiNavigation, FiTrash2, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi'
import DirectionModal from '../components/Map/DirectionModal'
import './Pages.css'

export default function Appointments() {
  const [activities, setActivities] = useState([])
  const [selectedEntity, setSelectedEntity] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = () => {
    try {
      const saved = localStorage.getItem('medicare_appointments')
      setActivities(saved ? JSON.parse(saved) : [])
    } catch {
      setActivities([])
    }
  }

  const clearAll = () => {
    localStorage.removeItem('medicare_appointments')
    setActivities([])
  }

  const deleteEntry = (id) => {
    const updated = activities.filter(act => act.id !== id)
    setActivities(updated)
    localStorage.setItem('medicare_appointments', JSON.stringify(updated))
  }

  // Generate fallback avatar color based on name
  const getAvatarColor = (name) => {
    const colors = ['#4F6BF6', '#22C55E', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899']
    return colors[name.length % colors.length]
  }

  return (
    <div className="page-full">
      <div className="history-header">
        <div>
          <h1 className="page-heading">My Appointments & Visits</h1>
          <p className="page-desc">Track your direct phone consultations and clinic directions history</p>
        </div>
        {activities.length > 0 && (
          <button className="history-clear-btn" onClick={clearAll}>
            <FiTrash2 size={14} />
            Clear All Logs
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">
            <FiCalendar size={48} />
          </div>
          <h3>No recorded activity</h3>
          <p>Your doctor phone consultations and route visits will appear here once you search and contact them.</p>
          <button className="history-start-btn" onClick={() => navigate('/find-doctors')}>
            Find Doctors Now
          </button>
        </div>
      ) : (
        <div className="history-list">
          {activities.map(act => (
            <div key={act.id} className="history-card fade-in" id={`act-${act.id}`} style={{ borderLeft: `4px solid ${act.type === 'Call' ? '#4F6BF6' : '#22C55E'}` }}>
              <div className="history-dot" style={{ background: act.type === 'Call' ? '#4F6BF6' : '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {act.type === 'Call' ? <FiPhone size={10} color="#fff" /> : <FiNavigation size={10} color="#fff" />}
              </div>
              <div className="history-info">
                <div className="history-date" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiClock size={12} /> {act.date}
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    background: act.type === 'Call' ? '#E0F2FE' : '#DCFCE7', 
                    color: act.type === 'Call' ? '#0369A1' : '#166534',
                    marginLeft: '6px'
                  }}>
                    {act.type === 'Call' ? '📞 PHONED' : '📍 VISITED'}
                  </span>
                </div>
                <div className="result-card-header" style={{ marginTop: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="result-avatar" style={{ width: '38px', height: '38px', fontSize: '0.78rem', background: getAvatarColor(act.doctorName), display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#fff', fontWeight: 600 }}>
                    {act.doctorName.split(' ').slice(1, 3).map(n => n?.[0]).join('') || act.doctorName[0]}
                  </div>
                  <div>
                    <div className="result-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{act.doctorName}</div>
                    <div className="result-spec" style={{ fontSize: '0.76rem', color: '#64748B' }}>{act.specialization}</div>
                  </div>
                </div>
                <div className="result-meta" style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>📞 {act.phone}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiMapPin size={12} /> {act.address}</span>
                </div>
                <div className="result-actions" style={{ display: 'flex', gap: '10px', marginTop: '14px', maxWidth: '300px' }}>
                  <a href={`tel:${act.phone}`} className="result-btn result-btn--primary" style={{ flex: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#4F6BF6', color: '#fff', padding: '6px', fontSize: '0.76rem', borderRadius: '6px' }}>
                    <FiPhone size={12} /> Re-call
                  </a>
                  {act.latitude && act.longitude ? (
                    <button onClick={() => setSelectedEntity(act)} className="result-btn result-btn--outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #E5E7EB', color: '#64748B', padding: '6px', fontSize: '0.76rem', borderRadius: '6px', cursor: 'pointer' }}>
                      <FiNavigation size={12} /> Directions
                    </button>
                  ) : (
                    <button className="result-btn result-btn--outline" style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #E5E7EB', color: '#94A3B8', padding: '6px', fontSize: '0.76rem', borderRadius: '6px' }} disabled>
                      <FiNavigation size={12} /> No Map
                    </button>
                  )}
                </div>
              </div>
              <button className="history-delete-btn" onClick={() => deleteEntry(act.id)} title="Delete Log">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedEntity && (
        <DirectionModal doctor={selectedEntity} onClose={() => setSelectedEntity(null)} />
      )}
    </div>
  )
}

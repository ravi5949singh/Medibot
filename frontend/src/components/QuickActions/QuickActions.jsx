import { FiActivity, FiSearch, FiShoppingBag, FiHeart, FiFileText } from 'react-icons/fi'
import './QuickActions.css'

const actions = [
  { icon: <FiActivity />, label: 'Symptom Checker', sub: 'Check your symptoms', color: '#4F6BF6' },
  { icon: <FiSearch />, label: 'Find Doctors', sub: 'Find best doctors near you', color: '#8B5CF6' },
  { icon: <FiShoppingBag />, label: 'Medicine Stores', sub: 'Find medicines near you', color: '#22C55E' },
  { icon: <FiHeart />, label: 'Health Tips', sub: 'Daily health tips for you', color: '#EF4444' },
  { icon: <FiFileText />, label: 'My Reports', sub: 'Upload and view your reports', color: '#F59E0B' },
]

export default function QuickActions() {
  return (
    <div className="quick-actions">
      {actions.map((a, i) => (
        <button key={i} className="quick-action-card" id={`quick-action-${i}`}>
          <div className="qa-icon" style={{ color: a.color, background: `${a.color}15` }}>
            {a.icon}
          </div>
          <span className="qa-label">{a.label}</span>
          <span className="qa-sub">{a.sub}</span>
        </button>
      ))}
    </div>
  )
}

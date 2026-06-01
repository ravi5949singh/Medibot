import { FiPhone } from 'react-icons/fi'
import './Pharmacy.css'

const pharmacies = [
  { id: 1, name: 'Apollo Pharmacy', distance: '1.2 km away', color: '#4F6BF6' },
  { id: 2, name: 'MedPlus', distance: '1.8 km away', color: '#22C55E' },
  { id: 3, name: 'Netmeds', distance: '2.3 km away', color: '#8B5CF6' },
]

export default function PharmacyPanel() {
  return (
    <div className="panel-card">
      <div className="panel-header">
        <h2 className="panel-title">Nearby Medicine Stores</h2>
        <button className="view-all-btn" id="view-all-pharmacies">View all</button>
      </div>
      <div className="pharmacy-list">
        {pharmacies.map(p => (
          <div key={p.id} className="pharmacy-card fade-in" id={`pharmacy-${p.id}`}>
            <div className="pharmacy-icon" style={{ background: p.color }}>💊</div>
            <div className="pharmacy-info">
              <h3 className="pharmacy-name">{p.name}</h3>
              <p className="pharmacy-dist">{p.distance}</p>
            </div>
            <button className="action-circle" title="Call">
              <FiPhone size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

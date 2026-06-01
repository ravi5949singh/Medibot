import { FiPhone, FiNavigation } from 'react-icons/fi'
import './Doctors.css'

const doctors = [
  { id: 1, name: 'Dr. Ankit Sharma', spec: 'General Physician', distance: '2.1 km away', color: '#4F6BF6' },
  { id: 2, name: 'Dr. Neha Verma', spec: 'Fever Specialist', distance: '2.8 km away', color: '#22C55E' },
  { id: 3, name: 'Dr. Rajat Mehta', spec: 'Internal Medicine', distance: '3.2 km away', color: '#8B5CF6' },
]

export default function DoctorPanel() {
  return (
    <div className="panel-card">
      <div className="panel-header">
        <h2 className="panel-title">Nearby Doctors</h2>
        <button className="view-all-btn" id="view-all-doctors">View all</button>
      </div>
      <div className="doctor-list">
        {doctors.map(doc => (
          <div key={doc.id} className="doctor-card fade-in" id={`doctor-${doc.id}`}>
            <div className="doctor-avatar" style={{ background: doc.color }}>
              {doc.name.split(' ').slice(1, 3).map(n => n[0]).join('')}
            </div>
            <div className="doctor-info">
              <h3 className="doctor-name">{doc.name}</h3>
              <p className="doctor-spec">{doc.spec}</p>
              <p className="doctor-dist">{doc.distance}</p>
            </div>
            <div className="doctor-actions">
              <button className="action-circle" title="Call">
                <FiPhone size={14} />
              </button>
              <button className="action-circle" title="Directions">
                <FiNavigation size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

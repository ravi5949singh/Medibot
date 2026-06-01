import { FiAlertTriangle } from 'react-icons/fi'

export default function SeverityAlert() {
  return (
    <div className="severity-alert severity-alert--warning fade-in">
      <FiAlertTriangle className="severity-icon" />
      <p>
        If you have severe symptoms like high fever, vomiting, breathing problem, chest pain, please consult a doctor immediately.
      </p>
    </div>
  )
}

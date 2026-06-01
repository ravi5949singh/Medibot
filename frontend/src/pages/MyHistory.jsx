import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMessageCircle, FiTrash2 } from 'react-icons/fi'
import './Pages.css'

const HISTORY_KEY = 'medicare_chat_history'
const severityColors = { mild: '#22C55E', medium: '#F59E0B', severe: '#EF4444', general: '#4F6BF6' }
const severityLabels = { mild: 'MILD', medium: 'MEDIUM', severe: 'SEVERE', general: 'CHAT' }

export default function MyHistory() {
  const [history, setHistory] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      setHistory(saved ? JSON.parse(saved) : [])
    } catch {
      setHistory([])
    }
  }

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }

  const deleteEntry = (id) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }

  return (
    <div className="page-full">
      <div className="history-header">
        <div>
          <h1 className="page-heading">My Chat History</h1>
          <p className="page-desc">Review your past conversations and AI recommendations</p>
        </div>
        {history.length > 0 && (
          <button className="history-clear-btn" onClick={clearHistory}>
            <FiTrash2 size={14} />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">
            <FiMessageCircle size={48} />
          </div>
          <h3>No chat history yet</h3>
          <p>Start a conversation with MediCare AI and your chats will appear here.</p>
          <button className="history-start-btn" onClick={() => navigate('/chat')}>
            Start Chatting →
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.map(h => (
            <div key={h.id} className="history-card fade-in" id={`history-${h.id}`}>
              <div className="history-dot" style={{ background: severityColors[h.severity] || '#4F6BF6' }}></div>
              <div className="history-info">
                <div className="history-date">{h.date}</div>
                <div className="history-msg"><strong>You:</strong> {h.msg}</div>
                <div className="history-msg history-response"><strong>AI:</strong> {h.response?.substring(0, 200)}{h.response?.length > 200 ? '...' : ''}</div>
                <span className={`history-tag tag-${h.severity || 'general'}`}>
                  {severityLabels[h.severity] || 'CHAT'}
                </span>
              </div>
              <button className="history-delete-btn" onClick={() => deleteEntry(h.id)} title="Delete">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

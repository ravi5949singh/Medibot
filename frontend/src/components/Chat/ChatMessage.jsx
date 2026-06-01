import { FiCheck } from 'react-icons/fi'

export default function ChatMessage({ message }) {
  if (message.greeting) return null

  const isUser = message.type === 'user'

  return (
    <div className={`chat-msg ${isUser ? 'chat-msg--user' : 'chat-msg--bot'} fade-in`}>
      {!isUser && (
        <div className="msg-avatar">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="16" r="15" fill="#4F6BF6" />
            <path d="M16 9v14M9 16h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div className={`msg-bubble ${isUser ? 'msg-bubble--user' : 'msg-bubble--bot'}`}>
        {message.text && message.text.split('\n').map((line, i) => (
          <p key={i} className="msg-text">{line}</p>
        ))}

        {message.suggestions && (
          <div className="msg-suggestions">
            <p className="suggestions-title">General Suggestions:</p>
            <ul className="suggestions-list">
              {message.suggestions.map((s, i) => (
                <li key={i} className="suggestion-item">
                  <FiCheck className="suggestion-check" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <span className="msg-time">
          {message.time}
          {isUser && <span className="msg-read"> ✓✓</span>}
        </span>
      </div>
    </div>
  )
}

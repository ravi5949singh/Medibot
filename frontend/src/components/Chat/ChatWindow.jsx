import { useState } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import SeverityAlert from './SeverityAlert'
import './Chat.css'

const initialMessages = [
  {
    id: 1,
    type: 'bot',
    text: null,
    greeting: true,
    time: '10:30 AM'
  },
  {
    id: 2,
    type: 'user',
    text: 'I have headache and fever since 2 days.',
    time: '10:30 AM'
  },
  {
    id: 3,
    type: 'bot',
    text: 'I understand you are experiencing headache and fever.\n\nThis could be due to viral infection, flu or other reasons.',
    suggestions: [
      'Rest and drink plenty of fluids.',
      'You may take Paracetamol 500mg after food.',
      'Keep yourself hydrated.',
      'If fever persists more than 3 days, consult a doctor.'
    ],
    time: '10:31 AM'
  }
]

export default function ChatWindow() {
  const [messages, setMessages] = useState(initialMessages)
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = (text) => {
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: `I understand you're experiencing "${text}". Let me analyze your symptoms...`,
        suggestions: [
          'Stay hydrated and get plenty of rest.',
          'Monitor your symptoms closely.',
          'If symptoms worsen, consult a doctor immediately.'
        ],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="chat-window">
      <div className="chat-greeting">
        <div className="greeting-avatar">
          <svg viewBox="0 0 40 40" width="48" height="48">
            <circle cx="20" cy="20" r="19" fill="#E8EDFF" />
            <circle cx="20" cy="20" r="14" fill="#4F6BF6" />
            <path d="M20 12v16M12 20h16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 className="greeting-title">Hello, How can I help you today? 👋</h1>
          <p className="greeting-sub">I can help you with health information, symptoms, doctors and more.</p>
        </div>
      </div>

      <div className="chat-messages" id="chat-messages">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-avatar">
              <svg viewBox="0 0 32 32" width="28" height="28">
                <circle cx="16" cy="16" r="15" fill="#4F6BF6" />
                <path d="M16 9v14M9 16h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <SeverityAlert />

      <div className="chat-quick-btns">
        <button className="quick-btn quick-btn--blue" id="find-doctors-quick">
          <span>📍</span> Find Doctors Near Me
        </button>
        <button className="quick-btn quick-btn--green" id="nearby-medicine-quick">
          <span>💊</span> Nearby Medicine Stores
        </button>
        <button className="quick-btn quick-btn--red" id="emergency-help-quick">
          <span>🚨</span> Emergency Help
        </button>
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  )
}

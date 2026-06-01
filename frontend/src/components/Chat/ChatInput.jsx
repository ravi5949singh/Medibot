import { useState } from 'react'
import { FiPaperclip, FiMic, FiSend } from 'react-icons/fi'

export default function ChatInput({ onSend }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form className="chat-input-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        id="symptom-input"
        className="chat-input"
        placeholder="Type your symptoms here..."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div className="input-actions">
        <button type="button" className="input-icon-btn" title="Attach file">
          <FiPaperclip />
        </button>
        <button type="button" className="input-icon-btn" title="Voice input">
          <FiMic />
        </button>
        <button type="submit" className="send-btn" id="send-message-btn" title="Send">
          <FiSend />
        </button>
      </div>
    </form>
  )
}

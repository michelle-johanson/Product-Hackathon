import { useState } from 'react';

export default function AiChatComponent({ groupId, user }) {
  // Logic preserved but inactive for the placeholder
  const [messages] = useState([]);

  return (
    <div className="ai-chat-component" style={{ height: '100%', position: 'relative' }}>
      {/* Placeholder Overlay */}
      <div className="ai-placeholder-overlay">
        <div className="placeholder-content">
          <span style={{ fontSize: '3rem' }}>🤖</span>
          <h3 style={{ marginTop: '15px' }}>AI Bot Coming Soon</h3>
          <p style={{ opacity: 0.7 }}>We're currently fine-tuning the AI to better assist your study sessions!</p>
        </div>
      </div>

      {/* Background UI structure (blurred/dimmed) */}
      <div className="ai-chat-history" style={{ filter: 'blur(4px)', pointerEvents: 'none', opacity: 0.5 }}>
        <div className="msg-bubble light">Hello! How can I help you study today?</div>
      </div>
      
      <div className="chat-input-area" style={{ filter: 'blur(4px)', pointerEvents: 'none', opacity: 0.5 }}>
        <input type="text" className="chat-pill-input" placeholder="Ask AI..." disabled />
      </div>
    </div>
  );
}
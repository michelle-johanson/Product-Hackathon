import { useState, useEffect, useRef } from 'react';

export default function AiChatComponent({ groupId, user }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: 'greeting',
        text: 'Hey there! I\'m Jerry the Driver, ready to help you cruise through your studies! What can I help you with today?',
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call your backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth token if needed
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          question: inputValue,
          groupId: groupId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        sender: 'ai',
        timestamp: new Date(),
        sources: data.sources,
        demoMode: data.demoMode
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsDemoMode(data.demoMode);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chat-component" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '8px 12px',
          fontSize: '0.85rem',
          borderBottom: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          ⚠️ Demo Mode: AI responses are simulated. Add your API key to enable real AI.
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="ai-chat-history" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`msg-group ${msg.sender === 'user' ? 'own' : 'other'}`}>
            {msg.sender === 'ai' && (
              <div className="msg-sender-name" style={{ color: '#ffffff' }}>
                🚗 Jerry the Driver
              </div>
            )}
            {msg.sender === 'user' && (
              <div className="msg-sender-name" style={{ color: '#666' }}>
                {user?.name || 'You'}
              </div>
            )}
            
            <div className={`msg-bubble ${msg.sender === 'user' ? 'dark' : 'light'}`}>
              {msg.text}
              
              {/* Show sources if available */}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ 
                  marginTop: '10px', 
                  paddingTop: '10px', 
                  borderTop: '1px solid rgba(0,0,0,0.1)',
                  fontSize: '0.8rem',
                  opacity: 0.8
                }}>
                  <strong>Sources:</strong> {msg.sources.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="msg-group other">
            <div className="msg-sender-name" style={{ color: '#ffffff' }}>
              Jerry the Driver
            </div>
            <div className="msg-bubble light">
              <span style={{ opacity: 0.6 }}>Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <form onSubmit={handleSendMessage}>
          <div className="chat-input-pill">
            <input
              type="text"
              className="chat-pill-input"
              placeholder="Ask Jerry about your class materials..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="chat-send-btn-circle"
              disabled={isLoading || !inputValue.trim()}
              style={{ opacity: isLoading || !inputValue.trim() ? 0.5 : 1 }}
            >
              <span style={{ fontSize: '1.2rem' }}>➤</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
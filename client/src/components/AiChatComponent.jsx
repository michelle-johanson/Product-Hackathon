import { useState, useEffect, useRef } from 'react';

export default function AiChatComponent({ groupId, user }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    const userQuestion = question.trim();
    setQuestion('');
    setLoading(true);
    setError(null);

    // Add user message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: userQuestion,
      timestamp: new Date()
    }]);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: userQuestion,
          groupId: parseInt(groupId)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await res.json();

      // Add AI response to chat
      setMessages(prev => [...prev, {
        type: 'ai',
        content: data.answer,
        sources: data.sources,
        sourceCount: data.sourceCount,
        timestamp: new Date()
      }]);

    } catch (err) {
      console.error('Error asking question:', err);
      setError(err.message);

      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-component">
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-title">
          <span className="ai-chat-icon">🤖</span>
          <h3>AI Study Assistant</h3>
        </div>
        <p className="ai-chat-subtitle">Ask questions about your class materials</p>
      </div>

      {/* Messages */}
      <div className="ai-chat-history">
        {messages.length === 0 ? (
          <div className="ai-chat-empty">
            <div className="ai-chat-empty-icon">💡</div>
            <p>Ask me anything about your class notes and materials!</p>
            <p className="ai-chat-empty-hint">I'll search through your notes and files to find the best answer.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`ai-message ai-message-${msg.type}`}>
              {msg.type === 'user' ? (
                <>
                  <div className="ai-message-avatar">👤</div>
                  <div className="ai-message-content">
                    <div className="ai-message-text">{msg.content}</div>
                    <div className="ai-message-time">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="ai-message-avatar">🤖</div>
                  <div className="ai-message-content">
                    <div className="ai-message-text">{msg.content}</div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="ai-message-sources">
                        <strong>📚 Sources:</strong>
                        <ul>
                          {msg.sources.map((source, sidx) => (
                            <li key={sidx}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="ai-message-time">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="ai-message ai-message-ai">
            <div className="ai-message-avatar">🤖</div>
            <div className="ai-message-content">
              <div className="ai-loading">
                <span className="ai-loading-dot"></span>
                <span className="ai-loading-dot"></span>
                <span className="ai-loading-dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="ai-chat-error">
          ⚠️ {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleAskQuestion} className="ai-chat-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your class..."
          disabled={loading}
          className="ai-chat-input"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="ai-chat-send-btn"
        >
          {loading ? '🔄' : '📤'}
        </button>
      </form>
    </div>
  );
}

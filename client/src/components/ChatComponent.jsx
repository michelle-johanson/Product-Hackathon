import { useState, useEffect, useRef } from 'react';

export default function ChatComponent({ groupId, socket, user }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!groupId) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}/messages?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [groupId]);

  useEffect(() => {
    if (!socket || socket.readyState !== 1) return;

    socket.send(JSON.stringify({ type: 'join_group', groupId: parseInt(groupId) }));

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data.groupId === parseInt(groupId)) {
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, groupId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket || socket.readyState !== 1) return;

    socket.send(JSON.stringify({
      type: 'message',
      groupId: parseInt(groupId),
      content: inputValue.trim()
    }));
    setInputValue('');
  };

  return (
    <div className="chat-container-inner" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chat-messages-wrapper">
        {loading ? (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>Loading messages...</p>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.userId === user?.id;
            return (
              <div key={msg.id || idx} className={`msg-group ${isOwn ? 'own' : 'other'}`}>
                {!isOwn && <span className="msg-sender-name">{msg.userName}</span>}
                <div className={`msg-bubble ${isOwn ? 'dark' : 'light'}`}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-area">
        <div className="chat-input-pill">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="chat-pill-input"
          />
          <button type="submit" className="chat-send-btn-circle" disabled={!inputValue.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
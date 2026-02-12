import { useState, useEffect, useRef } from 'react';

export default function ChatComponent({ groupId, socket, user }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch message history when groupId changes
  useEffect(() => {
    if (!groupId) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/groups/${groupId}/messages?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch messages: ${res.status}`);
        }

        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load message history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [groupId]);

  // Set up WebSocket listeners and join group
  useEffect(() => {
    if (!socket || socket.readyState !== 1) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connected');

    // Join the group room
    socket.send(JSON.stringify({
      type: 'join_group',
      groupId: parseInt(groupId)
    }));

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle different message types
        if (data.type === 'message' && data.groupId === parseInt(groupId)) {
          // Add incoming message to state
          setMessages((prev) => [...prev, {
            id: data.id,
            groupId: data.groupId,
            userId: data.userId,
            userName: data.userName,
            content: data.content,
            createdAt: data.createdAt
          }]);
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.message);
          setError(data.message);
        } else if (data.type === 'connected') {
          console.log('Connected to chat:', data.message);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    const handleClose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    const handleOpen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
    };

    socket.addEventListener('message', handleMessage);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('open', handleOpen);

    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('open', handleOpen);
    };
  }, [socket, groupId]);

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;
    if (!socket || socket.readyState !== 1) {
      setError('WebSocket connection not available');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Send message via WebSocket
      const message = {
        type: 'message',
        groupId: parseInt(groupId),
        content: inputValue.trim()
      };

      socket.send(JSON.stringify(message));

      // Clear input field after sending
      setInputValue('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-component" style={{ display: 'flex', flexDirection: 'column', height: '600px', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ padding: '15px', borderBottom: '1px solid #eee', background: '#f9f9fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: '0', fontSize: '1rem' }}>Group Chat</h3>
        <div style={{ fontSize: '0.8rem', color: connectionStatus === 'connected' ? '#27ae60' : '#e74c3c' }}>
          {connectionStatus === 'connected' ? '🟢 Connected' : connectionStatus === 'connecting' ? '🟡 Connecting...' : '🔴 Disconnected'}
        </div>
      </div>

      {/* Messages List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#fafafa' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#999', margin: 'auto' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#bbb', margin: 'auto' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '8px',
                padding: '10px',
                background: msg.userId === user?.id ? '#e8f4f8' : '#fff',
                borderRadius: '8px',
                borderLeft: msg.userId === user?.id ? '3px solid #3498db' : '3px solid #bdc3c7'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  background: '#3498db',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {msg.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {msg.userName}
                    {msg.userId === user?.id && <span style={{ fontSize: '0.8rem', color: '#7f8c8d', marginLeft: '8px' }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#999' }}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#333', marginLeft: '38px' }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '10px', background: '#ffe8e8', color: '#c0392b', borderBottom: '1px solid #e8e8e8', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{ padding: '15px', borderTop: '1px solid #eee', background: '#fff', display: 'flex', gap: '10px' }}>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          disabled={!socket || socket.readyState !== 1}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            resize: 'none',
            minHeight: '50px',
            maxHeight: '100px',
            opacity: socket && socket.readyState === 1 ? 1 : 0.5
          }}
        />
        <button
          type="submit"
          disabled={sending || !socket || socket.readyState !== 1 || !inputValue.trim()}
          style={{
            padding: '10px 20px',
            background: sending || !socket || socket.readyState !== 1 ? '#bdc3c7' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: (sending || !socket || socket.readyState !== 1) ? 'not-allowed' : 'pointer',
            alignSelf: 'flex-end'
          }}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

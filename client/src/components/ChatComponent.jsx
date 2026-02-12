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
    <div className="chat-component">
      {/* Header */}
      <div className="chat-header">
        <h3 className="chat-title">Group Chat</h3>
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'connected' ? '🟢 Connected' : connectionStatus === 'connecting' ? '🟡 Connecting...' : '🔴 Disconnected'}
        </div>
      </div>

      {/* Messages List */}
      <div className="chat-history">
        {loading ? (
          <div className="chat-loading">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`message-bubble ${msg.userId === user?.id ? 'own-message' : ''}`}
            >
              <div className="message-header">
                <div className="message-avatar">
                  {msg.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="message-user-name">
                    {msg.userName}
                    {msg.userId === user?.id && <span className="message-you-label">(you)</span>}
                  </div>
                  <div className="message-timestamp">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="chat-error">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          disabled={!socket || socket.readyState !== 1}
          className="chat-textarea"
        />
        <button
          type="submit"
          disabled={sending || !socket || socket.readyState !== 1 || !inputValue.trim()}
          className="chat-send-btn"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

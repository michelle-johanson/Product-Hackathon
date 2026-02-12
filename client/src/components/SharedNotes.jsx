import { useState, useEffect, useRef } from 'react';

export default function SharedNotes({ groupId, socket }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('All changes saved');

  useEffect(() => {
    // 1. Fetch initial content from DB
    const fetchNote = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:3000/api/notes/${groupId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setContent(data.content || '');
      } catch (err) {
        console.error("Error loading notes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [groupId]);

  useEffect(() => {
    if (!socket) return;

    const handleWsMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'note_update' && data.groupId === parseInt(groupId)) {
        setContent(data.content);
      }
    };

    socket.addEventListener('message', handleWsMessage);
    return () => socket.removeEventListener('message', handleWsMessage);
  }, [socket, groupId]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    setSaveStatus('Unsaved changes...');

    // Live broadcast via WebSocket (Real-time syncing)
    if (socket?.readyState === 1) {
      socket.send(JSON.stringify({
        type: 'note_update',
        groupId: parseInt(groupId),
        content: newContent
      }));
    }
  };

  // 2. Manual Save to Database
  const handleSave = async () => {
    setSaveStatus('Saving...');
    const token = localStorage.getItem('token');
    try {
      // Re-using your sister's route logic pattern from messages.js
      const res = await fetch(`http://localhost:3000/api/notes/${groupId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        setSaveStatus('All changes saved');
      } else {
        setSaveStatus('Error saving');
      }
    } catch (err) {
      setSaveStatus('Network error');
    }
  };

  if (loading) return <div>Loading notes...</div>;

  return (
    <div className="card notes-container">
      <div className="notes-header">
        <h3 className="notes-title">📝 Shared Study Notes</h3>
        <div className="notes-controls">
          <span className={`save-status ${saveStatus === 'All changes saved' ? 'saved' : 'unsaved'}`}>
            {saveStatus}
          </span>
          <button onClick={handleSave} className="btn-save">
            Save Now
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start typing your group notes here..."
        className="notes-textarea"
      />
    </div>
  );
}
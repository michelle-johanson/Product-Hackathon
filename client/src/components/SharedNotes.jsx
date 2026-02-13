import { useState, useEffect, useRef } from 'react';

export default function SharedNotes({ groupId, socket, refreshFiles }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('All changes saved');
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState('');

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

  // 3. Autosave Logic (Debounce 2s)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) {
        handleAutosave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [content]);

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

  // Internal Autosave
  const handleAutosave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/notes/${groupId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSaveStatus(`Autosaved at ${time}`);
      }
    } catch (err) {
      console.error("Autosave failed", err);
    }
  };

  const openSaveModal = () => {
    if (!content.trim()) return;
    const dateStr = new Date().toISOString().split('T')[0];
    setFileName(`Notes-${dateStr}`);
    setShowModal(true);
  };

  // "Save as Context" Workflow
  const handleSaveAsContext = async () => {
    setShowModal(false);
    setSaveStatus('Saving as context...');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/files/from-notes/${groupId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content, fileName })
      });

      if (res.ok) {
        setContent(''); // Clear notes
        if (refreshFiles) refreshFiles(); // Refresh file list
        setSaveStatus('Saved as context & cleared');
        
        // Broadcast clear to other users
        if (socket?.readyState === 1) {
          socket.send(JSON.stringify({
            type: 'note_update',
            groupId: parseInt(groupId),
            content: ''
          }));
        }
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
          <span className={`save-status ${saveStatus.includes('Autosaved') ? 'autosaved' : saveStatus === 'All changes saved' ? 'saved' : 'unsaved'}`}>
            {saveStatus}
          </span>
          <button onClick={openSaveModal} className="btn-save-context">
            Save as Context
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start typing your group notes here..."
        className="notes-textarea"
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', height: 'auto' }}>
            <h3 className="modal-title">Name your file</h3>
            <input
              type="text"
              className="form-input"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name..."
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveAsContext}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
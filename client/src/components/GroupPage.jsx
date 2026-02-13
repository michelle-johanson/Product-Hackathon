import { useState, useEffect } from 'react';
import ChatComponent from './ChatComponent';
import SharedNotes from './SharedNotes';
import AiChatComponent from './AiChatComponent';
import FileSection from './FileSection';

export default function GroupPage({ group, socket, user, refreshGroups }) {
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('classinfo'); 
  const [chatMode, setChatMode] = useState('group'); 
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editClassName, setEditClassName] = useState('');

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 250 && newWidth <= window.innerWidth * 0.75) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.cursor = 'default';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!group?.id) return;
    const fetchGroupDetails = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:3000/api/groups/${group.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setGroupDetails(await res.json());
      } catch (err) {
        console.error("Failed to fetch group details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [group?.id]);

  const copyToClipboard = () => {
    if (groupDetails?.inviteCode) {
      navigator.clipboard.writeText(groupDetails.inviteCode);
    }
  };

  const handleEditClick = () => {
    setEditName(groupDetails.name);
    setEditClassName(groupDetails.className);
    setShowEditModal(true);
  };

  const handleSaveGroup = async () => {
    if (!editName.trim() || !editClassName.trim()) return;
    
    const token = localStorage.getItem('token');
    try {
      // FIX: Changed 'PUT' to 'PATCH' to match your backend route
      const res = await fetch(`http://localhost:3000/api/groups/${group.id}`, {
        method: 'PATCH', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName, className: editClassName })
      });

      if (res.ok) {
        const updatedGroup = await res.json();
        setGroupDetails(prev => ({ ...prev, name: updatedGroup.name, className: updatedGroup.className }));
        refreshGroups(); // Update sidebar
        setShowEditModal(false);
      } else {
        alert('Failed to update group');
      }
    } catch (err) {
      console.error('Update error', err);
      alert('Error updating group');
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/groups/${group.id}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        refreshGroups();
        // The parent component will handle redirecting since group is now null/gone
        window.location.reload(); // Simple refresh to clear state if needed
      } else {
        alert('Failed to leave group');
      }
    } catch (err) {
      console.error('Leave error', err);
    }
  };

  if (loading || !groupDetails) return <div className="p-6">Loading group info...</div>;

  return (
    <div className={`group-page-layout ${isResizing ? 'resizing' : ''}`}>
      {/* MAIN CONTENT AREA */}
      <div className="main-content-area">
        <div className="main-content-inner">
          <h1 className="group-title">{groupDetails.name}</h1>
          <p className="group-subtitle">Course: {groupDetails.className}</p>

          <div className="tab-navigation-wrapper">
            <button 
              onClick={() => setCurrentTab('classinfo')} 
              className={`tab-btn ${currentTab === 'classinfo' ? 'active' : ''}`}
            >
              Class Info
            </button>
            <button 
              onClick={() => setCurrentTab('notes')} 
              className={`tab-btn ${currentTab === 'notes' ? 'active' : ''}`}
            >
              Notes
            </button>
            <button 
              onClick={() => setCurrentTab('files')} 
              className={`tab-btn ${currentTab === 'files' ? 'active' : ''}`}
            >
              Files
            </button>
          </div>

          <div className="tab-content-container">
            {currentTab === 'classinfo' && (
              <div className="info-tab-container">
                <div className="invite-section">
                  <div className="invite-pill-container">
                    <span className="invite-label">Invite Code:</span>
                    <span>{groupDetails.inviteCode}</span>
                    <button className="copy-icon-btn" onClick={copyToClipboard} title="Copy Code">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="bus-card">
                  <div className="bus-members-section">
                    <p className="bus-label">On This Bus</p>
                    {groupDetails.members?.map(m => (
                      <div key={m.user?.id} className="member-pill">
                        {m.user?.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="group-actions-footer">
                  <button className="btn-action-yellow" onClick={handleEditClick}>Edit Group</button>
                  <button className="btn-action-yellow" onClick={handleLeaveGroup} style={{ backgroundColor: '#ffe8e8', color: '#c0392b' }}>Leave Group</button>
                </div>
              </div>
            )}

            {currentTab === 'notes' && <SharedNotes groupId={group.id} socket={socket} />}
            {currentTab === 'files' && <FileSection groupId={group.id} />}
          </div>
        </div>
      </div>

      {/* RESIZER HANDLE */}
      <div className="resizer-handle" onMouseDown={startResizing} />

      {/* RIGHT PANEL */}
      <div className="right-chat-panel" style={{ width: sidebarWidth }}>
        <div className="chat-panel-header">
          <div className="chat-toggle-pill">
            <button 
              className={`toggle-segment ${chatMode === 'group' ? 'active' : ''}`}
              onClick={() => setChatMode('group')}
            >
              Chat
            </button>
            <button 
              className={`toggle-segment ${chatMode === 'ai' ? 'active' : ''}`}
              onClick={() => setChatMode('ai')}
            >
              AI Chat
            </button>
          </div>
        </div>

        <div className="chat-panel-body">
          <div className="chat-messages-wrapper">
             {chatMode === 'group' ? (
               <ChatComponent groupId={group.id} socket={socket} user={user} />
            ) : (
              <AiChatComponent groupId={group.id} user={user} />
            )}
          </div>
        </div>
      </div>

      {/* EDIT GROUP MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Edit Group Details</h3>
            <input 
              className="form-input" 
              value={editName} 
              onChange={e => setEditName(e.target.value)} 
              placeholder="Group Name" 
            />
            <input 
              className="form-input" 
              value={editClassName} 
              onChange={e => setEditClassName(e.target.value)} 
              placeholder="Course Name" 
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveGroup}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import ChatComponent from './ChatComponent';
import SharedNotes from './SharedNotes';
import AiChatComponent from './AiChatComponent';

export default function GroupPage({ group, onBack, socket, user, refreshGroups }) {
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('classinfo');
  const [chatMode, setChatMode] = useState('group'); // 'group' or 'ai'
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const resize = (e) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 250 && newWidth <= window.innerWidth * 0.5) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const stopResizing = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  useEffect(() => {
    if (!group || !group.id) return;

    const fetchGroupDetails = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:3000/api/groups/${group.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGroupDetails(data);
        }
      } catch (err) {
        console.error("Failed to fetch group details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [group?.id]);

  useEffect(() => {
    if (groupDetails) {
      setEditName(groupDetails.name);
      setEditClassName(groupDetails.className);
    }
  }, [groupDetails]);

  const handleUpdateGroup = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name: editName, className: editClassName })
      });

      if (res.ok) {
        const updated = await res.json();
        setGroupDetails(prev => ({ ...prev, name: updated.name, className: updated.className }));
        if (refreshGroups) refreshGroups();
        setIsEditing(false);
      } else {
        alert("Failed to update group.");
      }
    } catch (err) {
      console.error("Error updating group:", err);
      alert("Network error.");
    }
  };

  const handleLeaveGroup = async () => {
    const confirmed = window.confirm("Are you sure you want to leave this group? If you are the last member, the group and all notes will be permanently deleted.");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/groups/${group.id}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        if (refreshGroups) refreshGroups();
        onBack();
      } else {
        alert("Failed to leave group. Please try again.");
      }
    } catch (err) {
      console.error("Error leaving group:", err);
      alert("Network error occurred.");
    }
  };

  if (!group) return <div className="p-6">No group selected.</div>;
  if (loading) return <div className="p-6">Loading group info...</div>;
  if (!groupDetails) return <div className="p-6">Failed to load group.</div>;

  return (
    <div className="group-page-container group-page-full">
      {/* Center Content Area */}
      <div className="center-content center-content-padded">
        <div className="card group-header-card">
          {isEditing ? (
            <div className="edit-form">
              <input 
                className="form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Group Name"
              />
              <input 
                className="form-input"
                value={editClassName}
                onChange={(e) => setEditClassName(e.target.value)}
                placeholder="Class Name"
              />
            </div>
          ) : (
            <>
              <h2 className="group-title">{groupDetails.name}</h2>
              <p className="group-subtitle">Class: {groupDetails.className}</p>
            </>
          )}
        </div>

        {/* Tab Navigation - Members and Notes only */}
        <div className="tab-navigation">
          <button onClick={() => setCurrentTab('classinfo')} className={`tab-btn ${currentTab === 'classinfo' ? 'active' : ''}`}>Class Info</button>
          <button onClick={() => setCurrentTab('notes')} className={`tab-btn ${currentTab === 'notes' ? 'active' : ''}`}>Notes</button>
        </div>

        {/* Tab Content */}
        {currentTab === 'classinfo' && (
          <div className="card">
            <h3 className="members-heading">Members ({groupDetails.members?.length || 0})</h3>
            <div className="invite-code-display">
              Invite Code: <strong className="invite-code">{groupDetails.inviteCode}</strong>
            </div>
            <div className="members-list">
              {groupDetails.members?.map((member) => (
                <div key={member.id} className="member-item">
                  <div className="member-avatar">
                    {member.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="member-name">{member.user?.name}</div>
                    <div className="member-email">{member.user?.email}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="group-actions">
              {isEditing ? (
                <>
                  <button className="btn-save-green" onClick={handleUpdateGroup}>
                    Save
                  </button>
                  <button
                    className="btn-cancel-gray"
                    onClick={() => { setIsEditing(false); setEditName(groupDetails.name); setEditClassName(groupDetails.className); }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-edit-blue" onClick={() => setIsEditing(true)}>
                    Edit Group
                  </button>
                  <button className="btn-leave-red" onClick={handleLeaveGroup}>
                    Leave Group
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {currentTab === 'notes' && (
          <SharedNotes groupId={group.id} socket={socket} />
        )}
      </div>

      {/* Resizer Handle */}
      <div 
        className="resizer-handle" 
        onMouseDown={startResizing}
      />

      {/* Right Panel - Chat Area */}
      <div className="right-panel" style={{ width: sidebarWidth }}>
        {/* Toggle System */}
        <div className="chat-toggle-container">
          <button onClick={() => setChatMode('group')} className={`chat-toggle-btn ${chatMode === 'group' ? 'active' : ''}`}>
            Group Chat
          </button>
          <button onClick={() => setChatMode('ai')} className={`chat-toggle-btn ${chatMode === 'ai' ? 'active' : ''}`}>
            AI Chat
          </button>
        </div>

        {/* Chat Content */}
        <div className="chat-content-wrapper">
          {chatMode === 'group' ? (
            <ChatComponent groupId={group.id} socket={socket} user={user} />
          ) : (
            <AiChatComponent />
          )}
        </div>
      </div>
    </div>
  );
}
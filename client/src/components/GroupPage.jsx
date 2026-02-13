import { useState, useEffect } from 'react';
import ChatComponent from './ChatComponent';
import SharedNotes from './SharedNotes';
import AiChatComponent from './AiChatComponent';
import FileSection from './FileSection';

export default function GroupPage({ group, onBack, socket, user, refreshGroups }) {
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('classinfo'); 
  const [chatMode, setChatMode] = useState('group'); 
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = () => setIsResizing(true);

  useEffect(() => {
    const resize = (e) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 300 && newWidth <= window.innerWidth * 0.6) {
          setSidebarWidth(newWidth);
        }
      }
    };
    const stopResizing = () => setIsResizing(false);
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

  if (loading || !groupDetails) return <div className="p-6">Loading group info...</div>;

  const memberList = groupDetails.members?.map(m => m.user?.name).join(', ') || '';

  return (
    <div className="group-page-container">
      {/* Center Content Area */}
      <div className="center-content-padded">
        <h1 className="group-title" style={{ marginBottom: '5px' }}>{groupDetails.name}</h1>
        <p className="group-subtitle" style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.8 }}>
          {groupDetails.className}
        </p>

        {/* Pill Tab Navigation */}
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

        {/* Tab Content */}
        <div className="tab-content-area">
          {currentTab === 'classinfo' && (
            <div className="msg-bubble light large-rect" style={{ width: '100%', maxWidth: 'none', minHeight: '300px' }}>
               <h3 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>Group Members</h3>
               <p style={{ marginBottom: '20px', fontStyle: 'italic' }}>On this Bus: {memberList}</p>
               
               <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,0,0,0.05)', borderRadius: '15px' }}>
                 <p>Invite Code: <strong style={{ letterSpacing: '2px' }}>{groupDetails.inviteCode}</strong></p>
               </div>
            </div>
          )}

          {currentTab === 'notes' && (
            <SharedNotes groupId={group.id} socket={socket} />
          )}

          {currentTab === 'files' && (
            <FileSection groupId={group.id} />
          )}
        </div>
      </div>

      {/* Resizer Handle */}
      <div className="resizer-handle" onMouseDown={startResizing} />

      {/* Right Panel - Chat Area */}
      <div className="right-panel" style={{ width: sidebarWidth }}>
        <div className="chat-header-toggle">
          <span className="panel-close-arrow">›</span>
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

        <div className="chat-timestamp-header">
          Friday, February 13, 9:10 AM
        </div>

        <div className="chat-history-container">
          {chatMode === 'group' ? (
             <ChatComponent groupId={group.id} socket={socket} user={user} />
          ) : (
            <AiChatComponent groupId={group.id} user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
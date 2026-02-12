import { useState, useEffect } from 'react';
import ChatComponent from './ChatComponent';
import SharedNotes from './SharedNotes';
import AiChatComponent from './AiChatComponent';

export default function GroupPage({ group, onBack, socket, user }) {
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('classinfo');
  const [chatMode, setChatMode] = useState('group'); // 'group' or 'ai'

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

  if (!group) return <div className="p-6">No group selected.</div>;
  if (loading) return <div className="p-6">Loading group info...</div>;
  if (!groupDetails) return <div className="p-6">Failed to load group.</div>;

  return (
    <div className="group-page-container">
      {/* Center Content Area */}
      <div className="center-content">
        <div className="card group-header-card">
          <h2 className="group-title">{groupDetails.name}</h2>
          <p className="group-subtitle">Class: {groupDetails.className}</p>
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
          </div>
        )}

        {currentTab === 'notes' && (
          <SharedNotes groupId={group.id} socket={socket} />
        )}
      </div>

      {/* Right Panel - Chat Area */}
      <div className="right-panel">
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
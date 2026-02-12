import { useState, useEffect } from 'react';
import ChatComponent from './ChatComponent';
import SharedNotes from './SharedNotes';
import AiChatComponent from './AiChatComponent';

export default function GroupPage({ group, onBack, socket, user }) {
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('members');
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

  const tabStyle = (tabName) => ({
    padding: '12px 20px',
    background: currentTab === tabName ? '#3498db' : 'transparent',
    color: currentTab === tabName ? 'white' : '#666',
    border: 'none',
    borderBottom: currentTab === tabName ? '3px solid #3498db' : 'none',
    fontWeight: currentTab === tabName ? 'bold' : 'normal',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s'
  });

  const toggleButtonStyle = (mode) => ({
    flex: 1,
    padding: '10px 15px',
    background: chatMode === mode ? '#3498db' : '#f4f4f9',
    color: chatMode === mode ? 'white' : '#666',
    border: 'none',
    cursor: 'pointer',
    fontWeight: chatMode === mode ? 'bold' : 'normal',
    transition: 'all 0.2s',
    fontSize: '0.95rem'
  });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
      {/* Center Content Area */}
      <div className="center-content">
        <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '20px' }}>
          ← Back to Dashboard
        </button>

        <div className="card" style={{ marginBottom: '20px', borderTop: '5px solid #3498db' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '5px' }}>{groupDetails.name}</h2>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '15px' }}>Class: {groupDetails.className}</p>
          <div style={{ background: '#f4f4f9', padding: '10px', borderRadius: '5px', display: 'inline-block' }}>
            Share Invite Code: <strong style={{ letterSpacing: '2px', fontSize: '1.2rem' }}>{groupDetails.inviteCode}</strong>
          </div>
        </div>

        {/* Tab Navigation - Members and Notes only */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
          <button onClick={() => setCurrentTab('members')} style={tabStyle('members')}>Members</button>
          <button onClick={() => setCurrentTab('notes')} style={tabStyle('notes')}>Notes</button>
        </div>

        {/* Tab Content */}
        {currentTab === 'members' && (
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>Team Members ({groupDetails.members?.length || 0})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {groupDetails.members?.map((member) => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: '#f9f9fc', borderRadius: '5px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#2c3e50', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {member.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{member.user?.name}</div>
                    <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>{member.user?.email}</div>
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
        <div style={{ display: 'flex', padding: '15px', borderBottom: '1px solid #ddd' }}>
          <button onClick={() => setChatMode('group')} style={toggleButtonStyle('group')}>
            Group Chat
          </button>
          <button onClick={() => setChatMode('ai')} style={toggleButtonStyle('ai')}>
            AI Chat
          </button>
        </div>

        {/* Chat Content */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
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
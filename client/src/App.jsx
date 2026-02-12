import React, { useState, useEffect } from 'react';
import GroupPage from './components/GroupPage';

// --- AccountSettings Component ---
const AccountSettings = ({ user, onLogout, onDeleteAccount, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    const success = await onUpdateProfile(editName, editEmail);
    if (success) {
      setIsEditing(false);
    } else {
      setError('Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action is permanent and will:\n\n' +
      '• Delete all your groups if you are the last member\n' +
      '• Remove all your messages and notes\n' +
      '• Cannot be undone\n\n' +
      'Type "DELETE" in the next prompt to confirm.'
    );

    if (!confirmed) return;

    const confirmation = prompt('Type DELETE to confirm account deletion:');
    if (confirmation === 'DELETE') {
      await onDeleteAccount();
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-heading">Account Settings</h2>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px' }}>Profile Information</h3>
        {error && <p className="auth-error">{error}</p>}

        {isEditing ? (
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="btn-create" style={{ flex: 1 }}>
                Save Changes
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setIsEditing(false);
                  setEditName(user.name);
                  setEditEmail(user.email);
                  setError('');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Name</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{user.name}</div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Email</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{user.email}</div>
            </div>
            <button
              className="btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      <div className="card" style={{ borderTop: '3px solid #e74c3c' }}>
        <h3 style={{ marginBottom: '15px', color: '#e74c3c' }}>Danger Zone</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="layout-logout-btn"
            onClick={onLogout}
            style={{
              padding: '10px 20px',
              justifyContent: 'center',
              border: '1px solid #ff6b6b',
              borderRadius: '5px'
            }}
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
          <button
            onClick={handleDeleteAccount}
            style={{
              padding: '10px 20px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <span>🗑️</span>
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Layout Component ---
const Layout = ({ children, user, groups, currentGroup, onSelectGroup, onOpenCreateModal, onOpenJoinModal, onNavigateSettings }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout-container">
      <aside className={`layout-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="layout-sidebar-header">
          {sidebarOpen && <span>StudyApp</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="layout-toggle-btn">
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="layout-nav">
          <div onClick={onNavigateSettings} className={`sidebar-link ${currentGroup === 'settings' ? 'active' : ''}`}>
            {sidebarOpen ? '⚙️ Settings' : '⚙️'}
          </div>

          {sidebarOpen && (
            <div className="nav-section-label">
              My Groups
            </div>
          )}

          {groups.map(g => (
            <div key={g.id} onClick={() => onSelectGroup(g)} title={g.name} className={`sidebar-link ${currentGroup?.id === g.id ? 'active' : ''}`}>
              {sidebarOpen ? `📚 ${g.name}` : '📚'}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '20px', borderTop: '1px solid #34495e' }}>
          <button
            onClick={onOpenCreateModal}
            className="sidebar-link"
            style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', background: '#27ae60', color: 'white' }}
          >
            {sidebarOpen ? '+ Create Group' : '+'}
          </button>
          <button
            onClick={onOpenJoinModal}
            className="sidebar-link"
            style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', background: '#3498db', color: 'white' }}
          >
            {sidebarOpen ? '🔗 Join Group' : '🔗'}
          </button>
        </div>
      </aside>

      <div className="layout-main">
        <header className="layout-header">
          <h2 className="layout-header-title">Welcome, {user.name}!</h2>
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </header>

        <main className="layout-content" style={{ padding: 0, margin: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="form-container" style={{ maxWidth: '500px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
        <h2 style={{ marginBottom: '20px' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // App State
  const [isSignup, setIsSignup] = useState(false);
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [className, setClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 1. Check for existing token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // 2. WebSocket Connection
  useEffect(() => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const socket = new WebSocket(`ws://localhost:3000?token=${token}`);

      socket.onopen = () => {
        console.log('✅ Connected to WebSocket!');
        setSocket(socket);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('WebSocket closed');
        setSocket(null);
      };

      return () => {
        if (socket.readyState === 1) {
          socket.close();
        }
      };
    } catch (e) {
      console.warn('Could not establish WebSocket connection.');
    }
  }, [user]);

  // 3. Fetch Groups
  const fetchGroups = async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error("Failed to fetch groups");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  // 4. Handle Auth Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isSignup ? 'http://localhost:3000/api/auth/signup' : 'http://localhost:3000/api/auth/login';
    const payload = isSignup ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Server error. Is the backend running?");
    }
  };

  // Handle Create Group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: groupName, className })
      });
      if (res.ok) {
        await fetchGroups();
        setShowCreateModal(false);
        setGroupName('');
        setClassName('');
      }
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  // Handle Join Group
  const handleJoinGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ inviteCode: joinCode })
      });
      if (res.ok) {
        await fetchGroups();
        setShowJoinModal(false);
        setJoinCode('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to join group');
      }
    } catch (err) {
      console.error("Error joining group:", err);
    }
  };

  // Handle Update Profile
  const handleUpdateProfile = async (newName, newEmail) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName, email: newEmail })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      return false;
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/api/auth/me', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        localStorage.removeItem('token');
        setUser(null);
        setGroups([]);
        setCurrentGroup(null);
        alert('Your account has been deleted successfully.');
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert('Network error occurred.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setGroups([]);
    setCurrentGroup(null);
  };

  if (loading) return <h1 className="loading-container">Loading...</h1>;

  if (user) {
    return (
      <>
        <Layout
          user={user}
          groups={groups}
          currentGroup={currentGroup}
          onSelectGroup={setCurrentGroup}
          onOpenCreateModal={() => setShowCreateModal(true)}
          onOpenJoinModal={() => setShowJoinModal(true)}
          onNavigateSettings={() => setCurrentGroup('settings')}
        >
          {currentGroup === 'settings' ? (
            <AccountSettings
              user={user}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onUpdateProfile={handleUpdateProfile}
            />
          ) : currentGroup ? (
            <GroupPage
              group={currentGroup}
              onBack={() => setCurrentGroup('settings')}
              socket={socket}
              user={user}
              refreshGroups={fetchGroups}
            />
          ) : (
            <AccountSettings
              user={user}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </Layout>

        {/* Create Group Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setGroupName('');
            setClassName('');
          }}
          title="Create a New Group"
        >
          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <label className="form-label">Group Name</label>
              <input
                className="form-input"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                required
                placeholder="e.g., Study Group 1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class Name</label>
              <input
                className="form-input"
                value={className}
                onChange={e => setClassName(e.target.value)}
                required
                placeholder="e.g., CS 101"
              />
            </div>
            <button type="submit" className="btn-create">
              Create Group
            </button>
          </form>
        </Modal>

        {/* Join Group Modal */}
        <Modal
          isOpen={showJoinModal}
          onClose={() => {
            setShowJoinModal(false);
            setJoinCode('');
          }}
          title="Join Existing Group"
        >
          <form onSubmit={handleJoinGroup}>
            <div className="form-group">
              <label className="form-label">Enter Invite Code</label>
              <input
                className="form-input"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                required
                placeholder="e.g., x7z9q2"
              />
            </div>
            <button type="submit" className="btn-join">
              Join Group
            </button>
          </form>
        </Modal>
      </>
    );
  }

  return (
    <div className="auth-container">
      <h1>{isSignup ? "Create Account" : "Please Log In"}</h1>
      {error && <p className="auth-error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        {isSignup && (<input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="auth-input" />)}
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="auth-input" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="auth-input" />
        <button type="submit" className="auth-submit-btn">{isSignup ? "Sign Up" : "Log In"}</button>
      </form>
      <p className="auth-toggle">{isSignup ? "Already have an account?" : "Need an account?"} <button onClick={() => { setIsSignup(!isSignup); setError(''); }} className="auth-toggle-btn">{isSignup ? "Log In" : "Sign Up"}</button></p>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import GroupPage from './components/GroupPage';
import struggleBusLogo from './assets/StruggleBusLogo.png';

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

      <div className="card settings-section">
        <h3 className="settings-field">Profile Information</h3>
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
            <div className="button-group-mt">
              <button type="submit" className="btn-create btn-flex-full">
                Save Changes
              </button>
              <button
                type="button"
                className="btn-secondary btn-flex-full"
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
            <div className="settings-field">
              <div className="settings-label">Name</div>
              <div className="settings-value">{user.name}</div>
            </div>
            <div className="settings-field">
              <div className="settings-label">Email</div>
              <div className="settings-value">{user.email}</div>
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

      <div className="card danger-zone-card">
        <h3 className="danger-zone-heading">Danger Zone</h3>
        <div className="danger-zone-actions">
          <button className="btn-logout-settings" onClick={onLogout}>
            <span>🚪</span>
            <span>Log Out</span>
          </button>
          <button className="btn-delete-account" onClick={handleDeleteAccount}>
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

        <div className="sidebar-action-buttons">
          <button onClick={onOpenCreateModal} className="sidebar-create-btn">
            {sidebarOpen ? '+ Create Group' : '+'}
          </button>
          <button onClick={onOpenJoinModal} className="sidebar-join-btn">
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

        <main className={currentGroup && currentGroup !== 'settings' ? 'layout-content-flush' : 'layout-content'}>
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
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">{title}</h2>
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
      <div className="auth-card">
        {/* Logo Section - Now using the imported variable */}
        <div className="logo-wrapper">
          <img 
            src={struggleBusLogo} 
            alt="Struggle Bus" 
            className="auth-logo" 
          />
        </div>

        <h1 className="auth-heading">
          {isSignup ? "Create Account" : "Login"}
        </h1>

        {error && <div className="auth-error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <input
              className="auth-input"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            className="auth-input"
            placeholder="Enter Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="auth-submit-btn" type="submit">
            {isSignup ? "Sign up" : "Sign in"}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignup ? "Already have an account?" : "Need an account?"}
            <button 
              className="auth-toggle-btn"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
            >
              {isSignup ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );

}
import React, { useState, useEffect } from 'react';
import GroupPage from './components/GroupPage';

// --- Dashboard Component ---
const Dashboard = ({ user, groups, refreshGroups }) => {
  const [view, setView] = useState('menu');
  const [groupName, setGroupName] = useState('');
  const [className, setClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');

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
        refreshGroups();
        setView('menu');
        setGroupName('');
        setClassName('');
      }
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

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
        refreshGroups();
        setView('menu');
        setJoinCode('');
      }
    } catch (err) {
      console.error("Error joining group:", err);
    }
  };

  if (view === 'menu') {
    return (
      <div className="dashboard-container">
        <h2 className="dashboard-heading">Dashboard Overview</h2>
        <div className="dashboard-grid">
          <button onClick={() => setView('add_group')} className="add-group-btn">
            <span className="add-group-icon">+</span>
            <span className="add-group-text">Create or Join a Group</span>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'add_group') {
    return (
      <div className="form-container">
        <button onClick={() => setView('menu')} className="back-button">← Back</button>
        <div className="form-section">
          <h2>Create a New Group</h2>
          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <label className="form-label">Group Name</label>
              <input className="form-input" value={groupName} onChange={e => setGroupName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Class Name</label>
              <input className="form-input" value={className} onChange={e => setClassName(e.target.value)} required />
            </div>
            <button type="submit" className="btn-create">Create Group</button>
          </form>
        </div>
        <hr className="form-divider" />
        <div className="form-section">
          <h2>OR Join Existing Group</h2>
          <form onSubmit={handleJoinGroup}>
            <div className="form-group">
              <label className="form-label">Enter Invite Code</label>
              <input className="form-input" placeholder="e.g. x7z9q2" value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
            </div>
            <button type="submit" className="btn-join">Join Group</button>
          </form>
        </div>
      </div>
    );
  }
};

// --- Layout Component ---
const Layout = ({ children, user, onLogout, groups, currentGroup, onSelectGroup }) => {
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
          <div onClick={() => onSelectGroup(null)} className={`sidebar-link ${!currentGroup ? 'active' : ''}`}>
            {sidebarOpen ? '🏠 Dashboard' : '🏠'}
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

        <button onClick={onLogout} className="layout-logout-btn">
          <span>🚪</span>
          {sidebarOpen && <span>Log Out</span>}
        </button>
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

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // App State
  const [isSignup, setIsSignup] = useState(false);
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null); 

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setGroups([]);
    setCurrentGroup(null);
  };

  if (loading) return <h1 className="loading-container">Loading...</h1>;

  if (user) {
    return (
      <Layout
        user={user}
        onLogout={handleLogout}
        groups={groups}
        currentGroup={currentGroup}
        onSelectGroup={setCurrentGroup}
      >
        {currentGroup ? (
          <GroupPage
            group={currentGroup}
            onBack={() => setCurrentGroup(null)}
            socket={socket}
            user={user}
            refreshGroups={fetchGroups}
          />
        ) : (
          <Dashboard
            user={user}
            groups={groups}
            refreshGroups={fetchGroups}
          />
        )}
      </Layout>
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
import React, { useState, useEffect } from 'react';
import GroupPage from './components/GroupPage';
import struggleBusLogo from './assets/StruggleBusLogo.png';

// Import your new SVG icons
import busIcon from './assets/bus_icon.svg';
import accountIcon from './assets/account_icon.svg';
import addIcon from './assets/add_icon.svg';

// --- Management View ---
const GroupManagement = ({ 
  groupName, setGroupName, className, setClassName, handleCreateGroup,
  joinCode, setJoinCode, handleJoinGroup 
}) => {
  return (
    <div className="group-mgmt-container">
      <div className="mgmt-section">
        <h2 className="mgmt-heading">Create Group</h2>
        <form onSubmit={handleCreateGroup} className="mgmt-form">
          <input
            className="mgmt-input"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            required
            placeholder="New Group Name"
          />
          <input
            className="mgmt-input"
            value={className}
            onChange={e => setClassName(e.target.value)}
            required
            placeholder="Course Name"
          />
          <button type="submit" className="mgmt-submit-btn">
            Create Group
          </button>
        </form>
      </div>

      <hr className="mgmt-divider" />

      <div className="mgmt-section">
        <h2 className="mgmt-heading">Join Group</h2>
        <form onSubmit={handleJoinGroup} className="mgmt-form">
          <input
            className="mgmt-input"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            required
            placeholder="Join Code"
          />
          <button type="submit" className="mgmt-submit-btn">
            Join Group
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Updated Layout Component with SVG Icons ---
const Layout = ({ children, user, groups, currentGroup, onSelectGroup, onNavigateMgmt, onNavigateSettings }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout-container">
      <aside className={`layout-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="layout-sidebar-header" style={{ justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
          {sidebarOpen && (
            <span style={{ fontFamily: 'var(--font-sidebar)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {user.name}
            </span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="layout-toggle-btn">
            ‹
          </button>
        </div>

        <nav className="layout-nav">
          {groups.map(g => (
            <div 
              key={g.id} 
              onClick={() => onSelectGroup(g)} 
              className={`sidebar-link ${currentGroup?.id === g.id ? 'active' : ''}`}
            >
              <span className="link-text">{g.name}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-action-buttons">
          <button onClick={() => onSelectGroup(null)} className="sidebar-circle-btn" title="Home/Dashboard">
            <img src={busIcon} alt="Bus" className="sidebar-icon-img" />
          </button>
          <button onClick={onNavigateSettings} className="sidebar-circle-btn" title="Settings">
            <img src={accountIcon} alt="Account" className="sidebar-icon-img" />
          </button>
          <button onClick={onNavigateMgmt} className="sidebar-circle-btn" title="Create or Join Group">
            <img src={addIcon} alt="Add" className="sidebar-icon-img" />
          </button>
        </div>
      </aside>

      <div className="layout-main">
        <main className="layout-content-flush">
          {children}
        </main>
      </div>
    </div>
  );
};

const AccountSettings = ({ user, onLogout, onDeleteAccount }) => {
  return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <h2 className="mgmt-heading">Account Settings</h2>
      <div className="mgmt-form" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}><strong>User:</strong> {user.name}</p>
        <p style={{ color: '#666', marginBottom: '30px' }}>{user.email}</p>
        <button className="mgmt-submit-btn" onClick={onLogout}>Log Out</button>
        <button className="mgmt-submit-btn" style={{ background: '#e74c3c', color: 'white' }} onClick={onDeleteAccount}>Delete Account</button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [view, setView] = useState('dashboard');

  const [groupName, setGroupName] = useState('');
  const [className, setClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const ws = new WebSocket(`ws://localhost:3000?token=${token}`);
      ws.onopen = () => setSocket(ws);
      return () => ws.close();
    } catch (e) { console.warn('WS Connection failed'); }
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/groups', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setGroups(await res.json());
  };

  useEffect(() => { fetchGroups(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isSignup ? 'http://localhost:3000/api/auth/signup' : 'http://localhost:3000/api/auth/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isSignup ? { name, email, password } : { email, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } else {
      setError(data.error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: groupName, className })
    });
    if (res.ok) {
      await fetchGroups();
      setGroupName(''); setClassName('');
      setView('dashboard');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ inviteCode: joinCode })
    });
    if (res.ok) {
      await fetchGroups();
      setJoinCode('');
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <h1>Loading...</h1>;

  if (user) {
    return (
      <Layout 
        user={user} 
        groups={groups} 
        currentGroup={currentGroup}
        onSelectGroup={(g) => { setCurrentGroup(g); setView('dashboard'); }}
        onNavigateMgmt={() => { setView('mgmt'); setCurrentGroup(null); }}
        onNavigateSettings={() => { setView('settings'); setCurrentGroup(null); }}
      >
        {view === 'settings' ? (
          <AccountSettings user={user} onLogout={handleLogout} />
        ) : view === 'mgmt' ? (
          <GroupManagement 
            groupName={groupName} setGroupName={setGroupName}
            className={className} setClassName={setClassName}
            handleCreateGroup={handleCreateGroup}
            joinCode={joinCode} setJoinCode={setJoinCode}
            handleJoinGroup={handleJoinGroup}
          />
        ) : currentGroup ? (
          <GroupPage group={currentGroup} socket={socket} user={user} refreshGroups={fetchGroups} />
        ) : (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <h1 className="mgmt-heading">Welcome, {user.name}</h1>
            <p style={{ color: '#666' }}>Select a group or click + to start.</p>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-wrapper">
          <img src={struggleBusLogo} alt="Logo" className="auth-logo" />
        </div>
        <h1 className="auth-heading">{isSignup ? "Create Account" : "Login"}</h1>
        {error && <div className="auth-error-box">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && <input className="auth-input" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />}
          <input className="auth-input" placeholder="Enter Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="auth-submit-btn" type="submit">{isSignup ? "Sign up" : "Sign in"}</button>
        </form>
        <div className="auth-toggle">
          <button className="auth-toggle-btn" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
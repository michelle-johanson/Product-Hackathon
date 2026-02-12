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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>Dashboard Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <button 
            onClick={() => setView('add_group')}
            style={{ padding: '32px', border: '2px dashed #ccc', borderRadius: '12px', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
          >
            <span style={{ fontSize: '2rem' }}>+</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Create or Join a Group</span>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'add_group') {
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <button onClick={() => setView('menu')} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', marginBottom: '20px', padding: 0 }}>← Back</button>
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{marginTop: 0}}>Create a New Group</h2>
          <form onSubmit={handleCreateGroup}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{display: 'block', marginBottom: '5px'}}>Group Name</label>
              <input style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} value={groupName} onChange={e => setGroupName(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{display: 'block', marginBottom: '5px'}}>Class Name</label>
              <input style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} value={className} onChange={e => setClassName(e.target.value)} required />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>Create Group</button>
          </form>
        </div>
        <hr style={{border: 'none', borderTop: '1px solid #eee'}} />
        <div style={{ marginTop: '30px' }}>
          <h2>OR Join Existing Group</h2>
          <form onSubmit={handleJoinGroup}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{display: 'block', marginBottom: '5px'}}>Enter Invite Code</label>
              <input style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="e.g. x7z9q2" value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>Join Group</button>
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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif' }}>
      <aside style={{ width: sidebarOpen ? '250px' : '60px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px', transition: 'width 0.3s ease' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {sidebarOpen && <span>StudyApp</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: '1px solid #555', color: 'white', cursor: 'pointer', padding: '2px 8px', borderRadius: '4px' }}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <div onClick={() => onSelectGroup(null)} style={{ padding: '12px 15px', marginBottom: '5px', borderRadius: '6px', cursor: 'pointer', color: !currentGroup ? 'white' : '#bdc3c7', backgroundColor: !currentGroup ? '#3498db' : 'transparent', display: 'flex', gap: '10px', fontWeight: !currentGroup ? 'bold' : 'normal', transition: 'all 0.2s ease' }}>
            {sidebarOpen ? '🏠 Dashboard' : '🏠'}
          </div>

          {sidebarOpen && (
            <div style={{ margin: '25px 0 10px 10px', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              My Groups
            </div>
          )}

          {groups.map(g => (
            <div key={g.id} onClick={() => onSelectGroup(g)} title={g.name} style={{ padding: '12px 15px', marginBottom: '5px', borderRadius: '6px', cursor: 'pointer', color: currentGroup?.id === g.id ? 'white' : '#bdc3c7', backgroundColor: currentGroup?.id === g.id ? '#3498db' : 'transparent', display: 'flex', gap: '10px', fontWeight: currentGroup?.id === g.id ? 'bold' : 'normal', transition: 'all 0.2s ease', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sidebarOpen ? `📚 ${g.name}` : '📚'}
            </div>
          ))}
        </nav>

        <button onClick={onLogout} style={{ marginTop: 'auto', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🚪</span>
          {sidebarOpen && <span>Log Out</span>}
        </button>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ background: 'white', padding: '15px 30px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>{currentGroup ? currentGroup.name : `Welcome, ${user.name}`}</h2>
          <div style={{ width: '35px', height: '35px', background: '#3498db', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        </header>

        <main style={{ flex: 1, padding: '30px', overflow: 'hidden', color: '#333' }}>
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

  if (loading) return <h1 style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading...</h1>;

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
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', height: '100vh', color: '#333' }}>
      <h1>{isSignup ? "Create Account" : "Please Log In"}</h1>
      {error && <p style={{color: '#e74c3c'}}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {isSignup && (<input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}/>)}
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}/>
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}/>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{isSignup ? "Sign Up" : "Log In"}</button>
      </form>
      <p style={{ marginTop: '20px' }}>{isSignup ? "Already have an account?" : "Need an account?"} <button onClick={() => { setIsSignup(!isSignup); setError(''); }} style={{ background: 'none', border: 'none', color: '#3498db', textDecoration: 'underline', cursor: 'pointer', fontSize: '1rem' }}>{isSignup ? "Log In" : "Sign Up"}</button></p>
    </div>
  );
}
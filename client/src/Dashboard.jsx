import { useState, useEffect } from 'react';

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('menu'); // 'menu' | 'add_group' | 'view_groups'
  
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // CREATE Group State
  const [groupName, setGroupName] = useState('');
  const [className, setClassName] = useState('');

  // JOIN Group State (NEW!)
  const [joinCode, setJoinCode] = useState('');

  // --- API CALLS ---

  const fetchGroups = async () => {
    setLoadingGroups(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      alert("Failed to load groups");
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:3000/groups', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: groupName, className })
    });

    if (res.ok) {
      alert("Group Created Successfully!");
      setView('view_groups'); // Send them to the list to see it
      setGroupName('');
      setClassName('');
    } else {
      alert("Failed to create group");
    }
  };

  // NEW: Handle Joining
  const handleJoinGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:3000/groups/join', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ inviteCode: joinCode })
    });

    const data = await res.json();

    if (res.ok) {
      alert("You joined the group!");
      setView('view_groups'); // Send them to the list
      setJoinCode('');
    } else {
      alert(data.error); // Show "Invalid Code" or "Already Joined"
    }
  };

  // Load groups when view changes
  useEffect(() => {
    if (view === 'view_groups') {
      fetchGroups();
    }
  }, [view]);


  // --- VIEWS ---

  // 1. MENU
  if (view === 'menu') {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>Welcome, {user.name}!</h1>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
          <button 
            onClick={() => setView('add_group')}
            style={{ padding: '20px 40px', fontSize: '18px', cursor: 'pointer' }}
          >
            + Add / Join Group
          </button>

          <button 
            onClick={() => setView('view_groups')}
            style={{ padding: '20px 40px', fontSize: '18px', cursor: 'pointer' }}
          >
            View My Groups
          </button>
        </div>

        <br /><br />
        <button onClick={onLogout} style={{ color: 'red' }}>Log Out</button>
      </div>
    );
  }

  // 2. ADD / JOIN GROUP
  if (view === 'add_group') {
    return (
      <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
        <button onClick={() => setView('menu')}>← Back to Menu</button>
        
        {/* CREATE FORM */}
        <div style={{ marginBottom: '40px' }}>
          <h2>Create a New Group</h2>
          <form onSubmit={handleCreateGroup}>
            <div style={{ marginBottom: '15px' }}>
              <label>Group Name</label><br/>
              <input 
                style={{ width: '100%', padding: '8px' }}
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Class Name</label><br/>
              <input 
                style={{ width: '100%', padding: '8px' }}
                value={className}
                onChange={e => setClassName(e.target.value)}
                required
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
              Create Group
            </button>
          </form>
        </div>

        <hr />

        {/* JOIN FORM */}
        <div style={{ marginTop: '40px' }}>
          <h2>OR Join Existing Group</h2>
          <form onSubmit={handleJoinGroup}>
            <div style={{ marginBottom: '15px' }}>
              <label>Enter Invite Code</label><br/>
              <input 
                style={{ width: '100%', padding: '8px' }}
                placeholder="e.g. x7z9q2"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#008CBA', color: 'white', border: 'none', cursor: 'pointer' }}>
              Join Group
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. VIEW GROUPS
  if (view === 'view_groups') {
    return (
      <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => setView('menu')}>← Back to Menu</button>
        <h2>My Study Groups</h2>

        {loadingGroups ? (
          <p>Loading...</p>
        ) : groups.length === 0 ? (
          <p>You haven't joined any groups yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {groups.map(group => (
              <div 
                key={group.id}
                style={{ 
                  border: '1px solid #ccc', 
                  padding: '15px', 
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <h3 style={{ margin: '0 0 5px 0' }}>{group.name}</h3>
                <p style={{ margin: '0', color: '#666' }}>{group.className}</p>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#888' }}>
                  Members: {group._count.members} • Invite Code: <b style={{ background: '#eee', padding: '2px 5px' }}>{group.inviteCode}</b>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
import { useState, useEffect } from 'react';

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState('menu'); 
  
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // CREATE Group State
  const [groupName, setGroupName] = useState('');
  const [className, setClassName] = useState('');

  // JOIN Group State
  const [joinCode, setJoinCode] = useState('');

  // --- API CALLS ---

  const fetchGroups = async () => {
    setLoadingGroups(true);
    const token = localStorage.getItem('token');
    try {
      // UPDATED URL
      const res = await fetch('http://localhost:3000/api/groups', {
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

    // UPDATED URL
    const res = await fetch('http://localhost:3000/api/groups', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: groupName, className })
    });

    if (res.ok) {
      alert("Group Created Successfully!");
      setView('view_groups'); 
      setGroupName('');
      setClassName('');
    } else {
      alert("Failed to create group");
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // UPDATED URL
    const res = await fetch('http://localhost:3000/api/groups/join', {
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
      setView('view_groups'); 
      setJoinCode('');
    } else {
      alert(data.error); 
    }
  };

  // Load groups when view changes
  useEffect(() => {
    if (view === 'view_groups') {
      fetchGroups();
    }
  }, [view]);


  // --- VIEWS ---

if (view === 'menu') {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => setView('add_group')}
            className="p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-4 text-gray-600 hover:text-blue-600"
          >
            <span className="text-4xl">+</span>
            <span className="font-semibold text-lg">Create or Join a Group</span>
          </button>

          <button 
            onClick={() => setView('view_groups')}
            className="p-8 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all bg-white flex flex-col items-center gap-4 text-gray-800"
          >
            <span className="text-4xl">📚</span>
            <span className="font-semibold text-lg">View My Groups</span>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'add_group') {
    return (
      <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
        <button onClick={() => setView('menu')}>← Back to Menu</button>
        
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
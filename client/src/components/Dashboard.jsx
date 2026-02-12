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
      <div className="dashboard-form-centered">
        <button className="back-button" onClick={() => setView('menu')}>← Back to Menu</button>

        <div className="dashboard-section">
          <h2>Create a New Group</h2>
          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <label className="form-label">Group Name</label>
              <input
                className="form-input"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class Name</label>
              <input
                className="form-input"
                value={className}
                onChange={e => setClassName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-save-green">
              Create Group
            </button>
          </form>
        </div>

        <hr className="form-divider" />

        <div className="dashboard-section-gap">
          <h2>OR Join Existing Group</h2>
          <form onSubmit={handleJoinGroup}>
            <div className="form-group">
              <label className="form-label">Enter Invite Code</label>
              <input
                className="form-input"
                placeholder="e.g. x7z9q2"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-join">
              Join Group
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'view_groups') {
    return (
      <div className="group-list-centered">
        <button className="back-button" onClick={() => setView('menu')}>← Back to Menu</button>
        <h2>My Study Groups</h2>

        {loadingGroups ? (
          <p>Loading...</p>
        ) : groups.length === 0 ? (
          <p>You haven't joined any groups yet.</p>
        ) : (
          <div className="group-grid">
            {groups.map(group => (
              <div key={group.id} className="group-card">
                <h3 className="group-card-title">{group.name}</h3>
                <p className="group-card-subtitle">{group.className}</p>
                <div className="group-card-meta">
                  Members: {group._count.members} • Invite Code: <b className="invite-badge">{group.inviteCode}</b>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
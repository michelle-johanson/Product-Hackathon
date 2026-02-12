import { useState, useEffect } from 'react';

export default function GroupPage({ group, onBack }) {
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the full details of this specific group (including members)
  useEffect(() => {
    // 1. ADDED SAFETY CHECK: Don't run if group is missing
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
  }, [group?.id]); // 2. ADDED QUESTION MARK (Optional Chaining)

  // 3. ADDED SAFETY CHECK: Show a fallback if group is missing
  if (!group) return <div className="p-6">No group selected.</div>; 
  if (loading) return <div className="p-6">Loading group info...</div>;
  if (!groupDetails) return <div className="p-6">Failed to load group.</div>;

  return (
    <div className="group-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
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

      <div className="card">
        <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          Team Members ({groupDetails.members?.length || 0})
        </h3>
        
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
    </div>
  );
}
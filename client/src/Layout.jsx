import { useState } from 'react';

export default function Layout({ children, user, onLogout, groups, currentGroup, onSelectGroup }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      
      {/* LEFT SIDEBAR */}
      <aside className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {sidebarOpen && <span>StudyApp</span>}
          <button 
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }}>
          <div 
            className={`sidebar-link ${!currentGroup ? 'active' : ''}`} 
            onClick={() => onSelectGroup(null)}
          >
            {sidebarOpen ? '🏠 Dashboard' : '🏠'}
          </div>

          {sidebarOpen && (
            <div style={{ margin: '25px 0 10px 10px', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
              My Groups
            </div>
          )}

          {groups.map(g => (
            <div
              key={g.id}
              className={`sidebar-link ${currentGroup?.id === g.id ? 'active' : ''}`}
              onClick={() => onSelectGroup(g)}
              title={g.name}
            >
              {sidebarOpen ? `📚 ${g.name}` : '📚'}
            </div>
          ))}
        </nav>

        <button onClick={onLogout} className="logout-btn">
          <span>🚪</span>
          {sidebarOpen && <span>Log Out</span>}
        </button>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <div className="main-content">
        <header className="top-header">
          <h2>{`Welcome, ${user.name}!`}</h2>
          <div style={{ 
            width: '35px', height: '35px', 
            background: '#3498db', color: 'white', 
            borderRadius: '50%', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        </header>

        <main className="page-body">
          {children}
        </main>
      </div>

    </div>
  );
}
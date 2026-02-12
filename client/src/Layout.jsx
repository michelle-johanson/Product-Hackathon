import { useState } from 'react';

export default function Layout({ children, user, onLogout }) {
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

        {/* Navigation Placeholder */}
        <nav style={{ flex: 1 }}>
          {/* Links go here */}
        </nav>

        <button onClick={onLogout} className="logout-btn">
          <span>🚪</span>
          {sidebarOpen && <span>Log Out</span>}
        </button>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <div className="main-content">
        <header className="top-header">
          <h2>Welcome, {user.name}</h2>
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
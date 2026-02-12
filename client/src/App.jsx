import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard'; 
import Layout from './Layout';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isSignup, setIsSignup] = useState(false); // Toggle between Login and Signup

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 1. Check for existing token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // UPDATED URL: /api/auth/me
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

  // 2. Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // UPDATED URLs: /api/auth/signup or /api/auth/login
    const endpoint = isSignup 
      ? 'http://localhost:3000/api/auth/signup' 
      : 'http://localhost:3000/api/auth/login';
      
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
    setEmail('');
    setPassword('');
    setName('');
  };

  if (loading) return <h1>Loading...</h1>;

  // LOGGED IN VIEW
  if (user) {
    return (
      <Layout user={user} onLogout={handleLogout}>
        <Dashboard user={user} onLogout={handleLogout} />
      </Layout>
    );
  }

  // LOGIN / SIGNUP VIEW
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>{isSignup ? "Create Account" : "Please Log In"}</h1>
      
      {error && <p style={{color: 'red'}}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <>
            <input 
              placeholder="Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
            />
            <br /><br />
          </>
        )}

        <input 
          placeholder="Email" 
          type="email"
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required
        />
        <br /><br />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required
        />
        <br /><br />
        
        <button type="submit">
          {isSignup ? "Sign Up" : "Log In"}
        </button>
      </form>

      <p>
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <button onClick={() => {
          setIsSignup(!isSignup);
          setError('');
        }}>
          {isSignup ? "Log In" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
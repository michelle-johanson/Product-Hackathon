import { useState } from "react";
import { apiRequest } from "../lib/api"; // Note: changed path to ../lib/api based on your folder structure

export default function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const payload = isSignup 
        ? { name, email, password } 
        : { email, password };

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.setItem("token", data.token);
      onLogin(data.user);

    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* LOGO SECTION - Corrected filename */}
        <div className="logo-wrapper">
          <img 
            src="/StruggleBusLogo.png" 
            alt="Struggle Bus" 
            className="auth-logo" 
          />
        </div>

        <h1 className="auth-heading">
          {isSignup ? "Create Account" : "Login"}
        </h1>

        {error && <div className="auth-error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <input
              className="auth-input"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            className="auth-input"
            placeholder="Enter Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="auth-submit-btn" type="submit">
            {isSignup ? "Sign up" : "Sign in"}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignup ? "Already have an account?" : "Need an account?"}
            <button 
              className="auth-toggle-btn"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
            >
              {isSignup ? "Log In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { apiRequest } from "./lib/api";

export default function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleSubmit = async () => {
    try {
      const endpoint = isSignup ? "/auth/signup" : "/auth/login";

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1>{isSignup ? "Sign Up" : "Login"}</h1>

      {isSignup && (
        <input
          placeholder="Name"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />
      )}

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <button onClick={handleSubmit}>
        {isSignup ? "Create Account" : "Login"}
      </button>

      <p>
        {isSignup ? "Already have an account?" : "No account?"}
        <button onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Login" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}

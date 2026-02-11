import { useState, useEffect } from "react";
import { apiRequest } from "./lib/api";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load_user = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/auth/me");
        setUser(data);
      } catch {
        // Invalid or expired token – clear and fall back to Auth
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    load_user();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return <Dashboard user={user} />;
}

export default App;

import { useState, useEffect } from "react";
import { API_URL } from "../config";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/api/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  const handleLogin = (result) => {
    const { user, token } = result;
    setUser(user);
    localStorage.setItem("token", token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return { user, handleLogin, handleLogout };
}

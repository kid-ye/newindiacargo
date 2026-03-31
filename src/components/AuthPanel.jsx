import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api";

export default function AuthPanel({ onLogin, onClose }) {
  const [authMode, setAuthMode] = useState("login");
  const [error, setError] = useState("");
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "filled_blue",
        size: "large",
        width: "100%",
      });
    }
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      const res = await apiFetch(`/api/google-login`, {
        method: "POST",
        body: JSON.stringify({ credential: response.credential }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      onLogin(result);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const res = await apiFetch(`/api/${authMode}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      onLogin(result);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-card auth-panel">
      <button className="auth-close" onClick={onClose}>
        ×
      </button>
      <div className="auth-tabs">
        <button
          className={authMode === "login" ? "active" : ""}
          onClick={() => setAuthMode("login")}
        >
          Login
        </button>
        <button
          className={authMode === "signup" ? "active" : ""}
          onClick={() => setAuthMode("signup")}
        >
          Sign Up
        </button>
      </div>
      {error && <div className="auth-error">{error}</div>}
      <div ref={googleButtonRef} className="google-btn-container" />
      <div className="auth-divider">or</div>
      {authMode === "login" ? (
        <form className="auth-form" onSubmit={handleAuth}>
          <input type="email" name="email" placeholder="Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button type="submit" className="auth-submit">
            Login
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleAuth}>
          <input type="text" name="name" placeholder="Full Name" required />
          <input type="email" name="email" placeholder="Email" required />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button type="submit" className="auth-submit">
            Sign Up
          </button>
        </form>
      )}
    </div>
  );
}

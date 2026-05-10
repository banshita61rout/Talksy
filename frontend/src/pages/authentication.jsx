import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./auth.css";

export default function Authentication() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState(0); // 0=login, 1=register

  const { handleregister, handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const switchTab = (tab) => {
    setFormState(tab);
    setError("");
    setSuccessMsg("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (formState === 0) {
        // LOGIN — AuthContext navigates to /home on success
        await handleLogin(username, password);
      } else {
        // REGISTER
        const result = await handleregister(name, username, password);
        setSuccessMsg(result + " — please sign in.");
        // Reset form and switch to login tab
        setName("");
        setUsername("");
        setPassword("");
        setFormState(0);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-brand" onClick={() => navigate("/")}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#0ea5e9" />
            <path d="M7 10h14M7 14h10M7 18h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="21" cy="18" r="3" fill="white" />
          </svg>
          <span>Talksy</span>
        </div>
        <div className="auth-left-content">
          <h2>Conversations<br />that matter.</h2>
          <p>Video calls, screen sharing, live chat — everything you need in one place.</p>
          <div className="auth-features">
            <div className="auth-feat">
              <span className="auth-feat-icon">🔒</span>
              <span>Secure & private calls</span>
            </div>
            <div className="auth-feat">
              <span className="auth-feat-icon">⚡</span>
              <span>Instant room creation</span>
            </div>
            <div className="auth-feat">
              <span className="auth-feat-icon">📋</span>
              <span>Meeting history saved</span>
            </div>
          </div>
        </div>
        <div className="auth-left-dots">
          {[...Array(20)].map((_, i) => <div key={i} className="dot" />)}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-card-title">
            {formState === 0 ? "Welcome back" : "Create account"}
          </h1>
          <p className="auth-card-sub">
            {formState === 0
              ? "Sign in to your Talksy account"
              : "Join Talksy and start calling"}
          </p>

          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${formState === 0 ? "active" : ""}`}
              onClick={() => switchTab(0)}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`auth-tab ${formState === 1 ? "active" : ""}`}
              onClick={() => switchTab(1)}
              type="button"
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuth} noValidate>
            {formState === 1 && (
              <div className="form-field">
                <label htmlFor="fullname">Full name</label>
                <input
                  id="fullname"
                  type="text"
                  placeholder="Arjun Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="arjun_sharma"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus={formState === 0}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {successMsg && <div className="auth-success">{successMsg}</div>}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait…"
                : formState === 0
                ? "Sign in →"
                : "Create account →"}
            </button>
          </form>

          <p className="auth-switch">
            {formState === 0 ? (
              <>
                Don't have an account?{" "}
                <button onClick={() => switchTab(1)} type="button">Register here</button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => switchTab(0)} type="button">Sign in</button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

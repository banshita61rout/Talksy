import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./home.css";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [newCode] = useState(() =>
    Math.random().toString(36).substring(2, 9).toUpperCase()
  );

  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    const code = meetingCode.trim();
    if (!code) return;
    await addToUserHistory(code);
    navigate(`/${code}`);
  };

  const handleNewMeeting = async () => {
    await addToUserHistory(newCode);
    navigate(`/${newCode}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleJoinVideoCall();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div className="home-root">
      {/* Topbar */}
      <header className="home-topbar">
        <div className="topbar-brand">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#0ea5e9" />
            <path d="M7 10h14M7 14h10M7 18h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="21" cy="18" r="3" fill="white" />
          </svg>
          <span className="topbar-name">Talksy</span>
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn" onClick={() => navigate("/history")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            History
          </button>
          <button className="topbar-logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="home-main">
        <div className="home-content">
          <div className="home-intro">
            <h1>
              Start or join a<br />
              <span className="home-accent">meeting</span>
            </h1>
            <p>Create an instant room or enter a meeting code to join.</p>
          </div>

          <div className="home-cards">
            {/* New meeting card */}
            <div className="home-card card-new">
              <div className="card-icon-wrap" style={{ background: "#dbeafe" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#1d4ed8">
                  <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </div>
              <h3>New meeting</h3>
              <p>Start an instant meeting with a unique room code.</p>
              <div className="new-code-preview">
                <span className="code-label">Your room code</span>
                <span className="code-value">{newCode}</span>
              </div>
              <button className="card-btn btn-blue" onClick={handleNewMeeting}>
                Start now
              </button>
            </div>

            {/* Join card */}
            <div className="home-card card-join">
              <div className="card-icon-wrap" style={{ background: "#dcfce7" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#16a34a">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </div>
              <h3>Join a meeting</h3>
              <p>Enter a meeting code shared by the host to join.</p>
              <div className="join-input-row">
                <input
                  type="text"
                  placeholder="Enter code…"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  className="join-input"
                  maxLength={20}
                />
              </div>
              <button
                className="card-btn btn-green"
                onClick={handleJoinVideoCall}
                disabled={!meetingCode.trim()}
              >
                Join
              </button>
            </div>
          </div>

          <div className="home-tips">
            <div className="tip">
              <span>💬</span>
              <span>Use in-call chat to message participants</span>
            </div>
            <div className="tip">
              <span>🖥️</span>
              <span>Share your screen during the call</span>
            </div>
            <div className="tip">
              <span>📋</span>
              <span>All your meetings are saved in History</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomeComponent);

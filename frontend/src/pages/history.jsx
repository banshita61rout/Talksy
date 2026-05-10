import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./history.css";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="history-root">
      <header className="history-header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="history-title-wrap">
          <h1>Meeting History</h1>
          <span className="history-count">{meetings.length} meetings</span>
        </div>
      </header>

      <main className="history-main">
        {loading ? (
          <div className="history-loading">
            <div className="spinner" />
            <p>Loading your history…</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">📋</div>
            <h3>No meetings yet</h3>
            <p>Your meeting history will appear here once you join a call.</p>
            <button className="empty-btn" onClick={() => navigate("/home")}>
              Start a meeting
            </button>
          </div>
        ) : (
          <div className="history-list">
            {[...meetings].reverse().map((e, i) => (
              <div className="history-item" key={i}>
                <div className="history-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#0ea5e9">
                    <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                </div>
                <div className="history-item-info">
                  <span className="history-code">{e.meetingCode}</span>
                  <span className="history-date">
                    {formatDate(e.date)} at {formatTime(e.date)}
                  </span>
                </div>
                <button
                  className="rejoin-btn"
                  onClick={() => navigate(`/${e.meetingCode}`)}
                >
                  Rejoin
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

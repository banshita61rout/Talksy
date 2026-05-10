import React from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className="landing-root">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#0ea5e9" />
              <path d="M7 10h14M7 14h10M7 18h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="21" cy="18" r="3" fill="white" />
            </svg>
          </span>
          <span className="brand-name">Talksy</span>
        </div>
        <div className="nav-actions">
          <button className="nav-link" onClick={() => router("/auth")}>Sign in</button>
          <button className="nav-cta" onClick={() => router("/auth")}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <main className="landing-hero">
        <div className="hero-left">
          <div className="hero-badge">✦ Free video calling for everyone</div>
          <h1 className="hero-title">
            Real conversations,<br />
            <span className="hero-accent">no boundaries.</span>
          </h1>
          <p className="hero-sub">
            Crystal-clear video, instant connections. Whether it's a team standup
            or a family catch-up — Talksy makes every call feel close.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => router("/auth")}>
              Start for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="btn-ghost" onClick={() => router("/auth")}>
              Join as guest
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">HD</span>
              <span className="stat-label">Video quality</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">0ms*</span>
              <span className="stat-label">Setup time</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">∞</span>
              <span className="stat-label">Participants</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="mock-call">
            <div className="mock-header">
              <div className="mock-dot red" />
              <div className="mock-dot yellow" />
              <div className="mock-dot green" />
              <span className="mock-title">talksy.app/team-standup</span>
            </div>
            <div className="mock-grid">
              <div className="mock-video v1">
                <div className="mock-avatar" style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)" }}>A</div>
                <span className="mock-name">Arjun</span>
                <div className="mock-mic-on" />
              </div>
              <div className="mock-video v2">
                <div className="mock-avatar" style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>P</div>
                <span className="mock-name">Priya</span>
                <div className="mock-mic-off" />
              </div>
              <div className="mock-video v3">
                <div className="mock-avatar" style={{ background: "linear-gradient(135deg,#10b981,#0ea5e9)" }}>R</div>
                <span className="mock-name">Riya</span>
                <div className="mock-mic-on" />
              </div>
              <div className="mock-video v4 you">
                <div className="mock-avatar" style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}>Y</div>
                <span className="mock-name">You</span>
                <div className="mock-mic-on" />
              </div>
            </div>
            <div className="mock-controls">
              <div className="mock-ctrl green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                </svg>
              </div>
              <div className="mock-ctrl green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.95-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.05 7.44-7 7.93V20h-2v-4.07z" />
                </svg>
              </div>
              <div className="mock-ctrl red">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="floating-badge badge-1">🔒 End-to-end secure</div>
          <div className="floating-badge badge-2">⚡ Instant join</div>
        </div>
      </main>

      {/* Features row */}
      <section className="features-row">
        <div className="feature-item">
          <div className="feature-icon">📹</div>
          <div>
            <div className="feature-name">HD Video</div>
            <div className="feature-desc">Crystal clear 720p calls</div>
          </div>
        </div>
        <div className="feature-sep" />
        <div className="feature-item">
          <div className="feature-icon">💬</div>
          <div>
            <div className="feature-name">Live Chat</div>
            <div className="feature-desc">Message during calls</div>
          </div>
        </div>
        <div className="feature-sep" />
        <div className="feature-item">
          <div className="feature-icon">🖥️</div>
          <div>
            <div className="feature-name">Screen Share</div>
            <div className="feature-desc">Share your screen instantly</div>
          </div>
        </div>
        <div className="feature-sep" />
        <div className="feature-item">
          <div className="feature-icon">📋</div>
          <div>
            <div className="feature-name">Call History</div>
            <div className="feature-desc">Track past meetings</div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© 2025 Talksy. Built for real conversations.</span>
      </footer>
    </div>
  );
}

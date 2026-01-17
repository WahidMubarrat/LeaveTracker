import { Link } from "react-router-dom";
import "../styles/Landing.css";

export default function Landing() {
  return (
    <div className="landing">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">LeaveTracker</div>
        <ul>
          <li>Home</li>
          <li>Features</li>
          <li>About</li>
          <li>Contact</li>
        </ul>
        <Link to="/login" className="btn-nav">Get Started</Link>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>Simplify Leave Management for Your Organization</h1>
          <p>
            Apply, approve, and track leaves — all in one smart dashboard.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">Get Started</Link>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>

        <div className="hero-image">
          {/* Placeholder illustration */}
          <div className="calendar-box">📅</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <h2>Key Features</h2>

        <div className="feature-grid">
          <div className="feature-card">Apply Leave</div>
          <div className="feature-card">Department Approval</div>
          <div className="feature-card">Admin Control</div>
          <div className="feature-card">Real-Time Tracking</div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="workflow">
        <h2>How It Works</h2>

        <div className="steps">
          <div className="step">Employee</div>
          <div className="step">Department Head</div>
          <div className="step">Admin</div>
          <div className="step">Dashboard Updated</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          Developed as part of SWE 5406 – Design Project 1 <br />
          Department of CSE, IUT
        </p>
      </footer>

    </div>
  );
}

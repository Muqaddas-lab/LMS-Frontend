import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ATLogo from "../assets/AT.png";
import { AuthContext } from "../context/AuthContext";
import "./StartScreen.css";

const StartScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="startscreen">
      {/* Watermark */}
      <img src={ATLogo} alt="Watermark" className="watermark" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img src={ATLogo} alt="AT Logo" />
        </div>
        <div className="nav-buttons">
          {user ? (
            <>
              <span style={{ marginRight: "10px" }}>Hi, {user.fullName || user.name}</span>
              <button className="btn-outline" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => navigate("/login")}>Login</button>
              <button className="btn-primary" onClick={() => navigate("/register")}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h1>Master the Code. Build the Future</h1>
        <p>Get hands-on training from industry experts and build real-world projects with AI & Web Development.</p>
        <button className="btn-primary large" onClick={() => navigate("/register")}>Get Started</button>
      </div>

      {/* Feature Cards */}
      <div className="features">
        <div className="card">
          <h3>AI Projects</h3>
          <p>Build real-world AI applications and learn cutting-edge technologies.</p>
        </div>
        <div className="card">
          <h3>Web Development</h3>
          <p>Learn modern web frameworks and create responsive websites.</p>
        </div>
        <div className="card">
          <h3>Mobile Apps</h3>
          <p>Create attractive mobile applications for Android and iOS.</p>
        </div>
        <div className="card">
          <h3>Data Science</h3>
          <p>Analyze data, visualize insights, and solve real business problems.</p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;

import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ATLogo from "../assets/AT.png";
import { AuthContext } from "../context/AuthContext";

const StartScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Redirect based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "student") {
        navigate("/student-dashboard");
      }
    }
  }, [user, navigate]);

  // Inline CSS
  const styles = {
    startscreen: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e1eff5, #38bdf8, #ffffff)",
      color: "#0f172a",
      fontFamily: "Poppins, sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    watermark: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      opacity: 0.05,
      width: "400px",
      height: "400px",
      pointerEvents: "none",
      zIndex: 0,
    },
    navbar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "24px 40px",
      position: "relative",
      zIndex: 1,
    },
    logoImg: { height: "48px" },
    navButtons: { display: "flex", gap: "16px" },
    btnOutline: {
      padding: "10px 20px",
      borderRadius: "999px",
      border: "1px solid #0ea5e9",
      background: "transparent",
      color: "#0f172a",
      cursor: "pointer",
      transition: "background 0.3s ease",
    },
    btnOutlineHover: { background: "#bae6fd" },
    btnPrimary: {
      padding: "10px 22px",
      borderRadius: "999px",
      background: "#5699b8",
      color: "white",
      border: "none",
      cursor: "pointer",
      transition: "background 0.3s ease, transform 0.3s ease",
    },
    btnPrimaryHover: {
      background: "#0284c7",
      transform: "scale(1.05)",
    },
    btnPrimaryLarge: {
      padding: "14px 36px",
      fontSize: "18px",
    },
    hero: {
      marginTop: "90px",
      textAlign: "center",
      padding: "0 20px",
      position: "relative",
      zIndex: 1,
    },
    heroTitle: { fontSize: "48px", fontWeight: 700, marginBottom: "16px", color: "#0f172a" },
    heroText: { maxWidth: "700px", margin: "0 auto 32px", color: "#1e3a8a", fontSize: "16px" },
    features: {
      marginTop: "60px",
      padding: "0 40px 40px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "24px",
      position: "relative",
      zIndex: 1,
    },
    card: {
      background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
      color: "white",
      borderRadius: "16px",
      padding: "24px",
      textAlign: "center",
      boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      cursor: "pointer",
    },
    cardHover: {
      transform: "translateY(-8px)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    },
    cardTitle: { marginBottom: "12px", fontSize: "20px" },
    cardText: { fontSize: "14px", lineHeight: 1.5 },
  };

  return (
    <div style={styles.startscreen}>
      {/* Watermark */}
      <img src={ATLogo} alt="Watermark" style={styles.watermark} />

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div className="logo">
          <img src={ATLogo} alt="AT Logo" style={styles.logoImg} />
        </div>
        <div style={styles.navButtons}>
          {user ? (
            <>
              <span style={{ marginRight: "10px" }}>Hi, {user.fullName || user.name}</span>
              <button style={styles.btnOutline} onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button style={styles.btnOutline} onClick={() => navigate("/login")}>Login</button>
              <button
                style={{ ...styles.btnPrimary, ...styles.btnPrimaryLarge }}
                onClick={() => navigate("/register")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Master the Code. Build the Future</h1>
        <p style={styles.heroText}>Get hands-on training from industry experts and build real-world projects with AI & Web Development.</p>
        <button
          style={{ ...styles.btnPrimary, ...styles.btnPrimaryLarge }}
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>
      </div>

      {/* Feature Cards */}
      <div style={styles.features}>
        {[
          { title: "AI Projects", text: "Build real-world AI applications and learn cutting-edge technologies." },
          { title: "Web Development", text: "Learn modern web frameworks and create responsive websites." },
          { title: "Mobile Apps", text: "Create attractive mobile applications for Android and iOS." },
          { title: "Data Science", text: "Analyze data, visualize insights, and solve real business problems." },
        ].map((feature, index) => (
          <div
            key={index}
            style={styles.card}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0px)"}
          >
            <h3 style={styles.cardTitle}>{feature.title}</h3>
            <p style={styles.cardText}>{feature.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StartScreen;

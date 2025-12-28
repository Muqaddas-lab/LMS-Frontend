import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardList,
  FaComment,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import ATLogo from "../assets/AT.png";

const StudentSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout(); 
      navigate("/login", { replace: true });
    }
  };

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoContainer}>
        <img src={ATLogo} alt="Arteanalytics Logo" style={styles.logoImg} />
      </div>

      {/* Menu */}
      <ul style={styles.menu}>
        <li>
          <Link
            to="/student/dashboard"
            style={{
              ...styles.link,
              ...getActiveStyle(isActive("/student/dashboard")),
            }}
          >
            <FaTachometerAlt /> Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/student/courses"
            style={{
              ...styles.link,
              ...getActiveStyle(isActive("/student/courses")),
            }}
          >
            <FaBook /> My Courses
          </Link>
        </li>

        <li>
          <Link
            to="/student/exams"
            style={{
              ...styles.link,
              ...getActiveStyle(isActive("/student/exams")),
            }}
          >
            <FaClipboardList /> Mock Exams
          </Link>
        </li>

        <li>
          <Link
            to="/student/messages"
            style={{
              ...styles.link,
              ...getActiveStyle(isActive("/student/messages")),
            }}
          >
            <FaComment /> Messages
          </Link>
        </li>

        {/* Logout */}
        <li style={{ marginTop: "auto" }}>
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(239,68,68,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <FaSignOutAlt /> Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default StudentSidebar;

/* 🔹 Helper */
const getActiveStyle = (active) =>
  active
    ? {
        background: "rgba(255,255,255,0.15)",
        borderLeft: "4px solid #fff",
      }
    : {
        background: "transparent",
        borderLeft: "4px solid transparent",
      };

/* 🔹 Styles */
const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "250px",
    height: "100vh",
    backgroundColor: "#216a7e",
    padding: "20px 0",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1000,
  },
  logoContainer: {
    marginBottom: "30px",
  },
  logoImg: {
    width: "100px",
    height: "60px",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 140px)",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "500",
    width: "100%",
    transition: "all 0.2s",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 20px",
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#fca5a5",
    fontWeight: "600",
    cursor: "pointer",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
};

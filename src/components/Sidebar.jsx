import React from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaUser,
  FaBook,
  // FaVideo,
  FaClipboardList,
  FaComment,
  FaSignOutAlt,
} from "react-icons/fa";
import ATLogo from "../assets/AT.png";

const Sidebar = () => {
  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoContainer}>
        <img src={ATLogo} alt="Arteanalytics Logo" style={styles.logoImg} />
      </div>

      {/* Menu */}
      <ul style={styles.menu}>
        <li>
          <Link style={styles.link} to="/admin/dashboard">
            <FaUsers /> Dashboard
          </Link>
        </li>

        <li>
          <Link style={styles.link} to="/users">
            <FaUsers /> Users
          </Link>
        </li>

        <li>
          <Link style={styles.link} to="/students">
            <FaUser /> Students
          </Link>
        </li>

        {/* Courses */}
        <li>
          <Link style={styles.link} to="/courses">
            <FaBook /> Courses
          </Link>
        </li>

        {/* Mock Exams */}
        <li>
          <Link style={styles.link} to="/mockexams">
            <FaClipboardList /> Mock Exam
          </Link>
        </li>

        {/* Messages */}
        <li>
          <Link style={styles.link} to="/messages">
            <FaComment /> Messages
          </Link>
        </li>

        {/* Logout */}
        <li>
          <span
            style={{ ...styles.link, color: "#ef4444", cursor: "pointer" }}
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                localStorage.clear();
                window.location.href = "/login";
              }
            }}
          >
            <FaSignOutAlt /> Logout
          </span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

// ================= STYLES =================

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "250px",
    height: "100vh",
    backgroundColor: "#216a7eff",
    padding: "20px 0",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "30px",
  },
  logoImg: {
    width: "100px",
    height: "60px",
    borderRadius: "10%",
    marginBottom: "10px",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    width: "100%",
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
    transition: "background 0.2s",
  },
};

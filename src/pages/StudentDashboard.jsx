import React from "react";
import StudentSidebar from "../components/StudentSidebar";
import { FaBook, FaVideo, FaClipboardList, FaCheck, FaClock } from "react-icons/fa";

const StudentDashboard = () => {
  const myCourses = 5;
  const totalLectures = 14;
  const completedLectures = 8;
  const remainingLectures = totalLectures - completedLectures;
  const subscriptionTime = "45 Days 10 Hours 35 Minutes";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <StudentSidebar/>

      <div style={{ flex: 1, marginLeft: "250px", padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>Student Dashboard</h1>
          <div style={{
            backgroundColor: "#d1fae5",
            color: "#065f46",
            padding: "10px 15px",
            borderRadius: "8px",
            fontWeight: "600"
          }}>
            Course Subscription End in <br /> {subscriptionTime}
          </div>
        </div>

        {/* Dashboard Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
          <div style={cardStyle}>
            <FaBook size={20} />
            <div style={cardTextStyle}>My Courses</div>
            <div style={cardNumberStyle}>{myCourses}</div>
          </div>
          <div style={cardStyle}>
            <FaVideo size={20} />
            <div style={cardTextStyle}>Total Lectures</div>
            <div style={cardNumberStyle}>{totalLectures}</div>
          </div>
          <div style={cardStyle}>
            <FaCheck size={20} />
            <div style={cardTextStyle}>Completed Lectures</div>
            <div style={cardNumberStyle}>{completedLectures}/{totalLectures}</div>
          </div>
          <div style={cardStyle}>
            <FaClock size={20} />
            <div style={cardTextStyle}>Remaining Lectures</div>
            <div style={cardNumberStyle}>{remainingLectures}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Card Styles
const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "15px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const cardTextStyle = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#555",
};

const cardNumberStyle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#111",
};

export default StudentDashboard;

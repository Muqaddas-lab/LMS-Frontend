// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardCards from "../components/DashboardCards";
import Sidebar from "../components/Sidebar";
import { getAllUsers, getCourses, getLectures } from "../api/api";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, coursesData, lecturesData] = await Promise.all([
          getAllUsers(),
          getCourses(),
          getLectures(),
        ]);
        setUsers(usersData);
        setCourses(coursesData);
        setLectures(lecturesData);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch dashboard data!");
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: "flex", backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: "250px", padding: "24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#111827" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", marginTop: "4px", fontSize: "16px" }}>
            Manage Users, Courses, and Lectures efficiently
          </p>
        </div>

        {/* Dashboard Cards Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)",
          gap: "20px",
        }}>
          <DashboardCards 
            totalStudents={users.length}
            totalCourses={courses.length}
            totalLectures={lectures.length}
          />
        </div>

        {/* Optional: Add more sections here like Recent Users, Reports etc. */}
      </div>
    </div>
  );
};

export default Dashboard;

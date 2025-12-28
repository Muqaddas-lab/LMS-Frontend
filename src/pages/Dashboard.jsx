// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardCards from "../components/DashboardCards";
import Sidebar from "../components/Sidebar";
import { getAllUsers, getCourses, getLecturesByCourse, getAllExams } from "../api/api";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users, courses, and exams
        const [usersData, coursesData, examsData] = await Promise.all([
          getAllUsers(),
          getCourses(),
          getAllExams(),
        ]);

        // Process users data
        const processedUsers = Array.isArray(usersData) 
          ? usersData 
          : (usersData?.users || []);

        // Process courses data (same logic as Courses.jsx)
        let processedCourses = [];
        if (Array.isArray(coursesData)) {
          processedCourses = coursesData;
        } else if (Array.isArray(coursesData?.courses)) {
          processedCourses = coursesData.courses;
        }

        // Fetch lectures by looping through each course
        let allLectures = [];
        const lecturePromises = processedCourses.map(course => 
          getLecturesByCourse(course._id).catch(() => [])
        );
        
        const lectureArrays = await Promise.all(lecturePromises);
        allLectures = lectureArrays.flat();

        // Process exams data
        const processedExams = Array.isArray(examsData) 
          ? examsData 
          : (examsData?.exams || []);

        setUsers(processedUsers);
        setCourses(processedCourses);
        setLectures(allLectures);
        setExams(processedExams);

      } catch (err) {
        console.error("Dashboard Error:", err);
        alert("Failed to fetch dashboard data!");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: "250px", padding: "24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center", fontSize: "18px", color: "#6b7280" }}>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

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
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          <DashboardCards 
            totalStudents={users.filter(u => u.role === "Student").length}
            totalCourses={courses.length}
            totalLectures={lectures.length}
            totalExams={exams.length}
          />
        </div>

        {/* Optional: Add more sections here like Recent Users, Reports etc. */}
      </div>
    </div>
  );
};

export default Dashboard;
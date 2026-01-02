import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import {
  getStudentEnrollments,
  getProgress,
  enrollStudentInCourse,
  getAllCourses,
} from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaClock, FaChartLine, FaArrowRight } from "react-icons/fa";

const StudentCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [deletedEnrollments, setDeletedEnrollments] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const navigate = useNavigate();

  const userInfo = localStorage.getItem("userInfo");
  const studentId = userInfo ? JSON.parse(userInfo).id : null;

  useEffect(() => {
    fetchEnrollments();
    fetchAllCourses();
  }, [studentId]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await getStudentEnrollments(studentId);

      const active = data.filter((e) => !e.isDeleted);
      const deleted = data.filter((e) => e.isDeleted);

      setEnrollments(active);
      setDeletedEnrollments(deleted);

      const progressMap = {};
      for (const e of active) {
        try {
          const res = await getProgress(studentId, e.course._id);
          progressMap[e.course._id] = res.progressPercentage || 0;
        } catch {
          progressMap[e.course._id] = 0;
        }
      }
      setProgressData(progressMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    const data = await getAllCourses();
    setAvailableCourses(data || []);
  };

  const handleEnrollCourse = async () => {
    if (!selectedCourse) return;
    setEnrolling(true);
    await enrollStudentInCourse(studentId, selectedCourse);
    setSelectedCourse("");
    await fetchEnrollments();
    setEnrolling(false);
  };

  const getStatus = (endDate, progress) => {
    if (progress === 100)
      return { text: "Completed", color: "#10b981", bg: "#d1fae5" };
    if (endDate && new Date(endDate) < new Date())
      return { text: "Expired", color: "#ef4444", bg: "#fee2e2" };
    return { text: "Active", color: "#3b82f6", bg: "#dbeafe" };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          Loading courses...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <StudentSidebar />

      <div style={{ flex: 1, marginLeft: "250px", padding: "30px" }}>
        {/* HEADER */}
        <h1 style={{ fontSize: "30px", fontWeight: "800", marginBottom: "6px" }}>
          📚 My Courses
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "20px" }}>
          Track your progress and continue learning
        </p>

        {/* ENROLL */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "14px",
            marginBottom: "30px",
            display: "flex",
            gap: "12px",
          }}
        >
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
            }}
          >
            <option value="">Select a course</option>
            {availableCourses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleEnrollCourse}
            disabled={enrolling || !selectedCourse}
            style={{
              padding: "12px 24px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {enrolling ? "Enrolling..." : "Enroll"}
          </button>
        </div>

        {/* ACTIVE COURSES */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
            Active Courses
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
              gap: "28px",
            }}
          >
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              const progress = progressData[course._id] || 0;
              const status = getStatus(course.endDate, progress);

              return (
                <div
                  key={enrollment._id}
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "28px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {/* STATUS */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                    <span
                      style={{
                        background: status.bg,
                        color: status.color,
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {status.text}
                    </span>
                    <span style={{ color: "#6b7280", fontSize: "14px" }}>
                      <FaClock /> {course.duration || "N/A"} hrs
                    </span>
                  </div>

                  <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "10px" }}>
                    {course.title}
                  </h3>

                  <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "18px" }}>
                    {course.description?.substring(0, 120)}...
                  </p>

                  {/* PROGRESS */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600" }}>
                        <FaChartLine /> Progress
                      </span>
                      <span style={{ fontWeight: "700" }}>{progress}%</span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "10px",
                        background: "#e5e7eb",
                        borderRadius: "6px",
                        overflow: "hidden",
                        marginTop: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          background: progress === 100 ? "#10b981" : "#3b82f6",
                        }}
                      />
                    </div>
                  </div>

                  {/* BUTTON */}
                  <button
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    View Lectures <FaArrowRight />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCoursesPage;

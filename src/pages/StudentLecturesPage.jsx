import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import {
  getLecturesByCourse,
  getProgress,
  trackLectureProgress,
} from "../api/api";
import { FaPlay, FaFilePdf, FaCheckCircle, FaLock } from "react-icons/fa";
import { getUserId, isAuthenticated } from "../utils/auth"; // ⭐ Import helper

const StudentLecturesPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentId = getUserId(); // ⭐ Use helper

  console.log("📌 Student ID:", studentId);
  console.log("📌 Course ID:", courseId);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      console.error("❌ User not authenticated");
      navigate("/login");
      return;
    }

    if (!studentId) {
      console.error("❌ Student ID not found");
      setError("Unable to identify student. Please login again.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("🔍 Fetching lectures for course:", courseId);

        // Fetch lectures
        const lectureData = await getLecturesByCourse(courseId);
        console.log("✅ Lectures data:", lectureData);
        setLectures(Array.isArray(lectureData) ? lectureData : []);

        // Fetch progress
        console.log("🔍 Fetching progress for student:", studentId, "course:", courseId);
        const progressRes = await getProgress(studentId, courseId);
        console.log("✅ Progress data:", progressRes);
        
        const completed = progressRes?.progress?.completedLectures?.map((l) => l._id) || [];
        console.log("✅ Completed lectures:", completed);
        setCompletedLectures(completed);
        
      } catch (err) {
        console.error("❌ Error fetching lectures:", err);
        console.error("Error details:", err.response?.data);
        setError("Failed to load lectures. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, studentId, navigate]);

  const handleMarkComplete = async (lectureId) => {
    if (!studentId) {
      alert("Student ID not found. Please login again.");
      return;
    }

    try {
      console.log("📝 Marking lecture as complete:", { studentId, courseId, lectureId });
      
      await trackLectureProgress(studentId, courseId, lectureId);
      
      setCompletedLectures((prev) => [...prev, lectureId]);
      alert("Lecture marked as complete! ✅");
    } catch (err) {
      console.error("❌ Error tracking progress:", err);
      console.error("Error details:", err.response?.data);
      alert("Failed to mark lecture as complete. Please try again.");
    }
  };

  const progressPercentage =
    lectures.length > 0
      ? Math.round((completedLectures.length / lectures.length) * 100)
      : 0;

  // Show error if no studentId
  if (!studentId) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "#ef4444" }}>Authentication Error</h2>
            <p>Unable to identify student. Please login again.</p>
            <button
              onClick={() => navigate("/login")}
              style={{
                marginTop: 20,
                padding: "12px 24px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p>Loading lectures...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <StudentSidebar />
      <div style={{ flex: 1, marginLeft: "250px", padding: "30px" }}>
        {/* Header with Progress */}
        <div style={{ marginBottom: "30px" }}>
          <button
            onClick={() => navigate("/student/courses")}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "16px",
            }}
          >
            ← Back to Courses
          </button>

          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "12px" }}>
            📚 Course Lectures
          </h1>

          {/* Error Message */}
          {error && (
            <div style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16
            }}>
              {error}
            </div>
          )}

          {/* Progress Bar */}
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontWeight: "600", color: "#374151" }}>Your Progress</span>
              <span style={{ fontWeight: "700", color: "#3b82f6", fontSize: "18px" }}>
                {progressPercentage}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "12px",
                background: "#e5e7eb",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progressPercentage}%`,
                  height: "100%",
                  background: progressPercentage === 100 ? "#10b981" : "#3b82f6",
                  transition: "width 0.3s",
                }}
              />
            </div>
            <p style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280" }}>
              {completedLectures.length} of {lectures.length} lectures completed
            </p>
          </div>
        </div>

        {/* Lectures Grid */}
        {lectures.length === 0 ? (
          <div
            style={{
              background: "#fff",
              padding: "60px 20px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <FaLock size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
            <h3 style={{ color: "#374151" }}>No Lectures Available</h3>
            <p style={{ color: "#6b7280" }}>
              Lectures will appear here once your instructor uploads them.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px",
            }}
          >
            {lectures.map((lecture, index) => {
              const isCompleted = completedLectures.includes(lecture._id);

              return (
                <div
                  key={lecture._id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: isCompleted ? "2px solid #10b981" : "1px solid #e5e7eb",
                    position: "relative",
                  }}
                >
                  {/* Completed Badge */}
                  {isCompleted && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "#10b981",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <FaCheckCircle size={12} /> Completed
                    </div>
                  )}

                  {/* Lecture Number */}
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#6b7280", marginBottom: "8px" }}>
                    Lecture {lecture.lectureNumber || index + 1}
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "12px" }}>
                    {lecture.title}
                  </h3>

                  {/* Description */}
                  <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px", lineHeight: "1.5" }}>
                    {lecture.description?.substring(0, 100)}
                    {lecture.description?.length > 100 ? "..." : ""}
                  </p>

                  {/* Video */}
                  {(lecture.videoPath || lecture.videoUrl) && (
                    <div style={{ marginBottom: "12px" }}>
                      {lecture.videoPath ? (
                        <video
                          controls
                          style={{ width: "100%", borderRadius: "8px", marginBottom: "8px" }}
                        >
                          <source src={`http://localhost:5000/${lecture.videoPath}`} />
                        </video>
                      ) : (
                        <a
                          href={lecture.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#3b82f6",
                            color: "#fff",
                            padding: "10px 16px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "14px",
                          }}
                        >
                          <FaPlay /> Watch Video
                        </a>
                      )}
                    </div>
                  )}

                  {/* PDF */}
                  {lecture.pdfPath && (
                    <a
                      href={`http://localhost:5000/${lecture.pdfPath}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#ef4444",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "14px",
                        marginBottom: "12px",
                      }}
                    >
                      <FaFilePdf /> View PDF Notes
                    </a>
                  )}

                  {/* Mark Complete Button */}
                  {!isCompleted && (
                    <button
                      onClick={() => handleMarkComplete(lecture._id)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer",
                        marginTop: "12px",
                      }}
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLecturesPage;
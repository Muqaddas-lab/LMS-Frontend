import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import { getAllExams, getAttemptsByUser } from "../api/api";
import { FaClipboardList, FaClock, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";

const StudentExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get user ID with better error handling
  const getUserId = () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) {
        console.error("No userInfo in localStorage");
        return null;
      }
      
      const user = JSON.parse(userInfo);
      console.log("User from localStorage:", user);
      
      // Try multiple possible locations for the ID
      const id = user?.id || user?._id || user?.user?._id || user?.userId;
      console.log("Extracted student ID:", id);
      
      return id;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };

  const studentId = getUserId();

  useEffect(() => {
    const fetchData = async () => {
      // Check if studentId exists
      if (!studentId) {
        console.error("❌ Student ID is missing!");
        setError("Unable to identify student. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching data for student:", studentId);

        // Fetch all exams
        const examData = await getAllExams();
        console.log("Fetched exams:", examData);
        setExams(examData.exams || []);

        // Fetch student's attempts
        const attemptData = await getAttemptsByUser(studentId);
        console.log("Fetched attempts:", attemptData);
        setAttempts(attemptData || []);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Failed to load exams. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const getExamStatus = (examId) => {
    const attempt = attempts.find((a) => a.exam?._id === examId || a.exam === examId);
    return attempt ? "completed" : "pending";
  };

  const getAttemptScore = (examId) => {
    const attempt = attempts.find((a) => a.exam?._id === examId || a.exam === examId);
    return attempt ? attempt.score : null;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p>Loading exams...</p>
        </div>
      </div>
    );
  }

  // Show error if studentId is missing
  if (!studentId) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "#ef4444" }}>Authentication Error</h2>
            <p>{error}</p>
            <button
              onClick={() => navigate("/login")}
              style={{
                marginTop: 20,
                padding: "12px 24px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <StudentSidebar />

      <div style={{ flex: 1, marginLeft: "250px", padding: "30px" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827" }}>
            📝 Mock Exams
          </h1>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            Test your knowledge and track your progress
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: 16,
            borderRadius: 8,
            marginBottom: 24
          }}>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
              Total Exams
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#111827" }}>
              {exams.length}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
              Completed
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#10b981" }}>
              {attempts.length}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
              Pending
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#f59e0b" }}>
              {exams.length - attempts.length}
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <div
            style={{
              background: "#fff",
              padding: "60px 20px",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <FaClipboardList size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
            <h3 style={{ color: "#374151" }}>No Exams Available</h3>
            <p style={{ color: "#6b7280" }}>
              Exams will appear here once your instructor creates them.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {exams.map((exam) => {
              const status = getExamStatus(exam._id);
              const score = getAttemptScore(exam._id);

              return (
                <div
                  key={exam._id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: status === "completed" ? "2px solid #10b981" : "1px solid #e5e7eb",
                    position: "relative",
                  }}
                >
                  {/* Status Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                    }}
                  >
                    {status === "completed" ? (
                      <div
                        style={{
                          background: "#d1fae5",
                          color: "#065f46",
                          padding: "6px 12px",
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
                    ) : (
                      <div
                        style={{
                          background: "#fef3c7",
                          color: "#92400e",
                          padding: "6px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaHourglassHalf size={12} /> Pending
                      </div>
                    )}
                  </div>

                  {/* Exam Title */}
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "12px",
                      marginTop: "8px",
                    }}
                  >
                    {exam.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      marginBottom: "20px",
                      lineHeight: "1.5",
                    }}
                  >
                    {exam.description}
                  </p>

                  {/* Exam Details */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginBottom: "20px",
                      padding: "16px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        Duration
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#374151",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaClock size={14} /> {exam.duration} min
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        Total Marks
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "600", color: "#374151" }}>
                        {exam.totalMarks}
                      </div>
                    </div>
                  </div>

                  {/* Score Display (if completed) */}
                  {status === "completed" && score !== null && (
                    <div
                      style={{
                        background: "#d1fae5",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "#065f46", marginBottom: "4px" }}>
                        Your Score
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: "700", color: "#065f46" }}>
                        {score} / {exam.totalMarks}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/student/exams/${exam._id}`)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: status === "completed" ? "#6b7280" : "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: status === "completed" ? "not-allowed" : "pointer",
                      fontSize: "14px",
                    }}
                    disabled={status === "completed"}
                  >
                    {status === "completed" ? "Completed" : "Start Exam"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExamsPage;
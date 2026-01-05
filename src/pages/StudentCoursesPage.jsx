import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import {
  getStudentEnrollments,
  getProgress,
  enrollStudentInCourse,
  getAllCourses,
} from "../api/api";
import { useNavigate } from "react-router-dom";
import { 
  FaClock, 
  FaChartLine, 
  FaArrowRight, 
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
  FaBook,
  FaCalendarAlt
} from "react-icons/fa";

const StudentCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [deletedEnrollments, setDeletedEnrollments] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const userInfo = localStorage.getItem("userInfo");
  const studentId = userInfo ? JSON.parse(userInfo).id : null;

  useEffect(() => {
    if (studentId) {
      initializePage();
    }
  }, [studentId]);

  const initializePage = async () => {
    await Promise.all([fetchEnrollments(), fetchAllCourses()]);
  };

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
      console.error("Error fetching enrollments:", err);
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const data = await getAllCourses();
      setAvailableCourses(data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const handleEnrollCourse = async () => {
    if (!selectedCourse) return;
    
    setError("");
    setEnrolling(true);
    
    try {
      await enrollStudentInCourse(studentId, selectedCourse);
      setSelectedCourse("");
      await fetchEnrollments();
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const getStatus = (endDate, progress) => {
    if (progress === 100)
      return { 
        text: "Completed", 
        color: "#10b981", 
        bg: "#d1fae5",
        icon: <FaCheckCircle />
      };
    if (endDate && new Date(endDate) < new Date())
      return { 
        text: "Expired", 
        color: "#ef4444", 
        bg: "#fee2e2",
        icon: <FaTimesCircle />
      };
    return { 
      text: "Active", 
      color: "#3b82f6", 
      bg: "#dbeafe",
      icon: <FaBook />
    };
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div style={pageContainer}>
        <StudentSidebar />
        <div style={loadingContainer}>
          <div style={spinner}></div>
          <p style={loadingText}>Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      <StudentSidebar />

      <div style={mainContent}>
        {/* HEADER SECTION */}
        <div style={headerSection}>
          <div style={headerLeft}>
            <h1 style={pageTitle}>
              <FaGraduationCap style={titleIcon} /> My Learning Journey
            </h1>
            <p style={pageSubtitle}>
              Track your progress and continue building your skills
            </p>
          </div>
          <div style={statsContainer}>
            <StatBadge 
              label="Total Courses" 
              value={enrollments.length}
              color="#667eea"
            />
            <StatBadge 
              label="Completed" 
              value={enrollments.filter(e => progressData[e.course._id] === 100).length}
              color="#10b981"
            />
          </div>
        </div>

        {/* ENROLL SECTION */}
        <div style={enrollSection}>
          <div style={enrollHeader}>
            <h3 style={enrollTitle}>Enroll in a New Course</h3>
            <p style={enrollSubtitle}>Select from available courses and start learning today</p>
          </div>
          
          <div style={enrollForm}>
            <div style={selectWrapper}>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setError("");
                }}
                style={selectStyle}
              >
                <option value="">Choose a course to enroll</option>
                {availableCourses
                  .filter(c => !enrollments.some(e => e.course._id === c._id))
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} {c.duration ? `(${c.duration} hours)` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleEnrollCourse}
              disabled={enrolling || !selectedCourse}
              style={{
                ...enrollButton,
                opacity: enrolling || !selectedCourse ? 0.6 : 1,
                cursor: enrolling || !selectedCourse ? 'not-allowed' : 'pointer'
              }}
            >
              {enrolling ? (
                <>
                  <div style={buttonSpinner}></div>
                  Enrolling...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Enroll Now
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div style={errorMessage}>
              <FaTimesCircle /> {error}
            </div>
          )}
        </div>

        {/* COURSES GRID */}
        <div style={coursesSection}>
          <h2 style={sectionTitle}>
            Active Courses <span style={courseCount}>({enrollments.length})</span>
          </h2>

          {enrollments.length === 0 ? (
            <div style={emptyState}>
              <FaGraduationCap style={emptyIcon} />
              <h3 style={emptyTitle}>No Courses Yet</h3>
              <p style={emptyText}>Enroll in a course above to start your learning journey!</p>
            </div>
          ) : (
            <div style={coursesGrid}>
              {enrollments.map((enrollment) => {
                const course = enrollment.course;
                const progress = progressData[course._id] || 0;
                const status = getStatus(course.endDate, progress);

                return (
                  <div key={enrollment._id} style={courseCard}>
                    {/* CARD HEADER */}
                    <div style={cardHeader}>
                      <div style={statusBadge(status)}>
                        <span style={statusIcon}>{status.icon}</span>
                        <span>{status.text}</span>
                      </div>
                      <div style={durationBadge}>
                        <FaClock style={badgeIcon} />
                        <span>{course.duration || "N/A"} hrs</span>
                      </div>
                    </div>

                    {/* COURSE INFO */}
                    <div style={cardBody}>
                      <h3 style={courseTitle}>{course.title}</h3>
                      <p style={courseDescription}>
                        {course.description?.substring(0, 120) || "No description available"}
                        {course.description?.length > 120 && "..."}
                      </p>

                      {/* DATE INFO */}
                      {course.endDate && (
                        <div style={dateInfo}>
                          <FaCalendarAlt style={dateIcon} />
                          <span>Ends: {formatDate(course.endDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* PROGRESS SECTION */}
                    <div style={progressSection}>
                      <div style={progressHeader}>
                        <div style={progressLabel}>
                          <FaChartLine style={progressIcon} />
                          <span>Progress</span>
                        </div>
                        <span style={progressPercentage}>{progress}%</span>
                      </div>
                      
                      <div style={progressBarContainer}>
                        <div style={progressBarTrack}>
                          <div
                            style={{
                              ...progressBarFill,
                              width: `${progress}%`,
                              background: progress === 100 
                                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                      onClick={() => navigate(`/student/courses/${course._id}`)}
                      style={viewButton}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      <span>View Course Content</span>
                      <FaArrowRight style={buttonArrow} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */
const StatBadge = ({ label, value, color }) => (
  <div style={statBadgeContainer}>
    <div style={{ ...statBadgeValue, color }}>{value}</div>
    <div style={statBadgeLabel}>{label}</div>
  </div>
);

/* ================= STYLES ================= */
const pageContainer = {
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
};

const loadingContainer = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  marginLeft: 250,
};

const spinner = {
  width: 50,
  height: 50,
  border: "4px solid #e5e7eb",
  borderTop: "4px solid #0284c7",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const loadingText = {
  marginTop: 16,
  fontSize: 16,
  color: "#64748b",
  fontWeight: 500,
};

const mainContent = {
  flex: 1,
  marginLeft: 250,
  padding: "40px",
  maxWidth: 1400,
};

const headerSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 40,
  flexWrap: "wrap",
  gap: 24,
};

const headerLeft = {
  flex: 1,
};

const pageTitle = {
  fontSize: 36,
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: 8,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const titleIcon = {
  color: "#0284c7",
  fontSize: 32,
};

const pageSubtitle = {
  fontSize: 16,
  color: "#64748b",
  lineHeight: 1.6,
};

const statsContainer = {
  display: "flex",
  gap: 16,
};

const statBadgeContainer = {
  background: "#fff",
  padding: "16px 24px",
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  textAlign: "center",
  minWidth: 120,
};

const statBadgeValue = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 4,
};

const statBadgeLabel = {
  fontSize: 13,
  color: "#64748b",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const enrollSection = {
  background: "#fff",
  padding: 32,
  borderRadius: 20,
  marginBottom: 40,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  border: "1px solid #e2e8f0",
};

const enrollHeader = {
  marginBottom: 24,
};

const enrollTitle = {
  fontSize: 22,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 6,
};

const enrollSubtitle = {
  fontSize: 14,
  color: "#64748b",
};

const enrollForm = {
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const selectWrapper = {
  flex: 1,
  minWidth: 300,
};

const selectStyle = {
  width: "100%",
  padding: "14px 16px",
  fontSize: 15,
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  background: "#f8fafc",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontFamily: "inherit",
  outline: "none",
};

const enrollButton = {
  padding: "14px 32px",
  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  display: "flex",
  alignItems: "center",
  gap: 10,
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
  whiteSpace: "nowrap",
};

const buttonSpinner = {
  width: 16,
  height: 16,
  border: "2px solid rgba(255,255,255,0.3)",
  borderTop: "2px solid #fff",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

const errorMessage = {
  marginTop: 16,
  padding: 12,
  background: "#fee2e2",
  color: "#dc2626",
  borderRadius: 10,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 500,
};

const coursesSection = {
  marginTop: 40,
};

const sectionTitle = {
  fontSize: 26,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 24,
};

const courseCount = {
  fontSize: 20,
  color: "#64748b",
  fontWeight: 500,
};

const emptyState = {
  textAlign: "center",
  padding: "80px 40px",
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
};

const emptyIcon = {
  fontSize: 64,
  color: "#cbd5e1",
  marginBottom: 20,
};

const emptyTitle = {
  fontSize: 24,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 8,
};

const emptyText = {
  fontSize: 16,
  color: "#64748b",
};

const coursesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
  gap: 28,
};

const courseCard = {
  background: "#fff",
  borderRadius: 20,
  padding: 28,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  border: "1px solid #e2e8f0",
  transition: "all 0.3s ease",
  display: "flex",
  flexDirection: "column",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  flexWrap: "wrap",
  gap: 10,
};

const statusBadge = (status) => ({
  background: status.bg,
  color: status.color,
  padding: "8px 16px",
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  gap: 6,
  textTransform: "uppercase",
  letterSpacing: 0.5,
});

const statusIcon = {
  fontSize: 14,
};

const durationBadge = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  color: "#64748b",
  fontSize: 14,
  fontWeight: 600,
};

const badgeIcon = {
  fontSize: 13,
};

const cardBody = {
  flex: 1,
  marginBottom: 20,
};

const courseTitle = {
  fontSize: 22,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 12,
  lineHeight: 1.4,
};

const courseDescription = {
  color: "#64748b",
  fontSize: 15,
  lineHeight: 1.7,
  marginBottom: 12,
};

const dateInfo = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#64748b",
  fontSize: 14,
  fontWeight: 500,
  marginTop: 12,
};

const dateIcon = {
  fontSize: 13,
  color: "#94a3b8",
};

const progressSection = {
  marginBottom: 20,
};

const progressHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
};

const progressLabel = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  fontWeight: 600,
  color: "#475569",
};

const progressIcon = {
  fontSize: 14,
  color: "#0284c7",
};

const progressPercentage = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
};

const progressBarContainer = {
  marginTop: 8,
};

const progressBarTrack = {
  width: "100%",
  height: 12,
  background: "#e2e8f0",
  borderRadius: 10,
  overflow: "hidden",
  position: "relative",
};

const progressBarFill = {
  height: "100%",
  borderRadius: 10,
  transition: "width 0.5s ease",
  position: "relative",
};

const viewButton = {
  width: "100%",
  padding: "14px 20px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
};

const buttonArrow = {
  fontSize: 14,
  transition: "transform 0.3s ease",
};

export default StudentCoursesPage;
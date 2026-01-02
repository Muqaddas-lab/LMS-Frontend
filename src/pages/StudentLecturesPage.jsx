import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import {
  getLecturesByCourse,
  getProgress,
  trackLectureProgress,
} from "../api/api";
import { FaCheckCircle, FaFilePdf, FaClock, FaPlay, FaFileExcel, FaFileWord, FaFile } from "react-icons/fa";
import { getUserId, isAuthenticated } from "../utils/auth";

// Note: Make sure StudentSidebar is exported as default export
// Example: export default StudentSidebar;

const StudentLecturesPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lectures, setLectures] = useState([]);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [lectureProgress, setLectureProgress] = useState({});
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const studentId = getUserId();

  // 🔹 Fetch lectures & progress
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const lectureData = await getLecturesByCourse(courseId);
        setLectures(lectureData || []);
        setSelectedLecture(lectureData?.[0] || null);

        // Fetch progress from backend
        const progressRes = await getProgress(studentId, courseId);
        
        // Extract completed lecture IDs
        const completed = progressRes?.progress?.completedLectures?.map((l) => l._id) || 
                         progressRes?.completedLectures?.map((l) => l._id || l) || [];

        setCompletedLectures(completed);

        // Set progress percentages for each lecture
        const progressData = {};
        if (progressRes?.progress?.completedLectures) {
          progressRes.progress.completedLectures.forEach((lecture) => {
            progressData[lecture._id || lecture] = 100;
          });
        }
        setLectureProgress(progressData);

        // Check if course is completed
        if (lectureData && completed.length === lectureData.length && lectureData.length > 0) {
          setCourseCompleted(true);
        }
      } catch (error) {
        console.error("Error loading lectures", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, studentId, navigate]);

  // 🔹 Format time display (mm:ss)
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 🔹 Calculate progress percentage
  const getProgressPercentage = (lectureId) => {
    if (completedLectures.includes(lectureId)) return 100;
    return lectureProgress[lectureId] || 0;
  };

  // 🔹 Update lecture progress in real-time
  const handleVideoTimeUpdate = (e, lectureId) => {
    const current = e.target.currentTime;
    const duration = e.target.duration;

    setCurrentVideoTime(current);
    setVideoDuration(duration);

    if (duration && duration > 0) {
      const progressPercent = (current / duration) * 100;
      
      setLectureProgress((prev) => ({
        ...prev,
        [lectureId]: progressPercent,
      }));

      // Auto-complete when last 10 seconds reached
      if (
        duration - current <= 10 &&
        !completedLectures.includes(lectureId)
      ) {
        handleAutoComplete(lectureId);
      }
    }
  };

  // 🔹 Auto complete lecture and save to backend
  const handleAutoComplete = async (lectureId) => {
    if (completedLectures.includes(lectureId)) return;

    try {
      console.log("📤 Saving progress to backend:", {
        studentId,
        courseId,
        lectureId,
      });

      // Save to backend
      const response = await trackLectureProgress(studentId, courseId, lectureId);
      
      console.log("✅ Progress saved successfully:", response);

      // Update local state
      setCompletedLectures((prev) => {
        const updated = [...new Set([...prev, lectureId])];

        if (updated.length === lectures.length) {
          setCourseCompleted(true);
        }

        return updated;
      });

      // Update progress to 100%
      setLectureProgress((prev) => ({
        ...prev,
        [lectureId]: 100,
      }));

    } catch (error) {
      console.error("❌ Auto completion failed:", error.response?.data || error.message);
      alert("Failed to save progress. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#4b5563" }}>
              Loading lectures...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <StudentSidebar />

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          marginLeft: "250px",
          padding: "20px",
          display: "flex",
          gap: "20px",
        }}
      >
        {/* LEFT – LECTURE LIST */}
        <div
          style={{
            width: "320px",
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            height: "calc(100vh - 40px)",
            overflowY: "auto",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "700", color: "#111827" }}>
            Course Lectures
          </h3>

          {lectures.map((lecture, index) => {
            const isCompleted = completedLectures.includes(lecture._id);
            const progress = getProgressPercentage(lecture._id);
            const isSelected = selectedLecture?._id === lecture._id;

            return (
              <div
                key={lecture._id}
                onClick={() => setSelectedLecture(lecture)}
                style={{
                  padding: "14px",
                  marginBottom: "12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  background: isSelected ? "#eff6ff" : "#ffffff",
                  border: `2px solid ${isSelected ? "#3b82f6" : "#e5e7eb"}`,
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Progress Background */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${progress}%`,
                    background: isCompleted
                      ? "linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%)"
                      : "linear-gradient(90deg, #fee2e2 0%, #fecaca 100%)",
                    transition: "width 0.3s ease",
                    zIndex: 0,
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ fontWeight: "700", fontSize: "14px", color: "#374151" }}>
                      Lecture {lecture.lectureNumber || index + 1}
                    </div>
                    
                    {isCompleted && (
                      <FaCheckCircle style={{ color: "#10b981", fontSize: "18px" }} />
                    )}
                  </div>

                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px", fontWeight: "500" }}>
                    {lecture.title}
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      background: "#e5e7eb",
                      borderRadius: "10px",
                      overflow: "hidden",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: isCompleted
                          ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                          : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                        transition: "width 0.3s ease",
                        borderRadius: "10px",
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                    {isCompleted ? (
                      <span style={{ color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FaCheckCircle /> Completed
                      </span>
                    ) : progress > 0 ? (
                      <span style={{ color: "#ef4444", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FaPlay style={{ fontSize: "10px" }} /> In Progress ({Math.round(progress)}%)
                      </span>
                    ) : (
                      <span style={{ color: "#9ca3af", fontWeight: "500" }}>
                        Not Started
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CENTER – VIDEO PLAYER */}
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {selectedLecture ? (
            <>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
                  {selectedLecture.title}
                </h2>

                <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6", marginBottom: "12px" }}>
                  {selectedLecture.description}
                </p>

                {/* Lecture Stats */}
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  {videoDuration > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "14px" }}>
                      <FaClock />
                      <span>{formatTime(currentVideoTime)} / {formatTime(videoDuration)}</span>
                    </div>
                  )}

                  {completedLectures.includes(selectedLecture._id) && (
                    <div
                      style={{
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FaCheckCircle /> Completed
                    </div>
                  )}
                </div>
              </div>

              {/* VIDEO PLAYER */}
              {selectedLecture.videoPath && (
                <div style={{ marginBottom: "20px" }}>
                  <video
                    key={selectedLecture._id}
                    controls
                    onTimeUpdate={(e) => handleVideoTimeUpdate(e, selectedLecture._id)}
                    onLoadedMetadata={(e) => setVideoDuration(e.target.duration)}
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      background: "#000",
                    }}
                  >
                    <source
                      src={`http://localhost:5000/${selectedLecture.videoPath}`}
                    />
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Progress Indicator */}
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px 16px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "#6b7280" }}>
                      <span style={{ fontWeight: "600" }}>Lecture Progress</span>
                      <span style={{ fontWeight: "700", color: completedLectures.includes(selectedLecture._id) ? "#10b981" : "#ef4444" }}>
                        {Math.round(getProgressPercentage(selectedLecture._id))}%
                      </span>
                    </div>
                    
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "#e5e7eb",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${getProgressPercentage(selectedLecture._id)}%`,
                          height: "100%",
                          background: completedLectures.includes(selectedLecture._id)
                            ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                            : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                          transition: "width 0.3s ease",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PDF VIEWER - Embedded */}
              {selectedLecture.pdfPath && (
                <div style={{ marginTop: "20px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151"
                    }}>
                      <FaFilePdf style={{ color: "#ef4444", fontSize: "20px" }} />
                      <span>Lecture Notes (PDF)</span>
                    </div>
                    <a
                      href={`http://localhost:5000/${selectedLecture.pdfPath}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "8px 16px",
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Open in New Tab
                    </a>
                  </div>
                  <iframe
                    src={`http://localhost:5000/${selectedLecture.pdfPath}#toolbar=0`}
                    style={{
                      width: "100%",
                      height: "600px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    title="PDF Viewer"
                  />
                </div>
              )}

              {/* EXCEL/CSV VIEWER - With Open Option */}
              {(selectedLecture.excelPath || selectedLecture.csvPath) && (
                <div style={{ marginTop: "20px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#374151"
                    }}>
                      <FaFileExcel style={{ color: "#10b981", fontSize: "20px" }} />
                      <span>{selectedLecture.excelPath ? 'Excel File' : 'CSV File'}</span>
                    </div>
                    <a
                      href={`http://localhost:5000/${selectedLecture.excelPath || selectedLecture.csvPath}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: "8px 16px",
                        background: "#10b981",
                        color: "#fff",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Open File
                    </a>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      padding: "24px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      background: "#f9fafb",
                      textAlign: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    <FaFileExcel style={{ fontSize: "64px", color: "#10b981", marginBottom: "16px" }} />
                    <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "12px" }}>
                      Excel/CSV files cannot be previewed directly in the browser.
                    </p>
                    <p style={{ fontSize: "14px", color: "#9ca3af" }}>
                      Click "Open File" button above to view or download the file.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
              <FaPlay style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.5 }} />
              <p style={{ fontSize: "16px", fontWeight: "500" }}>Select a lecture to start learning</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLecturesPage;
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import StudentSidebar from "../components/StudentSidebar";
// import { getAllExams, getAttemptsByUser } from "../api/api";
// import { FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// const StudentExamsPage = () => {
//   const [exams, setExams] = useState([]);
//   const [attempts, setAttempts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const getStudentId = () => {
//     try {
//       const userInfo = localStorage.getItem("userInfo");
//       if (!userInfo) return null;
//       const user = JSON.parse(userInfo);
//       return user?.id || user?._id || user?.user?._id || user?.userId || null;
//     } catch (err) {
//       console.error("Error parsing user info:", err);
//       return null;
//     }
//   };

//   const studentId = getStudentId();

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!studentId) {
//         setError("Unable to identify student. Please login again.");
//         setLoading(false);
//         return;
//       }
//       try {
//         setLoading(true);
//         const examsData = await getAllExams();
//         const attemptsData = await getAttemptsByUser(studentId);
        
//         setExams(examsData.exams || []);
//         setAttempts(attemptsData.attempts || attemptsData || []);
        
//         // Debug log
//         console.log("📊 Exams loaded:", examsData.exams?.length || 0);
//         console.log("📊 Attempts loaded:", attemptsData.attempts?.length || 0);
//       } catch (err) {
//         console.error("Error fetching exams/attempts:", err);
//         setError("Failed to load exams. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [studentId]);

//   // ✅ Find attempt for specific exam
//   const getAttempt = (exam) => {
//     const attempt = attempts.find(a => {
//       const attemptExamId = a.exam?._id || a.exam;
//       return attemptExamId === exam._id;
//     });
    
//     if (attempt) {
//       console.log(`🔍 Found attempt for exam ${exam.title}:`, {
//         score: attempt.score,
//         passed: attempt.passed,
//         examPassingMarks: exam.passingMarks
//       });
//     }
    
//     return attempt;
//   };

//   // ✅ Get exam status based on attempt and passing marks
//   const getExamStatus = (exam) => {
//     const attempt = getAttempt(exam);
//     if (!attempt) return "Pending";
    
//     // Use passed field from backend (most reliable)
//     if (attempt.passed !== undefined) {
//       console.log(`✅ Using backend passed field for ${exam.title}: ${attempt.passed ? "PASS" : "FAIL"}`);
//       return attempt.passed ? "PASS" : "FAIL";
//     }
    
//     // Fallback calculation (match backend logic)
//     const passingMarks = exam.passingMarks !== undefined && exam.passingMarks !== null
//       ? Math.min(exam.passingMarks, exam.totalMarks || 0)
//       : Math.ceil((exam.totalMarks || 0) * 0.5);
    
//     const isPassed = attempt.score >= passingMarks;
    
//     console.log(`📊 Fallback calculation for ${exam.title}:`, {
//       score: attempt.score,
//       passingMarks,
//       isPassed,
//       examPassingMarks: exam.passingMarks,
//       examTotalMarks: exam.totalMarks
//     });
    
//     return isPassed ? "PASS" : "FAIL";
//   };

//   const getAttemptScore = (exam) => getAttempt(exam)?.score ?? null;

//   const statusColors = {
//     Pending: "#f59e0b",
//     PASS: "#10b981",
//     FAIL: "#ef4444",
//   };

//   const ExamCard = ({ exam }) => {
//     const status = getExamStatus(exam);
//     const score = getAttemptScore(exam);
//     const statusColor = statusColors[status];
//     const attempt = getAttempt(exam);

//     const cardStyle = {
//       background: "#fff",
//       borderRadius: "16px",
//       padding: "30px",
//       boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
//       border: status !== "Pending" ? `3px solid ${statusColor}` : "1px solid #e5e7eb",
//       position: "relative",
//       transition: "transform 0.2s, box-shadow 0.2s",
//       cursor: "pointer",
//     };

//     const buttonStyle = {
//       width: "100%",
//       padding: "14px",
//       background: status === "Pending" ? "#3b82f6" : "#6b7280",
//       color: "#fff",
//       border: "none",
//       borderRadius: "10px",
//       fontWeight: 600,
//       cursor: status === "Pending" ? "pointer" : "not-allowed",
//       fontSize: "15px",
//       transition: "background 0.2s",
//     };

//     // Calculate correct passing marks for display
//     const calculatePassingMarks = (exam) => {
//       return exam.passingMarks !== undefined && exam.passingMarks !== null
//         ? Math.min(exam.passingMarks, exam.totalMarks || 0)
//         : Math.ceil((exam.totalMarks || 0) * 0.5);
//     };

//     const passingMarks = calculatePassingMarks(exam);

//     return (
//       <div
//         style={cardStyle}
//         onMouseEnter={e => { 
//           if (status === "Pending") {
//             e.currentTarget.style.transform = "translateY(-5px)"; 
//             e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)"; 
//           }
//         }}
//         onMouseLeave={e => { 
//           e.currentTarget.style.transform = "translateY(0)"; 
//           e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)"; 
//         }}
//       >
//         {/* Status Badge */}
//         <div style={{
//           position: "absolute",
//           top: "20px",
//           right: "20px",
//           background: statusColor + "20",
//           color: statusColor,
//           padding: "8px 14px",
//           borderRadius: "14px",
//           fontSize: "13px",
//           fontWeight: 600,
//           display: "flex",
//           alignItems: "center",
//           gap: "5px"
//         }}>
//           {status === "PASS" && <FaCheckCircle />}
//           {status === "FAIL" && <FaTimesCircle />}
//           {status}
//         </div>

//         {/* Exam Title */}
//         <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginBottom: "14px", marginTop: "10px" }}>
//           {exam.title}
//         </h3>

//         {/* Description */}
//         <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "24px", lineHeight: 1.6 }}>
//           {exam.description || "No description available"}
//         </p>

//         {/* Exam Details */}
//         <div style={{ 
//           display: "grid", 
//           gridTemplateColumns: "1fr 1fr 1fr 1fr", 
//           gap: "16px", 
//           marginBottom: "24px", 
//           padding: "18px", 
//           background: "#f9fafb", 
//           borderRadius: "12px" 
//         }}>
//           <div>
//             <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>Duration</div>
//             <div style={{ fontSize: "17px", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: "5px" }}>
//               <FaClock size={16} /> {exam.duration} min
//             </div>
//           </div>
//           <div>
//             <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>Total Marks</div>
//             <div style={{ fontSize: "17px", fontWeight: 600, color: "#374151" }}>{exam.totalMarks}</div>
//           </div>
//           <div>
//             <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>Passing Marks</div>
//             <div style={{ fontSize: "17px", fontWeight: 600, color: "#374151" }}>
//               {exam.passingMarks !== undefined && exam.passingMarks !== null 
//                 ? exam.passingMarks 
//                 : Math.ceil((exam.totalMarks || 0) * 0.5)
//               }
//             </div>
//           </div>
//           <div>
//             <div style={{ fontSize: "13px", color: statusColor, marginBottom: "6px" }}>Your Score</div>
//             <div style={{ fontSize: "17px", fontWeight: 600, color: statusColor }}>
//               {score !== null ? `${score} / ${exam.totalMarks}` : `- / ${exam.totalMarks}`}
//             </div>
//           </div>
//         </div>

//         {/* Result Summary (only shown after attempt) */}
//         {status !== "Pending" && (
//           <div style={{
//             padding: "16px",
//             borderRadius: "10px",
//             background: status === "PASS" ? "#d1fae5" : "#fee2e2",
//             marginBottom: "16px"
//           }}>
//             <div style={{ 
//               fontSize: "14px", 
//               color: status === "PASS" ? "#065f46" : "#991b1b",
//               fontWeight: 600,
//               display: "flex",
//               alignItems: "center",
//               gap: "8px"
//             }}>
//               {status === "PASS" ? <FaCheckCircle /> : <FaTimesCircle />}
//               {status === "PASS" 
//                 ? `Congratulations! You passed with ${score}/${exam.totalMarks} marks`
//                 : `You scored ${score}/${exam.totalMarks}. Need ${passingMarks} to pass.`
//               }
//             </div>
//             {status === "FAIL" && attempt && (
//               <div style={{ 
//                 fontSize: "12px", 
//                 color: "#991b1b",
//                 marginTop: "8px",
//                 fontStyle: "italic"
//               }}>
//                 {attempt.passed !== undefined 
//                   ? `(Backend marked as: ${attempt.passed ? "PASS" : "FAIL"})`
//                   : `(Calculated: ${score >= passingMarks ? "PASS" : "FAIL"})`
//                 }
//               </div>
//             )}
//           </div>
//         )}

//         {/* Action Button */}
//         <button
//           style={buttonStyle}
//           disabled={status !== "Pending"}
//           onClick={() => {
//             if (status === "Pending") {
//               navigate(`/student/exams/${exam._id}`);
//             } else {
//               // If already attempted, show a message or navigate to result view
//               alert(`You have already ${status === "PASS" ? "passed" : "attempted"} this exam.`);
//             }
//           }}
//           onMouseEnter={e => { if (status === "Pending") e.currentTarget.style.background = "#2563eb"; }}
//           onMouseLeave={e => { if (status === "Pending") e.currentTarget.style.background = "#3b82f6"; }}
//         >
//           {status === "Pending" ? "Start Exam" : "View Result"}
//         </button>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div style={{ display: "flex", minHeight: "100vh" }}>
//         <StudentSidebar />
//         <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
//           <p style={{ fontSize: "18px", color: "#6b7280" }}>Loading exams...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!studentId) {
//     return (
//       <div style={{ display: "flex", minHeight: "100vh" }}>
//         <StudentSidebar />
//         <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
//           <div style={{ textAlign: "center" }}>
//             <h2 style={{ color: "#ef4444", marginBottom: "10px" }}>Authentication Error</h2>
//             <p style={{ color: "#6b7280", marginBottom: "20px" }}>{error}</p>
//             <button
//               onClick={() => navigate("/login")}
//               style={{
//                 padding: "12px 24px",
//                 background: "#3b82f6",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: 8,
//                 cursor: "pointer",
//                 fontSize: 16,
//                 fontWeight: 600
//               }}
//             >
//               Go to Login
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
//       <StudentSidebar />
//       <div style={{ flex: 1, marginLeft: "250px", padding: "40px" }}>
//         <div style={{ marginBottom: "40px" }}>
//           <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#111827" }}>📝 Mock Exams</h1>
//           <p style={{ color: "#6b7280", marginTop: "10px", fontSize: "16px" }}>
//             Test your knowledge and track your progress
//           </p>
//         </div>

//         {error && (
//           <div style={{
//             background: "#fee2e2",
//             color: "#dc2626",
//             padding: 18,
//             borderRadius: 10,
//             marginBottom: 30,
//             border: "1px solid #fca5a5"
//           }}>
//             {error}
//           </div>
//         )}

//         {exams.length === 0 ? (
//           <div style={{ 
//             background: "#fff", 
//             padding: "80px 30px", 
//             borderRadius: "16px", 
//             textAlign: "center", 
//             boxShadow: "0 4px 8px rgba(0,0,0,0.1)" 
//           }}>
//             <FaClipboardList size={60} color="#9ca3af" style={{ marginBottom: "20px" }} />
//             <h3 style={{ color: "#374151", fontSize: "22px", marginBottom: "8px" }}>No Exams Available</h3>
//             <p style={{ color: "#6b7280", fontSize: "16px" }}>
//               Exams will appear here once your instructor creates them.
//             </p>
//           </div>
//         ) : (
//           <div style={{ 
//             display: "grid", 
//             gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", 
//             gap: "28px" 
//           }}>
//             {exams.map(exam => <ExamCard key={exam._id} exam={exam} />)}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StudentExamsPage;












//##############################################//
//---------------------Time set--------------------//


















import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import { getAllExams, getAttemptsByUser } from "../api/api";
import { FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const StudentExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getStudentId = () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) return null;
      const user = JSON.parse(userInfo);
      return user?.id || user?._id || user?.user?._id || user?.userId || null;
    } catch (err) {
      console.error("Error parsing user info:", err);
      return null;
    }
  };

  const studentId = getStudentId();

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        setError("Unable to identify student. Please login again.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const examsData = await getAllExams();
        const attemptsData = await getAttemptsByUser(studentId);
        
        setExams(examsData.exams || []);
        setAttempts(attemptsData.attempts || attemptsData || []);
        
        console.log("📊 Exams loaded:", examsData.exams?.length || 0);
        console.log("📊 Attempts loaded:", attemptsData.attempts?.length || 0);
      } catch (err) {
        console.error("Error fetching exams/attempts:", err);
        setError("Failed to load exams. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  // ✅ Find attempt for specific exam
  const getAttempt = (exam) => {
    const attempt = attempts.find(a => {
      const attemptExamId = a.exam?._id || a.exam;
      return attemptExamId === exam._id;
    });
    
    if (attempt) {
      console.log(`🔍 Found attempt for exam ${exam.title}:`, {
        score: attempt.score,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt || attempt.createdAt
      });
    }
    
    return attempt;
  };

  // ✅ Get exam status based on attempt and passing marks
  const getExamStatus = (exam) => {
    const attempt = getAttempt(exam);
    if (!attempt) return "Pending";
    
    // Use passed field from backend (most reliable)
    if (attempt.passed !== undefined) {
      console.log(`✅ Using backend passed field for ${exam.title}: ${attempt.passed ? "PASS" : "FAIL"}`);
      return attempt.passed ? "PASS" : "FAIL";
    }
    
    // Fallback calculation (match backend logic)
    const passingMarks = exam.passingMarks !== undefined && exam.passingMarks !== null
      ? Math.min(exam.passingMarks, exam.totalMarks || 0)
      : Math.ceil((exam.totalMarks || 0) * 0.5);
    
    const isPassed = attempt.score >= passingMarks;
    
    console.log(`📊 Fallback calculation for ${exam.title}:`, {
      score: attempt.score,
      passingMarks,
      isPassed,
      examPassingMarks: exam.passingMarks,
      examTotalMarks: exam.totalMarks
    });
    
    return isPassed ? "PASS" : "FAIL";
  };

  const getAttemptScore = (exam) => getAttempt(exam)?.score ?? null;

  const statusColors = {
    Pending: "#f59e0b",
    PASS: "#10b981",
    FAIL: "#ef4444",
  };

  const ExamCard = ({ exam }) => {
    const status = getExamStatus(exam);
    const score = getAttemptScore(exam);
    const statusColor = statusColors[status];
    const attempt = getAttempt(exam);
    
    // ✅ NEW: Calculate cooldown
    const [cooldownInfo, setCooldownInfo] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
      if (attempt && !attempt.passed) {
        const lastAttemptTime = new Date(attempt.submittedAt || attempt.createdAt);
        const now = new Date();
        const hoursSinceLastAttempt = (now - lastAttemptTime) / (1000 * 60 * 60);
        
        if (hoursSinceLastAttempt < 24) {
          const hoursRemaining = 24 - hoursSinceLastAttempt;
          const nextAttemptTime = new Date(lastAttemptTime.getTime() + (24 * 60 * 60 * 1000));
          
          setCooldownInfo({
            hoursRemaining: Math.ceil(hoursRemaining),
            nextAttemptTime: nextAttemptTime
          });
          
          // Calculate total seconds remaining
          const totalSeconds = Math.ceil(hoursRemaining * 60 * 60);
          setTimeLeft(totalSeconds);
        }
      }
    }, [attempt]);

    // Timer for cooldown
    useEffect(() => {
      if (!timeLeft || timeLeft <= 0) {
        if (cooldownInfo) {
          setCooldownInfo(null);
        }
        return;
      }
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCooldownInfo(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }, [timeLeft, cooldownInfo]);

    const formatCooldownTime = (seconds) => {
      if (!seconds) return "00:00:00";
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const cardStyle = {
      background: "#fff",
      borderRadius: "16px",
      padding: "30px",
      boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
      border: status !== "Pending" ? `3px solid ${statusColor}` : "1px solid #e5e7eb",
      position: "relative",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: cooldownInfo ? "not-allowed" : "pointer",
      opacity: cooldownInfo ? 0.7 : 1
    };

    const buttonStyle = {
      width: "100%",
      padding: "14px",
      background: cooldownInfo ? "#9ca3af" : (status === "Pending" ? "#3b82f6" : "#6b7280"),
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontWeight: 600,
      cursor: cooldownInfo ? "not-allowed" : (status === "Pending" ? "pointer" : "not-allowed"),
      fontSize: "15px",
      transition: "background 0.2s",
    };

    // Calculate correct passing marks for display
    const calculatePassingMarks = (exam) => {
      return exam.passingMarks !== undefined && exam.passingMarks !== null
        ? Math.min(exam.passingMarks, exam.totalMarks || 0)
        : Math.ceil((exam.totalMarks || 0) * 0.5);
    };

    const passingMarks = calculatePassingMarks(exam);

    return (
      <div
        style={cardStyle}
        onMouseEnter={e => { 
          if (status === "Pending" && !cooldownInfo) {
            e.currentTarget.style.transform = "translateY(-5px)"; 
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)"; 
          }
        }}
        onMouseLeave={e => { 
          e.currentTarget.style.transform = "translateY(0)"; 
          e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)"; 
        }}
      >
        {/* Status Badge */}
        <div style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: statusColor + "20",
          color: statusColor,
          padding: "8px 14px",
          borderRadius: "14px",
          fontSize: "13px",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "5px"
        }}>
          {status === "PASS" && <FaCheckCircle />}
          {status === "FAIL" && <FaTimesCircle />}
          {status}
        </div>

        {/* Cooldown Timer */}
        {cooldownInfo && (
          <div style={{
            position: "absolute",
            top: "60px",
            right: "20px",
            background: "#f59e0b",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}>
            ⏳ {formatCooldownTime(timeLeft)}
          </div>
        )}

        {/* Exam Title */}
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginBottom: "14px", marginTop: "10px" }}>
          {exam.title}
        </h3>

        {/* Description */}
        <p style={{ color: "#6b7280", fontSize: "15px", marginBottom: "24px", lineHeight: 1.6 }}>
          {exam.description || "No description available"}
        </p>

        {/* Exam Details */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr 1fr 1fr", 
          gap: "16px", 
          marginBottom: "24px", 
          padding: "18px", 
          background: "#f9fafb", 
          borderRadius: "12px" 
        }}>
          <div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>Duration</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: "5px" }}>
              <FaClock size={16} /> {exam.duration} min
            </div>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>Total Marks</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#374151" }}>{exam.totalMarks}</div>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>Passing Marks</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#374151" }}>
              {exam.passingMarks !== undefined && exam.passingMarks !== null 
                ? exam.passingMarks 
                : Math.ceil((exam.totalMarks || 0) * 0.5)
              }
            </div>
          </div>
          <div>
            <div style={{ fontSize: "13px", color: statusColor, marginBottom: "6px" }}>Your Score</div>
            <div style={{ fontSize: "17px", fontWeight: 600, color: statusColor }}>
              {score !== null ? `${score} / ${exam.totalMarks}` : `- / ${exam.totalMarks}`}
            </div>
          </div>
        </div>

        {/* Result Summary (only shown after attempt) */}
        {status !== "Pending" && (
          <div style={{
            padding: "16px",
            borderRadius: "10px",
            background: status === "PASS" ? "#d1fae5" : "#fee2e2",
            marginBottom: "16px"
          }}>
            <div style={{ 
              fontSize: "14px", 
              color: status === "PASS" ? "#065f46" : "#991b1b",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              {status === "PASS" ? <FaCheckCircle /> : <FaTimesCircle />}
              {status === "PASS" 
                ? `Congratulations! You passed with ${score}/${exam.totalMarks} marks`
                : `You scored ${score}/${exam.totalMarks}. Need ${passingMarks} to pass.`
              }
            </div>
            {status === "FAIL" && attempt && (
              <div style={{ 
                fontSize: "12px", 
                color: "#991b1b",
                marginTop: "8px",
                fontStyle: "italic"
              }}>
                {attempt.passed !== undefined 
                  ? `(Backend marked as: ${attempt.passed ? "PASS" : "FAIL"})`
                  : `(Calculated: ${score >= passingMarks ? "PASS" : "FAIL"})`
                }
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          style={buttonStyle}
          disabled={status !== "Pending" || cooldownInfo}
          onClick={() => {
            if (cooldownInfo) {
              alert(`⏳ Please wait ${formatCooldownTime(timeLeft)} before attempting again.`);
              return;
            }
            
            if (status === "Pending") {
              navigate(`/student/exams/${exam._id}`);
            } else {
              alert(`You have already ${status === "PASS" ? "passed" : "attempted"} this exam.`);
            }
          }}
          onMouseEnter={e => { 
            if (status === "Pending" && !cooldownInfo) {
              e.currentTarget.style.background = "#2563eb"; 
            }
          }}
          onMouseLeave={e => { 
            if (status === "Pending" && !cooldownInfo) {
              e.currentTarget.style.background = "#3b82f6"; 
            }
          }}
        >
          {cooldownInfo ? `Wait ${formatCooldownTime(timeLeft)}` : 
           (status === "Pending" ? "Start Exam" : "View Result")}
        </button>

        {/* Cooldown Message */}
        {cooldownInfo && (
          <div style={{
            marginTop: "12px",
            padding: "10px",
            background: "#fef3c7",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#92400e",
            textAlign: "center"
          }}>
            ⏳ Next attempt available after {formatCooldownTime(timeLeft)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p style={{ fontSize: "18px", color: "#6b7280" }}>Loading exams...</p>
        </div>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "#ef4444", marginBottom: "10px" }}>Authentication Error</h2>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>{error}</p>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "12px 24px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600
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
      <div style={{ flex: 1, marginLeft: "250px", padding: "40px" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#111827" }}>📝 Mock Exams</h1>
          <p style={{ color: "#6b7280", marginTop: "10px", fontSize: "16px" }}>
            Test your knowledge and track your progress
          </p>
        </div>

        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: 18,
            borderRadius: 10,
            marginBottom: 30,
            border: "1px solid #fca5a5"
          }}>
            {error}
          </div>
        )}

        {exams.length === 0 ? (
          <div style={{ 
            background: "#fff", 
            padding: "80px 30px", 
            borderRadius: "16px", 
            textAlign: "center", 
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)" 
          }}>
            <FaClipboardList size={60} color="#9ca3af" style={{ marginBottom: "20px" }} />
            <h3 style={{ color: "#374151", fontSize: "22px", marginBottom: "8px" }}>No Exams Available</h3>
            <p style={{ color: "#6b7280", fontSize: "16px" }}>
              Exams will appear here once your instructor creates them.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", 
            gap: "28px" 
          }}>
            {exams.map(exam => <ExamCard key={exam._id} exam={exam} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExamsPage;
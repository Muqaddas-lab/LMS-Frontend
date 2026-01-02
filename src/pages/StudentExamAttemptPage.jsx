// import React, { useEffect, useState, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import StudentSidebar from "../components/StudentSidebar";
// import { getExamById, getQuestionsByExam, submitAttempt, getExamStatus } from "../api/api";
// import { FaClock, FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaRedoAlt } from "react-icons/fa";

// const StudentExamAttemptPage = () => {
//   const { examId } = useParams();
//   const navigate = useNavigate();
//   const isSubmitting = useRef(false);

//   const getStudentId = () => {
//     try {
//       const userInfo = localStorage.getItem("userInfo");
//       if (!userInfo) return null;
//       const user = JSON.parse(userInfo);
//       return user?._id || user?.user?._id || user?.id || user?.userId || null;
//     } catch (err) {
//       console.error("Error parsing userInfo:", err);
//       return null;
//     }
//   };

//   const studentId = getStudentId();

//   const [exam, setExam] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [result, setResult] = useState(null);
//   const [examStatus, setExamStatus] = useState(null);

//   // Fetch Exam Status & Check if can attempt
//   useEffect(() => {
//     if (result) return;

//     const checkExamStatus = async () => {
//       if (!studentId) return;

//       try {
//         // ✅ FIXED: Call getExamStatus only ONCE
//         const statusData = await getExamStatus(studentId, examId);
//         console.log("Exam status from API:", statusData.data);
//         setExamStatus(statusData.data);

//         // If cannot attempt, redirect back
//         if (!statusData.data.canAttempt) {
//           if (statusData.data.passed) {
//             alert("You have already passed this exam!");
//           } else {
//             alert(`You have used all ${statusData.data.totalAttemptsAllowed} attempts for this exam.`);
//           }
//           navigate("/student/exams");
//           return;
//         }
//       } catch (err) {
//         console.error("Error checking exam status:", err);
//       }
//     };

//     checkExamStatus();
//   }, [studentId, examId, navigate, result]);

//   // Fetch Exam & Questions
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!studentId) {
//         setError("Unable to identify student. Please login again.");
//         setLoading(false);
//         return;
//       }
//       try {
//         setError("");
//         const examRes = await getExamById(examId);
//         setExam(examRes.exam);

//         if (examRes.exam?.duration) {
//           setTimeLeft(examRes.exam.duration * 60);
//         }

//         const qs = await getQuestionsByExam(examId);
//         setQuestions(qs || []);
//         if (!qs || qs.length === 0) {
//           setError("No questions available for this exam.");
//         }
//       } catch (err) {
//         console.error("Error fetching exam:", err);
//         setError("Failed to load exam. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [examId, studentId]);

//   // Timer countdown with auto-submit
//   useEffect(() => {
//     if (result) return;

//     if (timeLeft <= 0 && questions.length > 0 && !isSubmitting.current) {
//       handleSubmit(true);
//       return;
//     }

//     const timer = setInterval(() => {
//       setTimeLeft(prev => Math.max(prev - 1, 0));
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeLeft, questions, result]);

//   const handleAnswerChange = (qid, value) => {
//     setAnswers(prev => ({ ...prev, [qid]: value }));
//   };

//   const formatTime = sec => {
//     const mins = Math.floor(sec / 60);
//     const secs = sec % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
//   };

//   const getAnsweredCount = () => Object.keys(answers).filter(k => answers[k]).length;

//   const handleSubmit = async (isAutoSubmit = false) => {
//     if (!studentId) {
//       alert("Unable to identify student. Please login again.");
//       navigate("/login");
//       return;
//     }

//     if (!questions.length) {
//       alert("No questions to submit.");
//       return;
//     }

//     if (isSubmitting.current) return;

//     if (!isAutoSubmit) {
//       const unanswered = questions.filter(q => !answers[q._id]);
//       if (unanswered.length > 0) {
//         const proceed = window.confirm(
//           `You have ${unanswered.length} unanswered question(s). Submit anyway?`
//         );
//         if (!proceed) return;
//       }
//     }

//     const answersArray = questions.map(q => ({
//       questionId: q._id,
//       selectedOption: answers[q._id] || null,
//     }));

//     isSubmitting.current = true;

//     try {
//       // Submit attempt
//       const res = await submitAttempt({
//         userId: studentId,
//         examId,
//         answers: answersArray,
//       });

//       console.log("Submit response from backend:", res.data);

//       const resultData = res.data;

//       setResult({
//         score: resultData.score,
//         totalMarks: resultData.totalMarks,
//         passingMarks: resultData.passingMarks,
//         passed: resultData.passed,
//         status: resultData.status,
//         attemptNumber: resultData.attemptNumber,
//         attemptsLeft: resultData.attemptsLeft,
//         totalAttemptsAllowed: resultData.totalAttemptsAllowed,
//       });

//       setTimeLeft(0);
      
//       // Also update exam status after submission
//       const updatedStatus = await getExamStatus(studentId, examId);
//       setExamStatus(updatedStatus.data);
      
//     } catch (err) {
//       console.error("Submit error:", err.response?.data || err);
//       alert(err.response?.data?.message || "Failed to submit exam.");
//       isSubmitting.current = false;
//     }
//   };

//   const handleRetry = () => {
//     setAnswers({});
//     setTimeLeft(exam.duration * 60);
//     setResult(null);
//     isSubmitting.current = false;
//   };

//   const QuestionCard = ({ q, idx }) => {
//     const selected = answers[q._id];
//     const isDisabled = !!result;

//     return (
//       <div style={{
//         background: "#fff",
//         padding: 24,
//         borderRadius: 12,
//         boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//         border: selected ? "2px solid #10b981" : "1px solid #e5e7eb",
//         marginBottom: 20,
//         opacity: isDisabled ? 0.6 : 1
//       }}>
//         <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
//           Q{idx + 1}. {q.questionText}
//         </h3>
//         <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//           {q.options.map((opt, i) => (
//             <label key={i} style={{
//               display: "flex",
//               alignItems: "center",
//               padding: 12,
//               background: selected === opt ? "#dbeafe" : "#f9fafb",
//               borderRadius: 8,
//               cursor: isDisabled ? "not-allowed" : "pointer",
//               border: selected === opt ? "2px solid #3b82f6" : "1px solid #e5e7eb",
//               transition: "all 0.2s"
//             }}>
//               <input
//                 type="radio"
//                 name={`question_${q._id}`}
//                 value={opt}
//                 checked={selected === opt}
//                 onChange={() => handleAnswerChange(q._id, opt)}
//                 disabled={isDisabled}
//                 style={{ marginRight: 12 }}
//               />
//               <span style={{ fontWeight: selected === opt ? 600 : 400 }}>
//                 {opt}
//               </span>
//             </label>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div style={{ display: "flex", minHeight: "100vh" }}>
//         <StudentSidebar />
//         <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
//           <p style={{ fontSize: "18px", color: "#6b7280" }}>Loading exam...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!exam) {
//     return (
//       <div style={{ display: "flex", minHeight: "100vh" }}>
//         <StudentSidebar />
//         <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
//           <div style={{ textAlign: "center" }}>
//             <FaExclamationCircle size={48} color="#ef4444" />
//             <h2 style={{ marginTop: "16px", color: "#111827" }}>Exam not found</h2>
//             <button
//               onClick={() => navigate("/student/exams")}
//               style={{
//                 marginTop: 16,
//                 padding: "10px 20px",
//                 background: "#3b82f6",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: 8,
//                 cursor: "pointer",
//                 fontWeight: 600
//               }}
//             >
//               Back to Exams
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
//       <StudentSidebar />
//       <div style={{ flex: 1, marginLeft: 250, padding: 30 }}>

//         {/* Result Display */}
//         {result && (
//           <div style={{
//             background: result.passed ? "#d1fae5" : "#fee2e2",
//             border: `2px solid ${result.passed ? "#10b981" : "#ef4444"}`,
//             borderRadius: 12,
//             padding: 30,
//             marginBottom: 24,
//             textAlign: "center"
//           }}>
//             <div style={{
//               fontSize: 48,
//               marginBottom: 16,
//               color: result.passed ? "#10b981" : "#ef4444"
//             }}>
//               {result.passed ? <FaCheckCircle /> : <FaTimesCircle />}
//             </div>
//             <h2 style={{
//               fontSize: 28,
//               fontWeight: 700,
//               color: result.passed ? "#065f46" : "#991b1b",
//               marginBottom: 12
//             }}>
//               {result.passed ? "Congratulations! You Passed!" : "You Did Not Pass"}
//             </h2>
//             <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
//               <span style={{ color: result.passed ? "#065f46" : "#991b1b" }}>
//                 Your Score: {result.score} / {result.totalMarks}
//               </span>
//             </div>
//             <div style={{ fontSize: 16, color: "#6b7280", marginBottom: 12 }}>
//               Passing Marks: {result.passingMarks}
//             </div>

//             {/* Attempts Info */}
//             <div style={{
//               background: "#fff",
//               padding: "16px",
//               borderRadius: "8px",
//               marginBottom: "24px",
//               display: "inline-block"
//             }}>
//               <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
//                 Attempt {result.attemptNumber} of {result.totalAttemptsAllowed}
//               </div>
//               {!result.passed && result.attemptsLeft > 0 && (
//                 <div style={{
//                   fontSize: "16px",
//                   fontWeight: 600,
//                   color: "#f59e0b",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   gap: "8px"
//                 }}>
//                   <FaRedoAlt />
//                   {result.attemptsLeft} attempt(s) remaining
//                 </div>
//               )}
//               {!result.passed && result.attemptsLeft === 0 && (
//                 <div style={{ fontSize: "16px", fontWeight: 600, color: "#ef4444" }}>
//                   No attempts remaining
//                 </div>
//               )}
//             </div>

//             <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
//               <button
//                 onClick={() => navigate("/student/exams")}
//                 style={{
//                   padding: "12px 32px",
//                   background: "#3b82f6",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: 8,
//                   fontSize: 16,
//                   fontWeight: 600,
//                   cursor: "pointer"
//                 }}
//               >
//                 Back to Exams
//               </button>

//               {!result.passed && result.attemptsLeft > 0 && (
//                 <button
//                   onClick={handleRetry}
//                   style={{
//                     padding: "12px 32px",
//                     background: "#f59e0b",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: 8,
//                     fontSize: 16,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "8px"
//                   }}
//                 >
//                   <FaRedoAlt /> Retry Exam
//                 </button>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Exam Header - Only show if not showing result */}
//         {!result && (
//           <div style={{
//             background: "#fff",
//             padding: 24,
//             borderRadius: 12,
//             marginBottom: 24,
//             boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
//           }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <div>
//                 <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
//                   {exam.title}
//                 </h1>
//                 <p style={{ color: "#6b7280" }}>{exam.description}</p>

//                 {/* Show attempt number */}
//                 {examStatus && (
//                   <div style={{
//                     marginTop: "8px",
//                     fontSize: "14px",
//                     color: "#f59e0b",
//                     fontWeight: 600
//                   }}>
//                     Attempt {examStatus.attemptsUsed + 1} of {examStatus.totalAttemptsAllowed || 3}
//                   </div>
//                 )}
//               </div>
//               <div style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 8,
//                 padding: "12px 20px",
//                 background: timeLeft < 300 ? "#fee2e2" : "#dbeafe",
//                 borderRadius: 8,
//                 fontSize: 20,
//                 fontWeight: 700,
//                 color: timeLeft < 300 ? "#dc2626" : "#1e40af"
//               }}>
//                 <FaClock /> {formatTime(timeLeft)}
//               </div>
//             </div>

//             <div style={{
//               marginTop: 16,
//               padding: 12,
//               borderRadius: 8,
//               background: "#f9fafb",
//               display: "flex",
//               gap: 24
//             }}>
//               <div>
//                 <span style={{ fontSize: 14, color: "#6b7280" }}>Total Marks: </span>
//                 <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
//                   {exam.totalMarks}
//                 </span>
//               </div>
//               <div>
//                 <span style={{ fontSize: 14, color: "#6b7280" }}>Passing Marks: </span>
//                 <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
//                   {exam.passingMarks}
//                 </span>
//               </div>
//             </div>

//             <div style={{ marginTop: 16, padding: 12, background: "#f9fafb", borderRadius: 8 }}>
//               <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
//                 Progress: {getAnsweredCount()} / {questions.length} answered
//               </div>
//               <div style={{ width: "100%", height: 8, background: "#e5e7eb", borderRadius: 4 }}>
//                 <div style={{
//                   width: `${(getAnsweredCount() / questions.length) * 100}%`,
//                   height: "100%",
//                   background: "#10b981",
//                   borderRadius: 4,
//                   transition: "width 0.3s"
//                 }} />
//               </div>
//             </div>
//           </div>
//         )}

//         {error && (
//           <div style={{
//             background: "#fee2e2",
//             color: "#dc2626",
//             padding: 16,
//             borderRadius: 8,
//             marginBottom: 24,
//             border: "1px solid #fca5a5"
//           }}>
//             {error}
//           </div>
//         )}

//         {questions.length > 0 ? (
//           <>
//             {questions.map((q, idx) => <QuestionCard key={q._id} q={q} idx={idx} />)}

//             {!result && (
//               <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
//                 <button
//                   onClick={() => handleSubmit(false)}
//                   disabled={isSubmitting.current}
//                   style={{
//                     padding: "16px 48px",
//                     background: isSubmitting.current ? "#9ca3af" : "#3b82f6",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: 8,
//                     fontSize: 16,
//                     fontWeight: 600,
//                     cursor: isSubmitting.current ? "not-allowed" : "pointer",
//                     transition: "background 0.2s"
//                   }}
//                   onMouseEnter={e => {
//                     if (!isSubmitting.current) e.currentTarget.style.background = "#2563eb";
//                   }}
//                   onMouseLeave={e => {
//                     if (!isSubmitting.current) e.currentTarget.style.background = "#3b82f6";
//                   }}
//                 >
//                   {isSubmitting.current ? "Submitting..." : "Submit Exam"}
//                 </button>
//               </div>
//             )}
//           </>
//         ) : (
//           <div style={{
//             background: "#fff",
//             padding: 60,
//             borderRadius: 12,
//             textAlign: "center",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
//           }}>
//             <FaExclamationCircle size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
//             <h3 style={{ color: "#374151" }}>No questions found for this exam</h3>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StudentExamAttemptPage;






//##############################################//
//---------------------Time set--------------------//













import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import { getExamById, getQuestionsByExam, submitAttempt, getExamStatus } from "../api/api";
import { FaClock, FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaRedoAlt } from "react-icons/fa";

const StudentExamAttemptPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const isSubmitting = useRef(false);

  const getStudentId = () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      if (!userInfo) return null;
      const user = JSON.parse(userInfo);
      return user?._id || user?.user?._id || user?.id || user?.userId || null;
    } catch (err) {
      console.error("Error parsing userInfo:", err);
      return null;
    }
  };

  const studentId = getStudentId();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [examStatus, setExamStatus] = useState(null);

  // Fetch Exam Status & Check if can attempt
  useEffect(() => {
    if (result) return;

    const checkExamStatus = async () => {
      if (!studentId) return;

      try {
        const statusData = await getExamStatus(studentId, examId);
        console.log("Exam status from API:", statusData.data);
        setExamStatus(statusData.data);

        // ✅ NEW: Check cooldown first
        if (statusData.data.cooldownInfo?.hasCooldown) {
          const hours = statusData.data.cooldownInfo.hoursRemaining;
          const nextTime = new Date(statusData.data.cooldownInfo.nextAttemptTime).toLocaleString();
          
          alert(`⏳ You must wait ${hours} hour(s) before attempting again.\nNext attempt available: ${nextTime}`);
          navigate("/student/exams");
          return;
        }

        // If cannot attempt, redirect back
        if (!statusData.data.canAttempt) {
          if (statusData.data.passed) {
            alert("You have already passed this exam!");
          } else {
            alert(`You have used all ${statusData.data.totalAttemptsAllowed} attempts for this exam.`);
          }
          navigate("/student/exams");
          return;
        }
      } catch (err) {
        console.error("Error checking exam status:", err);
      }
    };

    checkExamStatus();
  }, [studentId, examId, navigate, result]);

  // Fetch Exam & Questions
  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) {
        setError("Unable to identify student. Please login again.");
        setLoading(false);
        return;
      }
      try {
        setError("");
        const examRes = await getExamById(examId);
        setExam(examRes.exam);

        if (examRes.exam?.duration) {
          setTimeLeft(examRes.exam.duration * 60);
        }

        const qs = await getQuestionsByExam(examId);
        setQuestions(qs || []);
        if (!qs || qs.length === 0) {
          setError("No questions available for this exam.");
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to load exam. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId, studentId]);

  // Timer countdown with auto-submit
  useEffect(() => {
    if (result) return;

    if (timeLeft <= 0 && questions.length > 0 && !isSubmitting.current) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions, result]);

  const handleAnswerChange = (qid, value) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const formatTime = sec => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => Object.keys(answers).filter(k => answers[k]).length;

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!studentId) {
      alert("Unable to identify student. Please login again.");
      navigate("/login");
      return;
    }

    if (!questions.length) {
      alert("No questions to submit.");
      return;
    }

    if (isSubmitting.current) return;

    if (!isAutoSubmit) {
      const unanswered = questions.filter(q => !answers[q._id]);
      if (unanswered.length > 0) {
        const proceed = window.confirm(
          `You have ${unanswered.length} unanswered question(s). Submit anyway?`
        );
        if (!proceed) return;
      }
    }

    const answersArray = questions.map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] || null,
    }));

    isSubmitting.current = true;

    try {
      // Submit attempt
      const res = await submitAttempt({
        userId: studentId,
        examId,
        answers: answersArray,
      });

      console.log("Submit response from backend:", res.data);

      const resultData = res.data;

      setResult({
        score: resultData.score,
        totalMarks: resultData.totalMarks,
        passingMarks: resultData.passingMarks,
        passed: resultData.passed,
        status: resultData.status,
        attemptNumber: resultData.attemptNumber,
        attemptsLeft: resultData.attemptsLeft,
        totalAttemptsAllowed: resultData.totalAttemptsAllowed,
        cooldownInfo: resultData.cooldownInfo // ✅ NEW: Include cooldown info
      });

      setTimeLeft(0);
      
      // Also update exam status after submission
      const updatedStatus = await getExamStatus(studentId, examId);
      setExamStatus(updatedStatus.data);
      
    } catch (err) {
      console.error("Submit error:", err.response?.data || err);
      
      // ✅ NEW: Handle cooldown error specifically
      if (err.response?.data?.cooldownInfo?.hasCooldown) {
        const hours = err.response.data.cooldownInfo.hoursRemaining;
        const nextTime = new Date(err.response.data.cooldownInfo.nextAttemptTime).toLocaleString();
        alert(`⏳ Cooldown Active: You must wait ${hours} hour(s) before attempting again.\nNext attempt available: ${nextTime}`);
        navigate("/student/exams");
      } else {
        alert(err.response?.data?.message || "Failed to submit exam.");
      }
      
      isSubmitting.current = false;
    }
  };

  const handleRetry = () => {
    // ✅ NEW: Check if cooldown is active
    if (result?.cooldownInfo?.hasCooldown) {
      const hours = result.cooldownInfo.hoursRemaining;
      const nextTime = new Date(result.cooldownInfo.nextAttemptTime).toLocaleString();
      alert(`⏳ Please wait ${hours} hour(s) before retrying.\nNext attempt available: ${nextTime}`);
      navigate("/student/exams");
      return;
    }
    
    setAnswers({});
    setTimeLeft(exam.duration * 60);
    setResult(null);
    isSubmitting.current = false;
  };

  const QuestionCard = ({ q, idx }) => {
    const selected = answers[q._id];
    const isDisabled = !!result;

    return (
      <div style={{
        background: "#fff",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: selected ? "2px solid #10b981" : "1px solid #e5e7eb",
        marginBottom: 20,
        opacity: isDisabled ? 0.6 : 1
      }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
          Q{idx + 1}. {q.questionText}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {q.options.map((opt, i) => (
            <label key={i} style={{
              display: "flex",
              alignItems: "center",
              padding: 12,
              background: selected === opt ? "#dbeafe" : "#f9fafb",
              borderRadius: 8,
              cursor: isDisabled ? "not-allowed" : "pointer",
              border: selected === opt ? "2px solid #3b82f6" : "1px solid #e5e7eb",
              transition: "all 0.2s"
            }}>
              <input
                type="radio"
                name={`question_${q._id}`}
                value={opt}
                checked={selected === opt}
                onChange={() => handleAnswerChange(q._id, opt)}
                disabled={isDisabled}
                style={{ marginRight: 12 }}
              />
              <span style={{ fontWeight: selected === opt ? 600 : 400 }}>
                {opt}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p style={{ fontSize: "18px", color: "#6b7280" }}>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <FaExclamationCircle size={48} color="#ef4444" />
            <h2 style={{ marginTop: "16px", color: "#111827" }}>Exam not found</h2>
            <button
              onClick={() => navigate("/student/exams")}
              style={{
                marginTop: 16,
                padding: "10px 20px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <StudentSidebar />
      <div style={{ flex: 1, marginLeft: 250, padding: 30 }}>

        {/* Result Display */}
        {result && (
          <div style={{
            background: result.passed ? "#d1fae5" : "#fee2e2",
            border: `2px solid ${result.passed ? "#10b981" : "#ef4444"}`,
            borderRadius: 12,
            padding: 30,
            marginBottom: 24,
            textAlign: "center"
          }}>
            <div style={{
              fontSize: 48,
              marginBottom: 16,
              color: result.passed ? "#10b981" : "#ef4444"
            }}>
              {result.passed ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <h2 style={{
              fontSize: 28,
              fontWeight: 700,
              color: result.passed ? "#065f46" : "#991b1b",
              marginBottom: 12
            }}>
              {result.passed ? "Congratulations! You Passed!" : "You Did Not Pass"}
            </h2>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
              <span style={{ color: result.passed ? "#065f46" : "#991b1b" }}>
                Your Score: {result.score} / {result.totalMarks}
              </span>
            </div>
            <div style={{ fontSize: 16, color: "#6b7280", marginBottom: 12 }}>
              Passing Marks: {result.passingMarks}
            </div>

            {/* ✅ NEW: Cooldown Warning for Failed Attempts */}
            {!result.passed && result.cooldownInfo?.hasCooldown && (
              <div style={{
                background: "#fef3c7",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid #f59e0b"
              }}>
                <div style={{ 
                  fontSize: "16px", 
                  fontWeight: 600, 
                  color: "#92400e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}>
                  ⏳ Cooldown Active
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#92400e",
                  marginTop: "8px"
                }}>
                  You must wait 24 hours before attempting again.
                </div>
                <div style={{ 
                  fontSize: "12px", 
                  color: "#92400e",
                  marginTop: "4px",
                  fontStyle: "italic"
                }}>
                  Next attempt available after: {new Date(result.cooldownInfo.nextAttemptTime).toLocaleString()}
                </div>
              </div>
            )}

            {/* Attempts Info */}
            <div style={{
              background: "#fff",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              display: "inline-block"
            }}>
              <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
                Attempt {result.attemptNumber} of {result.totalAttemptsAllowed}
              </div>
              {!result.passed && result.attemptsLeft > 0 && !result.cooldownInfo?.hasCooldown && (
                <div style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}>
                  <FaRedoAlt />
                  {result.attemptsLeft} attempt(s) remaining
                </div>
              )}
              {!result.passed && result.attemptsLeft === 0 && (
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#ef4444" }}>
                  No attempts remaining
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => navigate("/student/exams")}
                style={{
                  padding: "12px 32px",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Back to Exams
              </button>

              {!result.passed && result.attemptsLeft > 0 && !result.cooldownInfo?.hasCooldown && (
                <button
                  onClick={handleRetry}
                  style={{
                    padding: "12px 32px",
                    background: "#f59e0b",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <FaRedoAlt /> Retry Exam
                </button>
              )}
            </div>
          </div>
        )}

        {/* Exam Header */}
        {!result && (
          <div style={{
            background: "#fff",
            padding: 24,
            borderRadius: 12,
            marginBottom: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                  {exam.title}
                </h1>
                <p style={{ color: "#6b7280" }}>{exam.description}</p>

                {/* Show attempt number */}
                {examStatus && (
                  <div style={{
                    marginTop: "8px",
                    fontSize: "14px",
                    color: "#f59e0b",
                    fontWeight: 600
                  }}>
                    Attempt {examStatus.attemptsUsed + 1} of {examStatus.totalAttemptsAllowed || 3}
                  </div>
                )}
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                background: timeLeft < 300 ? "#fee2e2" : "#dbeafe",
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 700,
                color: timeLeft < 300 ? "#dc2626" : "#1e40af"
              }}>
                <FaClock /> {formatTime(timeLeft)}
              </div>
            </div>

            <div style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background: "#f9fafb",
              display: "flex",
              gap: 24
            }}>
              <div>
                <span style={{ fontSize: 14, color: "#6b7280" }}>Total Marks: </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                  {exam.totalMarks}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 14, color: "#6b7280" }}>Passing Marks: </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                  {exam.passingMarks}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: 12, background: "#f9fafb", borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
                Progress: {getAnsweredCount()} / {questions.length} answered
              </div>
              <div style={{ width: "100%", height: 8, background: "#e5e7eb", borderRadius: 4 }}>
                <div style={{
                  width: `${(getAnsweredCount() / questions.length) * 100}%`,
                  height: "100%",
                  background: "#10b981",
                  borderRadius: 4,
                  transition: "width 0.3s"
                }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            border: "1px solid #fca5a5"
          }}>
            {error}
          </div>
        )}

        {questions.length > 0 ? (
          <>
            {questions.map((q, idx) => <QuestionCard key={q._id} q={q} idx={idx} />)}

            {!result && (
              <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting.current}
                  style={{
                    padding: "16px 48px",
                    background: isSubmitting.current ? "#9ca3af" : "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: isSubmitting.current ? "not-allowed" : "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={e => {
                    if (!isSubmitting.current) e.currentTarget.style.background = "#2563eb";
                  }}
                  onMouseLeave={e => {
                    if (!isSubmitting.current) e.currentTarget.style.background = "#3b82f6";
                  }}
                >
                  {isSubmitting.current ? "Submitting..." : "Submit Exam"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: "#fff",
            padding: 60,
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <FaExclamationCircle size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
            <h3 style={{ color: "#374151" }}>No questions found for this exam</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExamAttemptPage;
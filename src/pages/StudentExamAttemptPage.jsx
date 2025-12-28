import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import { getExamById, getQuestionsByExam, submitAttempt } from "../api/api";
import { FaClock, FaExclamationCircle } from "react-icons/fa";

const StudentExamAttemptPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // Get user from localStorage with better error handling
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
      const id = user?._id || user?.user?._id || user?.id || user?.userId;
      console.log("Extracted student ID:", id);
      
      return id;
    } catch (error) {
      console.error("Error getting user ID:", error);
      return null;
    }
  };
  
  const studentId = getUserId();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch exam + questions
  useEffect(() => {
    const fetchData = async () => {
      // Check if studentId exists before fetching
      if (!studentId) {
        console.error("❌ Student ID is missing! Cannot load exam.");
        setError("Unable to identify student. Please login again.");
        setLoading(false);
        return;
      }
      
      try {
        setError("");
        console.log("Fetching exam with ID:", examId);
        console.log("Student ID:", studentId);
        
        const examRes = await getExamById(examId);
        setExam(examRes.exam);
        
        if (examRes.exam?.duration) {
          setTimeLeft(examRes.exam.duration * 60);
        }

        const qs = await getQuestionsByExam(examId);
        console.log("Fetched questions:", qs);
        
        if (!qs || qs.length === 0) {
          setError("No questions available for this exam");
        }
        
        setQuestions(qs);
      } catch (err) {
        console.error("Error loading exam:", err);
        setError("Failed to load exam. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId]);

  // Timer with auto-submit
  useEffect(() => {
    if (timeLeft <= 0) {
      if (questions.length > 0 && !submitting) {
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions, submitting]);

  // Handle answer selection
  const handleAnswerChange = (qid, value) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validate studentId exists
    if (!studentId) {
      alert("Unable to identify student. Please login again.");
      navigate("/login");
      return;
    }
    
    if (!questions.length) {
      alert("No questions to submit");
      return;
    }

    if (submitting) return;

    // Check if all questions are answered
    const unanswered = questions.filter(q => !answers[q._id]);
    if (unanswered.length > 0) {
      const proceed = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
      );
      if (!proceed) return;
    }

    // Convert answers object to array for backend
    const answersArray = questions.map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] || null
    }));

    console.log("=== SUBMISSION DEBUG ===");
    console.log("1. Student ID:", studentId, "| Type:", typeof studentId, "| Valid:", !!studentId);
    console.log("2. Exam ID:", examId, "| Type:", typeof examId, "| Valid:", !!examId);
    console.log("3. Questions count:", questions.length);
    console.log("4. Answers object:", answers);
    console.log("5. Answers Array:", answersArray);
    console.log("6. Answers Array Length:", answersArray.length);
    console.log("7. Answers Array Type:", Array.isArray(answersArray));
    
    // Check for null/undefined values in answers
    const invalidAnswers = answersArray.filter(a => !a.questionId || a.questionId === 'null');
    if (invalidAnswers.length > 0) {
      console.warn("⚠️ Found invalid question IDs:", invalidAnswers);
    }
    
    const payload = {
      studentId,
      examId,
      answers: answersArray
    };
    
    console.log("8. Full Payload:", JSON.stringify(payload, null, 2));
    console.log("=======================");

    setSubmitting(true);

    try {
      const res = await submitAttempt(payload);

      console.log("Submit response:", res);

      const score = res.data?.score ?? res.score;
      const totalMarks = exam?.totalMarks;

      alert(`Exam submitted successfully!\n\nYour Score: ${score}/${totalMarks}`);
      navigate("/student/exams");
    } catch (err) {
      console.error("Submit error:", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      
      const errorMsg = err.response?.data?.message || err.message;
      const errorDetails = err.response?.data?.received || err.response?.data;
      
      console.error("Error message:", errorMsg);
      console.error("Error details:", errorDetails);
      
      alert(`Failed to submit exam: ${errorMsg}\n\nCheck console for details.`);
      setSubmitting(false);
    }
  };

  const formatTime = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(k => answers[k]).length;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p>Loading exam...</p>
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
            <h2 style={{ marginTop: 16 }}>Exam not found</h2>
            <button 
              onClick={() => navigate("/student/exams")}
              style={{
                marginTop: 16,
                padding: "10px 20px",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
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
        {/* Header */}
        <div style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                {exam.title}
              </h1>
              <p style={{ color: "#6b7280" }}>{exam.description}</p>
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
              <FaClock />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginTop: 16, padding: 12, background: "#f9fafb", borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
              Progress: {getAnsweredCount()} / {questions.length} answered
            </div>
            <div style={{
              width: "100%",
              height: 8,
              background: "#e5e7eb",
              borderRadius: 4,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${(getAnsweredCount() / questions.length) * 100}%`,
                height: "100%",
                background: "#10b981",
                transition: "width 0.3s"
              }} />
            </div>
          </div>
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

        {/* Questions */}
        {questions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {questions.map((q, idx) => (
              <div
                key={q._id}
                style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 12,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: answers[q._id] ? "2px solid #10b981" : "1px solid #e5e7eb"
                }}
              >
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 16
                }}>
                  Q{idx + 1}. {q.questionText}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: 12,
                        background: answers[q._id] === opt ? "#dbeafe" : "#f9fafb",
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        border: answers[q._id] === opt ? "2px solid #3b82f6" : "1px solid #e5e7eb"
                      }}
                    >
                      <input
                        type="radio"
                        name={`question_${q._id}`}
                        value={opt}
                        checked={answers[q._id] === opt}
                        onChange={() => handleAnswerChange(q._id, opt)}
                        style={{ marginRight: 12, cursor: "pointer" }}
                      />
                      <span style={{
                        color: "#374151",
                        fontWeight: answers[q._id] === opt ? 600 : 400
                      }}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
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

        {/* Submit Button */}
        {questions.length > 0 && (
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: "16px 48px",
                background: submitting ? "#9ca3af" : "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              {submitting ? "Submitting..." : "Submit Exam"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExamAttemptPage;
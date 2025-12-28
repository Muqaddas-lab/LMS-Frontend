import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  getQuestionsByExam,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../api/api";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";

const ExamQuestionsPage = () => {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  const fetchQuestions = async () => {
    const data = await getQuestionsByExam(examId);
    console.log("Question data",data);
    setQuestions(data);
  };

  useEffect(() => {
    fetchQuestions();
  }, [examId]);

  const submit = async (e) => {
    e.preventDefault();
    if (editing) {
      await updateQuestion(editing._id, form);
    } else {
      await addQuestion({
        exam: examId,
        questionText: form.questionText,
        options: form.options,
        correctAnswer: form.correctAnswer,
      });
    }
    setFormVisible(false);
    setEditing(null);
    resetForm();
    fetchQuestions();
  };

  const resetForm = () => {
    setForm({ questionText: "", options: ["", "", "", ""], correctAnswer: "" });
  };

  const handleEdit = (q) => {
    setEditing(q);
    setForm({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
    });
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this question?")) {
      await deleteQuestion(id);
      fetchQuestions();
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={container}>
        <div style={header}>
          <h2>📝 Exam Questions</h2>
          <button
            style={btnPrimary}
            onClick={() => {
              resetForm();
              setEditing(null);
              setFormVisible(true);
            }}
          >
            <FaPlus style={{ marginRight: 6 }} /> Add Question
          </button>
        </div>

        <div style={cardContainer}>
          {questions.length === 0 ? (
            <p style={noDataText}>No questions found</p>
          ) : (
            questions.map((q, i) => (
              <div key={q._id} style={questionCard}>
                <h4>{i + 1}. {q.questionText}</h4>
                <ul style={optionsList}>
                  {q.options.map((op, idx) => (
                    <li key={idx}>{op}</li>
                  ))}
                </ul>
                <p style={correctAnswer}>Correct: {q.correctAnswer}</p>
                <div style={actions}>
                  <FaEdit style={icon} title="Edit Question" onClick={() => handleEdit(q)} />
                  <FaTrash style={{ ...icon, color: "#ef4444" }} title="Delete Question" onClick={() => handleDelete(q._id)} />
                </div>
              </div>
            ))
          )}
        </div>

        {formVisible && (
          <div style={modal}>
            <form onSubmit={submit} style={modalBox}>
              <h3 style={modalHeader}>{editing ? "Edit Question" : "Add Question"}</h3>

              <input
                required
                placeholder="Question text"
                value={form.questionText}
                onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                style={input}
              />

              {form.options.map((op, i) => (
                <input
                  key={i}
                  required
                  placeholder={`Option ${i + 1}`}
                  value={op}
                  onChange={(e) => {
                    const opts = [...form.options];
                    opts[i] = e.target.value;
                    setForm({ ...form, options: opts });
                  }}
                  style={input}
                />
              ))}

              <input
                required
                placeholder="Correct Answer (must match option)"
                value={form.correctAnswer}
                onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                style={input}
              />

              <div style={modalActions}>
                <button style={btnPrimary} type="submit">Save</button>
                <button style={btnDanger} type="button" onClick={() => setFormVisible(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamQuestionsPage;

/* ================= STYLES ================= */
const container = {
  marginLeft: 250,
  padding: 30,
  flex: 1,
  minHeight: "100vh",
  background: "#f0f4f8",
  fontFamily: "'Segoe UI', sans-serif",
};
const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};
const cardContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};
const questionCard = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  transition: "all 0.3s ease",
  cursor: "pointer",
};
const questionCardHover = {
  transform: "translateY(-5px)",
  boxShadow: "0 6px 25px rgba(0,0,0,0.15)",
};
const optionsList = { paddingLeft: 20, marginTop: 8 };
const correctAnswer = { fontWeight: 600, color: "#1e3a8a" };
const actions = { marginTop: 12, display: "flex", gap: 12 };
const icon = { cursor: "pointer", color: "#2563eb", fontSize: 18, transition: "0.3s" };

const btnPrimary = {
  padding: "10px 18px",
  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  fontWeight: 600,
  fontSize: 14,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};
const btnDanger = {
  padding: "10px 18px",
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

const modal = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  animation: "fadeIn 0.3s",
};

const modalBox = {
  background: "#fff",
  padding: 30,
  borderRadius: 15,
  width: 450,
  display: "flex",
  flexDirection: "column",
  gap: 15,
  boxShadow: "0 6px 25px rgba(0,0,0,0.2)",
  transform: "scale(1)",
  transition: "all 0.3s ease",
};
const modalHeader = {
  marginBottom: 10,
  fontSize: 20,
  fontWeight: 700,
  color: "#2563eb",
};
const input = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ccc",
  outline: "none",
  width: "100%",
  fontSize: 14,
  transition: "border 0.3s",
};
const modalActions = { display: "flex", justifyContent: "flex-end", gap: 12 };
const noDataText = {
  textAlign: "center",
  width: "100%",
  padding: 40,
  fontSize: 18,
  color: "#555",
};

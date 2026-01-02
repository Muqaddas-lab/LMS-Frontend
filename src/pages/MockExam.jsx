import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAllExams, createExam, updateExam, deleteExam } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";

const MockExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    totalMarks: "",
  });

  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      const res = await getAllExams();
      setExams(res.exams || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load exams");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const resetForm = () => {
    setFormData({ title: "", description: "", duration: "", totalMarks: "" });
    setEditingExam(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      duration: Number(formData.duration),
      totalMarks: Number(formData.totalMarks),
      passingMarks: Number(formData.passingMarks),
    };
    try {
      if (editingExam) await updateExam(editingExam._id, payload);
      else await createExam(payload);
      setFormVisible(false);
      resetForm();
      fetchExams();
    } catch (err) {
      console.error(err);
      alert("Failed to save exam. Check all fields.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this exam?")) {
      try {
        await deleteExam(id);
        fetchExams();
      } catch (err) {
        console.error(err);
        alert("Failed to delete exam");
      }
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: 250, padding: 30, flex: 1, minHeight: "100vh", background: "#f5f5f5" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ marginBottom: 20 }}>📘 Mock Exams</h2>
          <button
            style={btnPrimary}
            onClick={() => {
              resetForm();
              setFormVisible(true);
            }}
          >
            <FaPlus style={{ marginRight: 6 }} /> Create Exam
          </button>
        </div>

        <div style={cardContainer}>
          {exams.length === 0 ? (
            <p style={{ textAlign: "center", width: "100%", padding: 40, fontSize: 18 }}>
              No exams found
            </p>
          ) : (
            exams.map((exam) => (
              <div key={exam._id} style={examCard}>
                <h3 style={{ marginBottom: 8 }}>{exam.title}</h3>
                <p style={{ margin: 0, color: "#555" }}>{exam.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 14, color: "#333" }}>
                  <span>⏱ {exam.duration} min</span>
                  <span>📝 {exam.totalMarks} Marks</span>
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                  <FaEye style={icon} title="View Questions" onClick={() => navigate(`/mock-exams/${exam._id}/questions`)} />
                  <FaEdit style={icon} title="Edit Exam" onClick={() => {
                    setEditingExam(exam);
                    setFormData({
                      title: exam.title,
                      description: exam.description || "",
                      duration: exam.duration,
                      totalMarks: exam.totalMarks,
                      passingMarks: "", 
                    });
                    setFormVisible(true);
                  }} />
                  <FaTrash style={{ ...icon, color: "#ef4444" }} title="Delete Exam" onClick={() => handleDelete(exam._id)} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL */}
        {formVisible && (
          <div style={modal}>
            <form onSubmit={handleSubmit} style={modalBox}>
              <h3 style={{ marginBottom: 15 }}>{editingExam ? "Edit Exam" : "Create Exam"}</h3>
              <input
                placeholder="Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={input}
              />
              <textarea
                placeholder="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ ...input, height: 60, resize: "none" }}
              />
              <input
                placeholder="Duration (minutes)"
                required
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                style={input}
              />
              <input
                placeholder="Total Marks"
                required
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                style={input}
              />
              <input
                  placeholder="Passing Marks"
                  required
                  type="number"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                  style={input}
                />


              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 15 }}>
                <button style={btnPrimary} type="submit">Save</button>
                <button style={btnDanger} type="button" onClick={() => { setFormVisible(false); resetForm(); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockExamsPage;

/* ===== Styles ===== */
const cardContainer = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginTop: 20 };
const examCard = { background: "#fff", padding: 20, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", transition: "transform 0.2s", cursor: "pointer" };
examCard[":hover"] = { transform: "translateY(-4px)" };

const btnPrimary = { padding: "10px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", fontWeight: 500, fontSize: 14 };
const btnDanger = { padding: "10px 16px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 500, fontSize: 14 };
const icon = { cursor: "pointer", color: "#2563eb", fontSize: 18, transition: "color 0.2s" };
const modal = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalBox = { background: "#fff", padding: 25, borderRadius: 12, width: 350, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" };
const input = { padding: 10, borderRadius: 6, border: "1px solid #ccc", outline: "none", width: "100%" };

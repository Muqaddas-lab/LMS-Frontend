import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaPlus, FaFilePdf, FaSearch } from "react-icons/fa";
import {
  getLecturesByCourse,
  createLecture,
  updateLecture,
  deleteLecture,
} from "../api/api";

const Lectures = () => {
  const { courseId } = useParams();

  const [lectures, setLectures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lectureNumber: "",
    duration: "",
    videoUrl: "",
  });

  /* ================= FETCH ================= */
  const fetchLectures = async () => {
    const data = await getLecturesByCourse(courseId);
    setLectures(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchLectures();
  }, [courseId]);

  /* ================= FORM ================= */
  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      lectureNumber: "",
      duration: "",
      videoUrl: "",
    });
    setVideoFile(null);
    setPdfFile(null);
    setShowForm(true);
  };

  const openEditForm = (lec) => {
    setEditingId(lec._id);
    setFormData({
      title: lec.title,
      description: lec.description,
      lectureNumber: lec.lectureNumber,
      duration: lec.duration,
      videoUrl: lec.videoUrl || "",
    });
    setVideoFile(null);
    setPdfFile(null);
    setShowForm(true);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([k, v]) => form.append(k, v));
      form.append("course", courseId);
      if (videoFile) form.append("video", videoFile);
      if (pdfFile) form.append("pdf", pdfFile);

      let response;
      if (editingId) {
        response = await updateLecture(editingId, form);
        setLectures((prev) =>
          prev.map((l) => (l._id === editingId ? response.lecture : l))
        );
      } else {
        response = await createLecture(form);
        setLectures((prev) => [...prev, response.lecture]);
      }

      setShowForm(false);
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete lecture?")) return;
    await deleteLecture(id);
    fetchLectures();
  };

  /* ================= FILTER ================= */
  const filteredLectures = lectures.filter(
    (lec) =>
      lec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lec.lectureNumber.toString().includes(searchTerm)
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={styles.container}>
        {/* ===== HEADER ===== */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Lectures</h1>
            {/* <p style={styles.pageSub}>Manage videos & PDF resources</p> */}
          </div>
          <button style={styles.addBtn} onClick={openAddForm}>
            <FaPlus /> Add Lecture
          </button>
        </div>

        {/* ===== SEARCH ===== */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search by Title or Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <FaSearch style={{ marginLeft: -30, color: "#6b7280" }} />
        </div>

        {/* ===== TABLE ===== */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>No</th>
                <th>Duration</th>
                <th>Video</th>
                <th>PDF</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredLectures.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.empty}>
                    No lectures found
                  </td>
                </tr>
              ) : (
                filteredLectures.map((lec, i) => (
                  <tr key={lec._id}>
                    <td>{i + 1}</td>
                    <td>{lec.title}</td>
                    <td>{lec.lectureNumber}</td>
                    <td>{lec.duration}</td>
                    <td>
                      {lec.videoPath ? (
                        <video width="140" controls>
                          <source
                            src={`http://localhost:5000/${lec.videoPath}`}
                          />
                        </video>
                      ) : lec.videoUrl ? (
                        <a href={lec.videoUrl} target="_blank" rel="noreferrer">
                          Watch
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      {lec.pdfPath ? (
                        <a
                          href={`http://localhost:5000/${lec.pdfPath}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FaFilePdf /> View PDF
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <button
                        onClick={() => openEditForm(lec)}
                        style={styles.iconBtn}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(lec._id)}
                        style={{ ...styles.iconBtn, background: "#ef4444" }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== MODAL ===== */}
        {showForm && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3>{editingId ? "Edit Lecture" : "Add Lecture"}</h3>

              <form onSubmit={handleSubmit} style={styles.form}>
                <input
                  name="title"
                  placeholder="Lecture Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                />

                <input
                  name="lectureNumber"
                  placeholder="Lecture Number"
                  value={formData.lectureNumber}
                  onChange={handleChange}
                />

                <input
                  name="duration"
                  placeholder="Duration"
                  value={formData.duration}
                  onChange={handleChange}
                />

                <input
                  name="videoUrl"
                  placeholder="Video URL (optional)"
                  value={formData.videoUrl}
                  onChange={handleChange}
                />

                <label>Upload Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />

                <label>Upload PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />

                <div style={styles.actions}>
                  <button type="submit" disabled={loading} style={styles.saveBtn}>
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lectures;

/* ================= STYLES ================= */
const styles = {
  container: { marginLeft: 250, padding: 24, width: "100%", background: "#f3f4f6", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  pageTitle: { fontSize: 26, fontWeight: 700 },
  pageSub: { fontSize: 14, color: "#6b7280" },
  addBtn: { background: "#f97316", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, cursor: "pointer" },
  searchInput: { width: "300px", padding: "8px 32px 8px 12px", borderRadius: 8, border: "1px solid #d1d5db" },
  card: { background: "#fff", padding: 20, borderRadius: 12 },
  table: { width: "100%", borderCollapse: "collapse" },
  iconBtn: { background: "#3b82f6", color: "#fff", border: "none", padding: 8, borderRadius: 6, cursor: "pointer", marginRight: 6 },
  empty: { textAlign: "center", padding: 20 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { background: "#fff", padding: 25, borderRadius: 12, width: 450 },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  actions: { display: "flex", gap: 10 },
  saveBtn: { flex: 1, background: "#3b82f6", color: "#fff", padding: 10, borderRadius: 6, border: "none" },
  cancelBtn: { flex: 1, background: "#9ca3af", color: "#fff", padding: 10, borderRadius: 6, border: "none" },
};

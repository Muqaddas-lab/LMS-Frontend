import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaPlus, FaEye, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaVideo, FaLink } from "react-icons/fa";
import { getLecturesByCourse, createLecture, updateLecture, deleteLecture } from "../api/api";

const Lectures = () => {
  const { courseId } = useParams();

  const [lectures, setLectures] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLecture, setSelectedLecture] = useState(null);

  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [pptFile, setPptFile] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    lectureNumber: "",
    duration: "",
    videoUrl: "",
    type: "video",
    notes: "",
  });

  // ================= FETCH =================
  const fetchLectures = async () => {
    try {
      const data = await getLecturesByCourse(courseId);
      setLectures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FetchLectures Error:", err);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [courseId]);

  // ================= FORM HANDLERS =================
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      lectureNumber: "",
      duration: "",
      videoUrl: "",
      type: "video",
      notes: "",
    });
    setVideoFile(null);
    setPdfFile(null);
    setDocFile(null);
    setExcelFile(null);
    setPptFile(null);
  };

  const openAddForm = () => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (lec) => {
    setEditingId(lec._id);
    setFormData({
      title: lec.title || "",
      description: lec.description || "",
      lectureNumber: lec.lectureNumber || "",
      duration: lec.duration || "",
      videoUrl: lec.videoUrl || "",
      type: lec.type || "video",
      notes: lec.notes || "",
    });
    setVideoFile(null);
    setPdfFile(null);
    setDocFile(null);
    setExcelFile(null);
    setPptFile(null);
    setShowForm(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined) form.append(k, v);
      });
      form.append("course", courseId);

      if (videoFile) form.append("video", videoFile);
      if (pdfFile) form.append("pdf", pdfFile);
      if (docFile) form.append("document", docFile);
      if (excelFile) form.append("excel", excelFile);
      if (pptFile) form.append("ppt", pptFile);

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

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Lecture Submit Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete lecture?")) return;
    try {
      await deleteLecture(id);
      fetchLectures();
    } catch (err) {
      console.error("DeleteLecture Error:", err);
      alert("Failed to delete lecture.");
    }
  };

  const filteredLectures = lectures.filter(
    (lec) =>
      lec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lec.lectureNumber.toString().includes(searchTerm)
  );

  const renderFile = (lec) => {
    const base = "http://localhost:5000/";
    if (lec.videoPath) return <video width="120" controls src={base + lec.videoPath} />;
    if (lec.videoUrl) return <a href={lec.videoUrl} target="_blank" rel="noreferrer"><FaLink /> Watch</a>;
    if (lec.pdfPath) return <a href={base + lec.pdfPath} target="_blank" rel="noreferrer"><FaFilePdf /> PDF</a>;
    if (lec.documentPath) return <a href={base + lec.documentPath} target="_blank" rel="noreferrer"><FaFileWord /> Doc</a>;
    if (lec.excelPath) return <a href={base + lec.excelPath} target="_blank" rel="noreferrer"><FaFileExcel /> Excel</a>;
    if (lec.pptPath) return <a href={base + lec.pptPath} target="_blank" rel="noreferrer"><FaFilePowerpoint /> PPT</a>;
    return "—";
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "24px", background: "#f3f4f6", minHeight: "100vh", flex: 1 }}>
        <h2>📚 Lectures Management</h2>

        {/* SEARCH + ADD */}
        <div style={{ display: "flex", margin: "20px 0" }}>
          <input
            placeholder="Search lecture..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchStyle}
          />
          <button style={addBtn} onClick={openAddForm}>
            + Add Lecture
          </button>
        </div>

        {/* TABLE */}
        <table style={tableStyle}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>No</th>
              <th>Type</th>
              <th>Resource</th>
              <th>Show</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredLectures.map((lec, i) => (
              <tr key={lec._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td>{i + 1}</td>
                <td>{lec.title}</td>
                <td>{lec.lectureNumber}</td>
                <td>{lec.type}</td>
                <td>{renderFile(lec)}</td>
                <td>
                  <button style={viewBtn} onClick={() => setSelectedLecture(lec)}><FaEye /></button>
                </td>
                <td>
                  <button style={editBtn} onClick={() => openEditForm(lec)}><FaEdit /></button>
                </td>
                <td>
                  <button style={deleteBtn} onClick={() => handleDelete(lec._id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SHOW DETAILS MODAL */}
        {selectedLecture && (
          <div style={overlay}>
            <div style={modalLarge}>
              <h3>👁 Lecture Details</h3>
              <p><b>Title:</b> {selectedLecture.title}</p>
              <p><b>Description:</b> {selectedLecture.description}</p>
              <p><b>Lecture No.:</b> {selectedLecture.lectureNumber}</p>
              <p><b>Type:</b> {selectedLecture.type}</p>
              <p><b>Notes:</b> {selectedLecture.notes}</p>
              <p><b>Resource:</b> {renderFile(selectedLecture)}</p>
              <button onClick={() => setSelectedLecture(null)} style={closeBtn}>Close</button>
            </div>
          </div>
        )}

        {/* ADD / EDIT FORM */}
        {showForm && (
          <div style={overlay}>
            <div style={modalLarge}>
              <h3>{editingId ? "Edit Lecture" : "Add Lecture"}</h3>
              <form onSubmit={handleSubmit} style={formStyle}>
                
                <label>Title</label>
                <input style={inputStyle} placeholder="Title" name="title" value={formData.title} onChange={handleChange} required />

                <label>Description</label>
                <textarea style={inputStyle} placeholder="Description" name="description" value={formData.description} onChange={handleChange} />

                <label>Lecture Number</label>
                <input style={inputStyle} placeholder="Lecture Number" type="number" name="lectureNumber" value={formData.lectureNumber} onChange={handleChange} required />
{/* 
                <label>Duration (minutes)</label>
                <input style={inputStyle} placeholder="Duration (minutes)" name="duration" value={formData.duration} onChange={handleChange} />

                <label>Notes</label>
                <textarea style={inputStyle} placeholder="Notes" name="notes" value={formData.notes} onChange={handleChange} /> */}

                <label>Type</label>
                <select style={inputStyle} name="type" value={formData.type} onChange={handleChange}>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="document">Document</option>
                  <option value="excel">Excel</option>
                  <option value="ppt">PPT</option>
                  <option value="link">Video Link</option>
                </select>

                {formData.type === "video" && (
                  <>
                    <label>Upload Video</label>
                    <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} />
                  </>
                )}
                {formData.type === "pdf" && (
                  <>
                    <label>Upload PDF</label>
                    <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files[0])} />
                  </>
                )}
                {formData.type === "document" && (
                  <>
                    <label>Upload Document</label>
                    <input type="file" onChange={e => setDocFile(e.target.files[0])} />
                  </>
                )}
                {formData.type === "excel" && (
                  <>
                    <label>Upload Excel</label>
                    <input type="file" onChange={e => setExcelFile(e.target.files[0])} />
                  </>
                )}
                {formData.type === "ppt" && (
                  <>
                    <label>Upload PPT</label>
                    <input type="file" onChange={e => setPptFile(e.target.files[0])} />
                  </>
                )}
                {formData.type === "link" && (
                  <>
                    <label>Video URL</label>
                    <input type="text" placeholder="Video URL" name="videoUrl" value={formData.videoUrl} onChange={handleChange} />
                  </>
                )}

                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button type="submit" style={saveBtn}>{editingId ? "Update Lecture" : "Add Lecture"}</button>
                  <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* ================= STYLES ================= */
const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #ccc" };
const searchStyle = { flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db" };
const tableStyle = { width: "100%", background: "#fff", borderRadius: "12px", borderCollapse: "collapse" };
const addBtn = { marginLeft: "10px", background: "#f97316", color: "#fff", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer" };
const editBtn = { background: "#fde047", borderRadius: "6px", padding: "6px" };
const deleteBtn = { background: "#ef4444", color: "#fff", borderRadius: "6px", padding: "6px" };
const viewBtn = { background: "#10b981", color: "#fff", borderRadius: "6px", padding: "6px" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 };
const modalLarge = { background: "#fff", padding: "30px", borderRadius: "12px", width: "500px", maxHeight: "90vh", overflowY: "auto" };
const formStyle = { display: "flex", flexDirection: "column", gap: "12px" };
const saveBtn = { flex: 1, background: "#3b82f6", color: "#fff", padding: "10px", borderRadius: "6px", border: "none" };
const cancelBtn = { flex: 1, background: "#ef4444", color: "#fff", padding: "10px", borderRadius: "6px", border: "none" };
const closeBtn = { marginTop: "10px", background: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none" };

export default Lectures;

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import {
  getAllUsers,
  deleteUser,
  updateUser,
  registerUser,
  getCourses,
} from "../api/api";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    courses: [],
    status: "Active",
    accessTill: "",
  });

  /* ================= FETCH ================= */

  const fetchStudents = async () => {
    const data = await getAllUsers();
    setStudents(data.filter((u) => u.role === "Student"));
  };

  const fetchCourses = async () => {
    const data = await getCourses();
    setCourses(Array.isArray(data) ? data : data.courses || []);
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  /* ================= COURSE HANDLING ================= */

  const handleCourseCheckbox = (id) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.includes(id)
        ? prev.courses.filter((c) => c !== id)
        : [...prev.courses, id],
    }));
  };

  const removeCourse = (id) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c !== id),
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      courses: formData.courses,
      status: formData.status,
      accessTill: formData.accessTill,
      role: "Student",
    };

    if (formData.password) payload.password = formData.password;

    if (editingStudent) {
      await updateUser(editingStudent._id, payload);
    } else {
      await registerUser({
        ...payload,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
    }

    setFormVisible(false);
    fetchStudents();
  };

  /* ================= UI ================= */

  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.content}>
        <h2>🎓 Students Management</h2>

        {/* SEARCH + ADD */}
        <div style={styles.topBar}>
          <div style={styles.searchBox}>
            <FaSearch />
            <input
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            style={styles.addBtn}
            onClick={() => {
              setEditingStudent(null);
              setFormVisible(true);
              setFormData({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                courses: [],
                status: "Active",
                accessTill: "",
              });
            }}
          >
            + Add Student
          </button>
        </div>

        {/* TABLE */}
        <div style={styles.tableBox}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Courses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students
                .filter(
                  (s) =>
                    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((s, i) => (
                  <tr key={s._id}>
                    <td>{i + 1}</td>
                    <td>{s.fullName}</td>
                    <td>{s.email}</td>
                    <td>{s.courses?.map((c) => c.title).join(", ")}</td>
                    <td>{s.status}</td>
                    <td>
                      <button
                        style={styles.editBtn}
                        onClick={() => {
                          setEditingStudent(s);
                          setFormVisible(true);
                          setFormData({
                            fullName: s.fullName,
                            email: s.email,
                            password: "",
                            confirmPassword: "",
                            courses: s.courses.map((c) => c._id),
                            status: s.status,
                            accessTill: s.accessTill
                              ? s.accessTill.split("T")[0]
                              : "",
                          });
                        }}
                      >
                        <FaEdit />
                      </button>

                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteUser(s._id).then(fetchStudents)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* MODAL FORM */}
        {formVisible && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3>{editingStudent ? "✏️ Edit Student" : "➕ Add Student"}</h3>

              <form onSubmit={handleSubmit} style={styles.form}>
                <input
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />

                <input
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />

                {/* COURSES */}
                <div style={styles.courseBox}>
                  <h4>📚 Assign Courses</h4>

                  {courses.map((c) => (
                    <label key={c._id} style={styles.courseItem}>
                      <input
                        type="checkbox"
                        checked={formData.courses.includes(c._id)}
                        onChange={() => handleCourseCheckbox(c._id)}
                      />
                      {c.title}
                    </label>
                  ))}
                </div>

                {/* SELECTED */}
                {formData.courses.length > 0 && (
                  <div style={styles.selectedBox}>
                    <h4>Selected Courses</h4>

                    {formData.courses.map((id) => {
                      const course = courses.find((c) => c._id === id);
                      return (
                        <div key={id} style={styles.selectedItem}>
                          <span>{course?.title}</span>
                          <button
                            type="button"
                            onClick={() => removeCourse(id)}
                            style={styles.removeBtn}
                          >
                            ❌
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={styles.btnRow}>
                  <button type="submit" style={styles.saveBtn}>
                    Save
                  </button>
                  <button
                    type="button"
                    style={styles.cancelBtn}
                    onClick={() => setFormVisible(false)}
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

/* ================= STYLES ================= */

const styles = {
  container: { display: "flex", background: "#f1f5f9", minHeight: "100vh" },
  content: { marginLeft: "220px", padding: "30px", width: "100%" },

  topBar: { display: "flex", justifyContent: "space-between", margin: "20px 0" },

  searchBox: {
    display: "flex",
    gap: "8px",
    background: "#fff",
    padding: "10px",
    borderRadius: "8px",
  },

  addBtn: {
    background: "#ff6b35",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
  },

  tableBox: { background: "#fff", borderRadius: "10px", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },

  editBtn: { marginRight: "6px", background: "#fde047", border: "none" },
  deleteBtn: { background: "#ef4444", color: "#fff", border: "none" },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: "25px",
    width: "500px",
    borderRadius: "12px",
    maxHeight: "90vh",
    overflowY: "auto",
  },

  form: { display: "flex", flexDirection: "column", gap: "10px" },

  courseBox: {
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "8px",
  },

  courseItem: { display: "flex", gap: "8px", marginBottom: "5px" },

  selectedBox: {
    background: "#ecfeff",
    padding: "10px",
    borderRadius: "8px",
  },

  selectedItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  removeBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },

  btnRow: { display: "flex", justifyContent: "space-between" },

  saveBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: "8px",
  },

  cancelBtn: {
    background: "#9ca3af",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: "8px",
  },
};

export default Students;

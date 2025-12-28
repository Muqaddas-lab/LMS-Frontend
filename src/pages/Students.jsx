import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaKey, FaEye } from "react-icons/fa";
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
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    courses: [],
    status: "Active",
    country: "",
    dob: "",
    gender: "Male",
    selectDate: "",
    address: "",
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

  /* ================= HANDLERS ================= */

  const handleResetPassword = async (id) => {
    const newPassword = prompt("Enter new password");
    if (!newPassword) return;
    await updateUser(id, { password: newPassword });
    alert("Password reset successfully");
  };

  const handleCheckbox = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((c) => c !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingStudent && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      courses: formData.courses,
      status: formData.status,
      role: "Student",
      country: formData.country,
      dob: formData.dob,
      gender: formData.gender,
      selectDate: formData.selectDate,
      address: formData.address,
    };

    if (editingStudent) {
      await updateUser(editingStudent._id, payload);
      alert("Student updated");
    } else {
      await registerUser(payload);
      alert("Student added");
    }

    setFormVisible(false);
    fetchStudents();
  };

  /* ================= UI ================= */

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "24px", background: "#f3f4f6", minHeight: "100vh", flex: 1 }}>
        <h2>🎓 Students Management</h2>

        {/* SEARCH + ADD */}
        <div style={{ display: "flex", margin: "20px 0" }}>
          <input
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchStyle}
          />
          <button
            style={addBtn}
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
                country: "",
                dob: "",
                gender: "Male",
                selectDate: "",
                address: "",
              });
            }}
          >
            + Add Student
          </button>
        </div>

        {/* TABLE */}
        <table style={tableStyle}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Courses</th>
              <th>Status</th>
              <th>Show</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Reset</th>
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
                <tr key={s._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td>{i + 1}</td>
                  <td>{s.fullName}</td>
                  <td>{s.email}</td>
                  <td>{s.courses?.map((c) => c.title).join(", ")}</td>
                  <td style={{ color: s.status === "Active" ? "green" : "red" }}>{s.status}</td>

                  <td>
                    <button style={viewBtn} onClick={() => setSelectedStudent(s)}>
                      <FaEye />
                    </button>
                  </td>

                  <td>
                    <button
                      style={editBtn}
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
                          country: s.country || "",
                          dob: s.dob?.split("T")[0] || "",
                          gender: s.gender || "Male",
                          selectDate: s.selectDate?.split("T")[0] || "",
                          address: s.address || "",
                        });
                      }}
                    >
                      <FaEdit />
                    </button>
                  </td>

                  <td>
                    <button style={deleteBtn} onClick={() => deleteUser(s._id).then(fetchStudents)}>
                      <FaTrash />
                    </button>
                  </td>

                  <td>
                    <button style={resetBtn} onClick={() => handleResetPassword(s._id)}>
                      <FaKey />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* SHOW DETAILS MODAL */}
        {selectedStudent && (
          <div style={overlay}>
            <div style={modalLarge}>
              <h3>👁 Complete User Information</h3>
              <p><b>Full Name:</b> {selectedStudent.fullName}</p>
              <p><b>Email:</b> {selectedStudent.email}</p>
              <p><b>Role:</b> {selectedStudent.role}</p>
              <p><b>Status:</b> {selectedStudent.status}</p>
              <p><b>Country:</b> {selectedStudent.country || "N/A"}</p>
              <p><b>Gender:</b> {selectedStudent.gender || "N/A"}</p>
              <p><b>Date of Birth:</b> {selectedStudent.dob ? selectedStudent.dob.split("T")[0] : "N/A"}</p>
              <p><b>Registration Date:</b> {selectedStudent.selectDate ? selectedStudent.selectDate.split("T")[0] : "N/A"}</p>
              <p><b>Address:</b> {selectedStudent.address || "N/A"}</p>
              <p><b>Courses:</b> {selectedStudent.courses && selectedStudent.courses.length > 0 ? selectedStudent.courses.map(c => c.title).join(", ") : "No course assigned"}</p>
              <p><b>Created At:</b> {selectedStudent.createdAt ? selectedStudent.createdAt.split("T")[0] : "N/A"}</p>
              <p><b>Updated At:</b> {selectedStudent.updatedAt ? selectedStudent.updatedAt.split("T")[0] : "N/A"}</p>
              <button onClick={() => setSelectedStudent(null)} style={closeBtn}>Close</button>
            </div>
          </div>
        )}

        {/* ADD / EDIT FORM */}
        {formVisible && (
          <div style={overlay}>
            <div style={modalLarge}>
              <h3>{editingStudent ? "Edit Student" : "Add New Student"}</h3>
              <form onSubmit={handleSubmit} style={formStyle}>
                <input style={inputStyle} placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                <input style={inputStyle} placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                {!editingStudent && <>
                  <input style={inputStyle} type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} />
                  <input style={inputStyle} type="password" placeholder="Confirm Password" onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                </>}
                <label style={{ fontWeight: "bold" }}>Courses</label>
                <div style={{ border: "1px solid #ccc", borderRadius: "6px", maxHeight: "150px", overflowY: "auto", padding: "8px" }}>
                  {courses.map(course => (
                    <label key={course._id} style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                      <input type="checkbox" checked={formData.courses.includes(course._id)} onChange={() => handleCheckbox(course._id)} />
                      <span style={{ marginLeft: "8px" }}>{course.title}</span>
                    </label>
                  ))}
                </div>
                <input style={inputStyle} placeholder="Country" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                <input style={inputStyle} type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                <select style={inputStyle} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <input style={inputStyle} type="date" value={formData.selectDate} onChange={e => setFormData({ ...formData, selectDate: e.target.value })} />
                <input style={inputStyle} placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                <select style={inputStyle} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                  <button type="submit" style={saveBtn}>{editingStudent ? "Update Student" : "Add Student"}</button>
                  <button type="button" onClick={() => setFormVisible(false)} style={cancelBtn}>Cancel</button>
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
const resetBtn = { background: "#3b82f6", color: "#fff", borderRadius: "6px", padding: "6px" };
const viewBtn = { background: "#10b981", color: "#fff", borderRadius: "6px", padding: "6px" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 };
const modalLarge = { background: "#fff", padding: "30px", borderRadius: "12px", width: "500px", maxHeight: "90vh", overflowY: "auto" };
const formStyle = { display: "flex", flexDirection: "column", gap: "12px" };
const saveBtn = { flex: 1, background: "#3b82f6", color: "#fff", padding: "10px", borderRadius: "6px", border: "none" };
const cancelBtn = { flex: 1, background: "#ef4444", color: "#fff", padding: "10px", borderRadius: "6px", border: "none" };
const closeBtn = { marginTop: "10px", background: "#ef4444", color: "#fff", padding: "6px 12px", borderRadius: "6px", border: "none" };

export default Students;

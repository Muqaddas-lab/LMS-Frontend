import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaKey, FaEye } from "react-icons/fa";
import { getAllUsers, deleteUser, updateUser, createUser, getCourses } from "../api/api";

// Reusable Modal Component
const Modal = ({ children, onClose }) => (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  }}>
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "12px",
      width: "500px",
      maxHeight: "90vh",
      overflowY: "auto",
    }}>
      {children}
    </div>
  </div>
);

// Course Checkbox List
const CoursesCheckbox = ({ courses, selectedCourses, onToggle }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ccc",
    padding: "8px",
    borderRadius: "6px",
    maxHeight: "150px",
    overflowY: "auto"
  }}>
    {courses.map(course => (
      <label
        key={course._id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "4px",
        }}
      >
        <div>
          <input
            type="checkbox"
            checked={selectedCourses.includes(course._id)}
            onChange={() => onToggle(course._id)}
          />
          <span style={{ marginLeft: "8px" }}>{course.title}</span>
        </div>
        {selectedCourses.includes(course._id) && (
          <button
            type="button"
            onClick={() => onToggle(course._id)}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              padding: "2px 6px",
              cursor: "pointer"
            }}
          >
            ❌
          </button>
        )}
      </label>
    ))}
  </div>
);

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    status: "Active",
    courses: [],
    country: "",
    dob: "",
    gender: "Male",
    selectDate: "",
  });

  // Fetch students (users with role "Student")
  const fetchStudents = async () => {
    try {
      const data = await getAllUsers();
      const studentsOnly = Array.isArray(data) ? data.filter(u => u.role === "Student") : [];
      setStudents(studentsOnly);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch students!");
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(Array.isArray(data) ? data : data.courses || []);
    } catch (error) {
      console.error(error);
      setCourses([]);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // Add Student
  const handleAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      status: "Active",
      courses: [],
      country: "",
      dob: "",
      gender: "Male",
      selectDate: "",
    });
    setFormVisible(true);
  };

  // Edit Student
  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.fullName || "",
      email: student.email || "",
      phone: student.phone || "",
      address: student.address || "",
      password: "",
      confirmPassword: "",
      status: student.status || "Active",
      courses: student.courses?.map(c => c._id) || [],
      country: student.country || "",
      dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
      gender: student.gender || "Male",
      selectDate: student.selectDate ? new Date(student.selectDate).toISOString().split("T")[0] : "",
    });
    setFormVisible(true);
  };

  // Show student details
  const handleShowDetails = (student) => setSelectedStudent(student);
  const handleCloseDetails = () => setSelectedStudent(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle course checkbox
  const handleCheckbox = (courseId) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(c => c !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteUser(id);
      fetchStudents();
    } catch (error) {
      console.error(error);
      alert("Failed to delete student!");
    }
  };

  // Reset password
  const handleResetPassword = async (studentId) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;
    try {
      await updateUser(studentId, { password: newPassword });
      alert("Password reset successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to reset password!");
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent && formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }
    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        role: "Student", // Always Student
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
        courses: formData.courses,
        country: formData.country,
        dob: formData.dob,
        gender: formData.gender,
        selectDate: formData.selectDate,
      };
      if (!editingStudent) payload.password = formData.password;

      if (editingStudent) {
        await updateUser(editingStudent._id, payload);
        alert("Student updated successfully!");
      } else {
        await createUser(payload);
        alert("Student created successfully!");
      }
      setFormVisible(false);
      fetchStudents();
    } catch (error) {
      console.error(error);
      alert("Failed to save student!");
    }
  };

  // Get course names
  const getCourseNames = (studentCourses) => {
    if (!Array.isArray(studentCourses)) return [];
    return studentCourses
      .map(c => (typeof c === "string" ? courses.find(cr => cr._id === c)?.title : c.title))
      .filter(Boolean);
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const courseTitles = getCourseNames(student.courses).join(" ").toLowerCase();
      return (
        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courseTitles.includes(searchTerm.toLowerCase())
      );
    });
  }, [students, searchTerm, courses]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "24px", background: "#f3f4f6", minHeight: "100vh", flex: 1 }}>
        <h2>🎓 Students Management</h2>

        {/* Search & Add */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0" }}>
          <input
            type="text"
            placeholder="Search by Name, Email, or Courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", flex: 1, marginRight: "10px" }}
          />
          <button
            onClick={handleAdd}
            style={{ background: "#f97316", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
          >
            + Add Student
          </button>
        </div>

        {/* Students Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Courses</th>
              <th>Show</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Reset Password</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <tr key={student._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td>{index + 1}</td>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td style={{ color: student.status === "Active" ? "green" : "red" }}>{student.status}</td>
                  <td>{student.phone || "-"}</td>
                  <td>
                    {getCourseNames(student.courses).map((course, i) => (
                      <span key={i} style={{
                        background: "#3b82f6",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        marginRight: "4px",
                        fontSize: "12px"
                      }}>{course}</span>
                    ))}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => handleShowDetails(student)} style={{ background: "#10b981", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}>
                      <FaEye />
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => handleEdit(student)} style={{ background: "#fde047", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}>
                      <FaEdit />
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => handleDelete(student._id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}>
                      <FaTrash />
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => handleResetPassword(student._id)} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}>
                      <FaKey />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No students found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add/Edit Form Modal */}
        {formVisible && (
          <Modal onClose={() => setFormVisible(false)}>
            <h3>{editingStudent ? "Edit Student" : "Add New Student"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              <label>Full Name</label>
              <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
              
              <label>Email</label>
              <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
              
              {!editingStudent && (
                <>
                  <label>Password</label>
                  <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                  
                  <label>Confirm Password</label>
                  <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                </>
              )}
              
              <label>Phone No</label>
              <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
              
              <label>Address</label>
              <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
              
              <label>Country</label>
              <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
              
              <label>Date of Birth</label>
              <input name="dob" type="date" value={formData.dob} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
              
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              
              <label>Selected Date</label>
              <input name="selectDate" type="date" value={formData.selectDate} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
              
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              {/* Courses */}
              <label><strong>Courses</strong></label>
              <CoursesCheckbox
                courses={courses}
                selectedCourses={formData.courses}
                onToggle={handleCheckbox}
              />

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button type="submit" style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#3b82f6", color: "#fff", flex: 1 }}>
                  {editingStudent ? "Update Student" : "Add Student"}
                </button>
                <button type="button" onClick={() => setFormVisible(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#ef4444", color: "#fff", flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Student Details Modal */}
        {selectedStudent && (
          <Modal onClose={handleCloseDetails}>
            <h3>👁 Student Details</h3>
            <p><strong>Full Name:</strong> {selectedStudent.fullName}</p>
            <p><strong>Email:</strong> {selectedStudent.email}</p>
            <p><strong>Role:</strong> {selectedStudent.role}</p>
            <p><strong>Status:</strong> {selectedStudent.status}</p>
            <p><strong>Phone:</strong> {selectedStudent.phone || "N/A"}</p>
            <p><strong>Address:</strong> {selectedStudent.address || "N/A"}</p>
            <p><strong>Country:</strong> {selectedStudent.country || "N/A"}</p>
            <p><strong>Date of Birth:</strong> {selectedStudent.dob ? new Date(selectedStudent.dob).toISOString().split("T")[0] : "N/A"}</p>
            <p><strong>Gender:</strong> {selectedStudent.gender || "N/A"}</p>
            <p><strong>Registration Date:</strong> {selectedStudent.selectDate ? new Date(selectedStudent.selectDate).toISOString().split("T")[0] : "N/A"}</p>
            <p><strong>Courses:</strong> {getCourseNames(selectedStudent.courses).join(", ") || "No courses assigned"}</p>
            <p><strong>Created At:</strong> {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toISOString().split("T")[0] : "N/A"}</p>
            <p><strong>Updated At:</strong> {selectedStudent.updatedAt ? new Date(selectedStudent.updatedAt).toISOString().split("T")[0] : "N/A"}</p>
            <button onClick={handleCloseDetails} style={{ marginTop: "12px", padding: "8px 16px", borderRadius: "6px", border: "none", background: "#ef4444", color: "#fff", cursor: "pointer" }}>
              Close
            </button>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Students;
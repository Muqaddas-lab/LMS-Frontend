import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAllUsers, getStudentEnrollments, enrollStudentInCourse, removeEnrollment, getCourses } from "../api/api";
import { FaTrash, FaPlus, FaEye } from "react-icons/fa";

const StudentEnrollments = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  // Fetch all students
  const fetchStudents = async () => {
    const data = await getAllUsers();
    setStudents(data.filter(u => u.role === "Student"));
  };

  // Fetch all courses
  const fetchCourses = async () => {
    const data = await getCourses();
    setCourses(Array.isArray(data) ? data : data.courses || []);
  };

  // Fetch enrollments for selected student
  const fetchEnrollments = async (studentId) => {
    const data = await getStudentEnrollments(studentId);
    setEnrollments(data);
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // Handle student selection
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    fetchEnrollments(student._id);
  };

  // Enroll student in course
  const handleEnroll = async () => {
    if (!selectedCourse || !selectedStudent) return;
    
    try {
      await enrollStudentInCourse(selectedStudent._id, selectedCourse);
      alert("Student enrolled successfully!");
      fetchEnrollments(selectedStudent._id);
      setShowEnrollModal(false);
      setSelectedCourse("");
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  // Remove enrollment
  const handleRemoveEnrollment = async (enrollmentId) => {
    if (!window.confirm("Remove this enrollment?")) return;
    
    try {
      await removeEnrollment(enrollmentId);
      alert("Enrollment removed successfully!");
      fetchEnrollments(selectedStudent._id);
    } catch (err) {
      alert("Failed to remove enrollment");
    }
  };

  // Get available courses (not already enrolled)
  const getAvailableCourses = () => {
    const enrolledCourseIds = enrollments.map(e => e.course._id);
    return courses.filter(c => !enrolledCourseIds.includes(c._id));
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      
      <div style={styles.container}>
        <h2>📚 Student Enrollments Management</h2>

        <div style={styles.mainContent}>
          {/* Students List */}
          <div style={styles.studentsList}>
            <h3>Students</h3>
            <div style={styles.studentsContainer}>
              {students.map(student => (
                <div
                  key={student._id}
                  style={{
                    ...styles.studentCard,
                    background: selectedStudent?._id === student._id ? "#3b82f6" : "#fff",
                    color: selectedStudent?._id === student._id ? "#fff" : "#000"
                  }}
                  onClick={() => handleSelectStudent(student)}
                >
                  <div style={styles.studentName}>{student.fullName}</div>
                  <div style={styles.studentEmail}>{student.email}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollments Details */}
          <div style={styles.enrollmentsSection}>
            {!selectedStudent ? (
              <div style={styles.emptyState}>
                <p>👈 Select a student to view enrollments</p>
              </div>
            ) : (
              <>
                <div style={styles.header}>
                  <h3>Enrollments for {selectedStudent.fullName}</h3>
                  <button
                    style={styles.addBtn}
                    onClick={() => setShowEnrollModal(true)}
                  >
                    <FaPlus /> Enroll in Course
                  </button>
                </div>

                {enrollments.length === 0 ? (
                  <div style={styles.noEnrollments}>
                    <p>No enrollments found</p>
                  </div>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Course</th>
                        <th>Enrolled Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment, idx) => (
                        <tr key={enrollment._id}>
                          <td>{idx + 1}</td>
                          <td>{enrollment.course.title}</td>
                          <td>{new Date(enrollment.enrolledAt).toLocaleDateString()}</td>
                          <td>
                            <span style={{
                              background: enrollment.status === "active" ? "#10b981" : "#ef4444",
                              color: "#fff",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "12px"
                            }}>
                              {enrollment.status}
                            </span>
                          </td>
                          <td>
                            <button
                              style={styles.deleteBtn}
                              onClick={() => handleRemoveEnrollment(enrollment._id)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>

        {/* Enroll Modal */}
        {showEnrollModal && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h3>Enroll Student in Course</h3>
              
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={styles.select}
              >
                <option value="">Select a course</option>
                {getAvailableCourses().map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              <div style={styles.modalActions}>
                <button
                  style={styles.saveBtn}
                  onClick={handleEnroll}
                  disabled={!selectedCourse}
                >
                  Enroll
                </button>
                <button
                  style={styles.cancelBtn}
                  onClick={() => {
                    setShowEnrollModal(false);
                    setSelectedCourse("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginLeft: "250px",
    padding: "30px",
    flex: 1,
    background: "#f3f4f6",
    minHeight: "100vh"
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "20px",
    marginTop: "20px"
  },
  studentsList: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    height: "fit-content"
  },
  studentsContainer: {
    marginTop: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "70vh",
    overflowY: "auto"
  },
  studentCard: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  studentName: {
    fontWeight: "600",
    marginBottom: "4px"
  },
  studentEmail: {
    fontSize: "12px",
    opacity: 0.8
  },
  enrollmentsSection: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px"
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    color: "#6b7280",
    fontSize: "18px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  addBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  noEnrollments: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalBox: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "400px"
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    marginTop: "15px",
    marginBottom: "20px"
  },
  modalActions: {
    display: "flex",
    gap: "10px"
  },
  saveBtn: {
    flex: 1,
    padding: "10px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    background: "#9ca3af",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default StudentEnrollments;
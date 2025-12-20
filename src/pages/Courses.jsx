import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaVideo } from "react-icons/fa";
import {
  getCourses,
  deleteCourse,
  updateCourse,
  createCourse,
} from "../api/api";

const Courses = () => {
  const [courses, setCourses] = useState([]); // always an array
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Programming",
    duration: 0,
    level: "Beginner",
    price: 0,
    status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // ================= FETCH COURSES =================
  const fetchCourses = async () => {
    try {
      const data = await getCourses();

      // Ensure courses is always an array
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Failed to fetch courses");
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ================= FORM HANDLERS =================
  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      category: "Programming",
      duration: 0,
      level: "Beginner",
      price: 0,
      status: "Active",
    });
    setShowForm(true);
  };

  const openEditForm = (course) => {
    setEditingId(course._id);
    setFormData({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "Programming",
      duration: course.duration || 0,
      level: course.level || "Beginner",
      price: course.price || 0,
      status: course.status || "Active",
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await updateCourse(editingId, formData);
        alert("Course updated successfully");
      } else {
        await createCourse(formData);
        alert("Course added successfully");
      }

      setShowForm(false);
      fetchCourses();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Delete failed");
    }
  };

  // ================= FILTER COURSES =================
  const filteredCourses = Array.isArray(courses)
    ? courses.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div
        style={{
          marginLeft: "250px",
          backgroundColor: "#f3f4f6",
          minHeight: "100vh",
          padding: "24px",
          flex: 1,
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Courses</h1>

        {/* ================= TABLE ================= */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "15px",
              alignItems: "center",
            }}
          >
            <h3>All Courses</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Search Courses"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                }}
              />
              <button
                onClick={openAddForm}
                style={{
                  background: "#f97316",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                + New Course
              </button>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Level</th>
                <th>Price</th>
                <th>Status</th>
                <th>Edit</th>
                <th>Delete</th>
                <th>Lectures</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, index) => (
                  <tr key={course._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td>{index + 1}</td>
                    <td>{course.title}</td>
                    <td>{course.category}</td>
                    <td>{course.duration}</td>
                    <td>{course.level}</td>
                    <td>{course.price}</td>
                    <td>{course.status}</td>
                    <td>
                      <button
                        onClick={() => openEditForm(course)}
                        style={{
                          background: "#fde047",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <FaEdit />
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(course._id)}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/lectures/${course._id}`)}
                        style={{
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <FaVideo /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= ADD / EDIT FORM POPUP ================= */}
        {showForm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "12px",
                width: "500px",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <h3 style={{ marginBottom: "20px" }}>
                {editingId ? "Edit Course" : "Add Course"}
              </h3>
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <label>Title</label>
                <input
                  name="title"
                  placeholder="Course Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />

                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Course Description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "8px" }}
                />

                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="AI">AI</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>

                <label>Duration (hours)</label>
                <input
                  name="duration"
                  type="number"
                  placeholder="Duration"
                  value={formData.duration}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px" }}
                />

                <label>Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>

                <label>Price</label>
                <input
                  name="price"
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px" }}
                />

                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      padding: "10px",
                      borderRadius: "6px",
                      flex: 1,
                    }}
                  >
                    {loading ? "Saving..." : editingId ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      background: "#9ca3af",
                      color: "#fff",
                      border: "none",
                      padding: "10px",
                      borderRadius: "6px",
                      flex: 1,
                    }}
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

export default Courses;

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaKey } from "react-icons/fa";
import { getAllUsers, deleteUser, updateUser, createUser, getCourses } from "../api/api";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Student",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    status: "Active",
    courses: [],
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch users!");
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

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  // Add / Edit handlers
  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "Student",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
      status: "Active",
      courses: [],
    });
    setFormVisible(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.fullName || "",
      email: user.email || "",
      role: user.role || "Student",
      phone: user.phone || "",
      address: user.address || "",
      password: "",
      confirmPassword: "",
      status: user.status || "Active",
      courses: user.courses?.map(c => c._id) || [],
    });
    setFormVisible(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter((c) => c !== courseId)
        : [...prev.courses, courseId],
    }));
  };

  const removeCourse = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c !== courseId),
    }));
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user!");
    }
  };

  // Reset password
  const handleResetPassword = async (userId) => {
    const newPassword = prompt("Enter new password:");
    if (!newPassword) return;
    try {
      await updateUser(userId, { password: newPassword });
      alert("Password reset successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to reset password!");
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser && formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
        courses: formData.courses,
      };

      if (!editingUser) payload.password = formData.password;

      if (editingUser) {
        await updateUser(editingUser._id, payload);
        alert("User updated successfully!");
      } else {
        await createUser(payload);
        alert("User created successfully!");
      }

      setFormVisible(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to save user!");
    }
  };

  // Display course names
  const getCourseNames = (userCourses) => {
    if (!Array.isArray(userCourses)) return [];
    // Check if course objects or ids
    return userCourses.map(c => (typeof c === "string" ? courses.find(cr => cr._id === c)?.title : c.title)).filter(Boolean);
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const courseTitles = getCourseNames(user.courses).join(" ").toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseTitles.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ marginLeft: "250px", padding: "24px", background: "#f3f4f6", minHeight: "100vh", flex: 1 }}>
        <h2>User Management</h2>

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
            + New User
          </button>
        </div>

        {/* Users Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Phone</th>
              <th>Courses</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Reset Password</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td>{index + 1}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td style={{ color: user.status === "Active" ? "green" : "red" }}>{user.status}</td>
                  <td>{user.phone || "-"}</td>
                  <td>
                    {getCourseNames(user.courses).map((course, i) => (
                      <span key={i} style={{ background: "#3b82f6", color: "#fff", padding: "2px 6px", borderRadius: "6px", marginRight: "4px", fontSize: "12px" }}>
                        {course}
                      </span>
                    ))}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => handleEdit(user)} style={{ background: "#fde047", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}>
                      <FaEdit />
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => handleDelete(user._id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}>
                      <FaTrash />
                    </button>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button onClick={() => handleResetPassword(user._id)} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}>
                      <FaKey />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add/Edit Form */}
        {formVisible && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
              <h3>{editingUser ? "Edit User" : "Add New User"}</h3>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                {!editingUser && (
                  <>
                    <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                    <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                  </>
                )}
                <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
                <select name="role" value={formData.role} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
                  <option value="Admin">Admin</option>
                  <option value="Student">Student</option>
                </select>
                <select name="status" value={formData.status} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                {/* Courses Checkboxes */}
                <div>
                  <label><strong>Courses</strong></label>
                  <div style={{ display: "flex", flexDirection: "column", border: "1px solid #ccc", padding: "8px", borderRadius: "6px", maxHeight: "150px", overflowY: "auto" }}>
                    {courses.map(course => (
                      <label key={course._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", color: formData.role === "Admin" ? "#9ca3af" : "#000" }}>
                        <div>
                          <input
                            type="checkbox"
                            checked={formData.courses.includes(course._id)}
                            onChange={() => handleCheckbox(course._id)}
                            disabled={formData.role === "Admin"} // Admin ke liye disable
                          /> {course.title}
                        </div>
                        {formData.courses.includes(course._id) && formData.role !== "Admin" && (
                          <button type="button" onClick={() => removeCourse(course._id)} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", padding: "2px 6px", cursor: "pointer" }}>❌</button>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button type="submit" style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#3b82f6", color: "#fff" }}>
                    {editingUser ? "Update User" : "Add User"}
                  </button>
                  <button type="button" onClick={() => setFormVisible(false)} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#ef4444", color: "#fff" }}>
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

export default UsersPage;


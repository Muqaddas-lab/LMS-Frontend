import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaKey } from "react-icons/fa";
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
      {onClose && (
        <button
          onClick={onClose}
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: "#ef4444",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Close
        </button>
      )}
    </div>
  </div>
);

// Course Checkbox List
const CoursesCheckbox = ({ courses, selectedCourses, onToggle, disabled }) => (
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
          color: disabled ? "#9ca3af" : "#000"
        }}
      >
        <div>
          <input
            type="checkbox"
            checked={selectedCourses.includes(course._id)}
            onChange={() => onToggle(course._id)}
            disabled={disabled}
          />
          {course.title}
        </div>
        {selectedCourses.includes(course._id) && !disabled && (
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

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
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
    country: "",
    dob: "",
    gender: "Male",
    selectDate: "",
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

  // Dynamic fetching (polling)
  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers();
      await fetchCourses();
    };

    fetchData(); // initial fetch

    const interval = setInterval(fetchData, 5000); // fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Add / Edit
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
      country: "",
      dob: "",
      gender: "Male",
      selectDate: "",
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
      country: user.country || "",
      dob: user.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
      gender: user.gender || "Male",
      selectDate: user.selectDate ? new Date(user.selectDate).toISOString().split("T")[0] : "",
    });
    setFormVisible(true);
  };

  const handleShowDetails = (user) => setSelectedUser(user);
  const handleCloseDetails = () => setSelectedUser(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (courseId) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(c => c !== courseId)
        : [...prev.courses, courseId]
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
        country: formData.country,
        dob: formData.dob,
        gender: formData.gender,
        selectDate: formData.selectDate,
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

  // Get course names
  const getCourseNames = (userCourses) => {
    if (!Array.isArray(userCourses)) return [];
    return userCourses
      .map(c => (typeof c === "string" ? courses.find(cr => cr._id === c)?.title : c.title))
      .filter(Boolean);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const courseTitles = getCourseNames(user.courses).join(" ").toLowerCase();
      return (
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courseTitles.includes(searchTerm.toLowerCase())
      );
    });
  }, [users, searchTerm, courses]);

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
              <th>Show</th>
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
                    <button onClick={() => handleShowDetails(user)} style={{ background: "#10b981", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}>Show</button>
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
                <td colSpan="11" style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add/Edit Form Modal */}
        {formVisible && (
          <Modal onClose={() => setFormVisible(false)}>
            <h3>{editingUser ? "Edit User" : "Add New User"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              <label>Full Name</label>
              <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
              <label>Email</label>
              <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
              {!editingUser && (
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
              <select name="role" value={formData.role} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
                <option value="Admin">Admin</option>
                <option value="Student">Student</option>
              </select>
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              {/* Courses */}
              <div>
                <label><strong>Courses</strong></label>
                <CoursesCheckbox
                  courses={courses}
                  selectedCourses={formData.courses}
                  onToggle={handleCheckbox}
                  disabled={formData.role === "Admin"}
                />
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
          </Modal>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <Modal onClose={handleCloseDetails}>
            <h3>User Details</h3>
            <p><strong>Name:</strong> {selectedUser.fullName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Status:</strong> {selectedUser.status}</p>
            <p><strong>Phone:</strong> {selectedUser.phone}</p>
            <p><strong>Address:</strong> {selectedUser.address}</p>
            <p><strong>Country:</strong> {selectedUser.country}</p>
            <p><strong>DOB:</strong> {selectedUser.dob}</p>
            <p><strong>Gender:</strong> {selectedUser.gender}</p>
            <p><strong>Courses:</strong> {getCourseNames(selectedUser.courses).join(", ")}</p>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default UsersPage;

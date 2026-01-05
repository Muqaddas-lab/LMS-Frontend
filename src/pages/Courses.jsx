// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { FaEdit, FaTrash, FaVideo } from "react-icons/fa";
// import {
//   getCourses,
//   deleteCourse,
//   updateCourse,
//   createCourse,
// } from "../api/api";

// const Courses = () => {
//   const [courses, setCourses] = useState([]); // always an array
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "Programming",
//     duration: 0,
//     level: "Beginner",
//     price: 0,
//     status: "Active",
//   });
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();

//   // ================= FETCH COURSES =================
//   const fetchCourses = async () => {
//     try {
//       const data = await getCourses();

//       // Ensure courses is always an array
//       if (Array.isArray(data)) {
//         setCourses(data);
//       } else if (Array.isArray(data.courses)) {
//         setCourses(data.courses);
//       } else {
//         setCourses([]);
//       }
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       alert("Failed to fetch courses");
//       setCourses([]);
//     }
//   };

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   // ================= FORM HANDLERS =================
//   const openAddForm = () => {
//     setEditingId(null);
//     setFormData({
//       title: "",
//       description: "",
//       category: "Programming",
//       duration: 0,
//       level: "Beginner",
//       price: 0,
//       status: "Active",
//     });
//     setShowForm(true);
//   };

//   const openEditForm = (course) => {
//     setEditingId(course._id);
//     setFormData({
//       title: course.title || "",
//       description: course.description || "",
//       category: course.category || "Programming",
//       duration: course.duration || 0,
//       level: course.level || "Beginner",
//       price: course.price || 0,
//       status: course.status || "Active",
//     });
//     setShowForm(true);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (editingId) {
//         await updateCourse(editingId, formData);
//         alert("Course updated successfully");
//       } else {
//         await createCourse(formData);
//         alert("Course added successfully");
//       }

//       setShowForm(false);
//       fetchCourses();
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       alert(error.response?.data?.message || "Operation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= DELETE =================
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this course?")) return;

//     try {
//       await deleteCourse(id);
//       fetchCourses();
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       alert("Delete failed");
//     }
//   };

//   // ================= FILTER COURSES =================
//   const filteredCourses = Array.isArray(courses)
//     ? courses.filter(
//         (course) =>
//           course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           course.category?.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     : [];

//   return (
//     <div style={{ display: "flex" }}>
//       <Sidebar />

//       <div
//         style={{
//           marginLeft: "250px",
//           backgroundColor: "#f3f4f6",
//           minHeight: "100vh",
//           padding: "24px",
//           flex: 1,
//         }}
//       >
//         <h1 style={{ marginBottom: "20px" }}>Courses</h1>

//         {/* ================= TABLE ================= */}
//         <div style={{ background: "#fff", padding: "20px", borderRadius: "12px" }}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginBottom: "15px",
//               alignItems: "center",
//             }}
//           >
//             <h3>All Courses</h3>
//             <div style={{ display: "flex", gap: "10px" }}>
//               <input
//                 type="text"
//                 placeholder="Search Courses"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{
//                   padding: "8px 12px",
//                   borderRadius: "8px",
//                   border: "1px solid #d1d5db",
//                 }}
//               />
//               <button
//                 onClick={openAddForm}
//                 style={{
//                   background: "#f97316",
//                   color: "#fff",
//                   border: "none",
//                   padding: "8px 16px",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                 }}
//               >
//                 + New Course
//               </button>
//             </div>
//           </div>

//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
//                 <th>#</th>
//                 <th>Title</th>
//                 <th>Category</th>
//                 <th>Duration</th>
//                 <th>Level</th>
//                 <th>Price</th>
//                 <th>Status</th>
//                 <th>Edit</th>
//                 <th>Delete</th>
//                 <th>Lectures</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredCourses.length === 0 ? (
//                 <tr>
//                   <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
//                     No courses found
//                   </td>
//                 </tr>
//               ) : (
//                 filteredCourses.map((course, index) => (
//                   <tr key={course._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
//                     <td>{index + 1}</td>
//                     <td>{course.title}</td>
//                     <td>{course.category}</td>
//                     <td>{course.duration}</td>
//                     <td>{course.level}</td>
//                     <td>{course.price}</td>
//                     <td>{course.status}</td>
//                     <td>
//                       <button
//                         onClick={() => openEditForm(course)}
//                         style={{
//                           background: "#fde047",
//                           border: "none",
//                           padding: "6px 10px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <FaEdit />
//                       </button>
//                     </td>
//                     <td>
//                       <button
//                         onClick={() => handleDelete(course._id)}
//                         style={{
//                           background: "#ef4444",
//                           color: "#fff",
//                           border: "none",
//                           padding: "6px 10px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <FaTrash />
//                       </button>
//                     </td>
//                     <td>
//                       <button
//                         onClick={() => navigate(`/lectures/${course._id}`)}
//                         style={{
//                           background: "#3b82f6",
//                           color: "#fff",
//                           border: "none",
//                           padding: "6px 10px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <FaVideo /> View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ================= ADD / EDIT FORM POPUP ================= */}
//         {showForm && (
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               backgroundColor: "rgba(0,0,0,0.5)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 1000,
//             }}
//           >
//             <div
//               style={{
//                 background: "#fff",
//                 padding: "30px",
//                 borderRadius: "12px",
//                 width: "500px",
//                 maxHeight: "90vh",
//                 overflowY: "auto",
//               }}
//             >
//               <h3 style={{ marginBottom: "20px" }}>
//                 {editingId ? "Edit Course" : "Add Course"}
//               </h3>
//               <form
//                 onSubmit={handleSubmit}
//                 style={{ display: "flex", flexDirection: "column", gap: "12px" }}
//               >
//                 <label>Title</label>
//                 <input
//                   name="title"
//                   placeholder="Course Title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   placeholder="Course Description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   required
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Category</label>
//                 <select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 >
//                   <option value="Programming">Programming</option>
//                   <option value="Design">Design</option>
//                   <option value="AI">AI</option>
//                   <option value="Business">Business</option>
//                   <option value="Other">Other</option>
//                 </select>

//                 <label>Duration (hours)</label>
//                 <input
//                   name="duration"
//                   type="number"
//                   placeholder="Duration"
//                   value={formData.duration}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Level</label>
//                 <select
//                   name="level"
//                   value={formData.level}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 >
//                   <option value="Beginner">Beginner</option>
//                   <option value="Intermediate">Intermediate</option>
//                   <option value="Advanced">Advanced</option>
//                 </select>

//                 <label>Price</label>
//                 <input
//                   name="price"
//                   type="number"
//                   placeholder="Price"
//                   value={formData.price}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Status</label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 >
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>

//                 <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     style={{
//                       background: "#3b82f6",
//                       color: "#fff",
//                       border: "none",
//                       padding: "10px",
//                       borderRadius: "6px",
//                       flex: 1,
//                     }}
//                   >
//                     {loading ? "Saving..." : editingId ? "Update" : "Add"}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setShowForm(false)}
//                     style={{
//                       background: "#9ca3af",
//                       color: "#fff",
//                       border: "none",
//                       padding: "10px",
//                       borderRadius: "6px",
//                       flex: 1,
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Courses;










// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { FaEdit, FaTrash, FaVideo } from "react-icons/fa";
// import { getCourses, deleteCourse, updateCourse, createCourse } from "../api/api";

// const Courses = () => {
//   const [courses, setCourses] = useState([]); 
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();

//   // ================= FORM DATA STATE =================
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "Programming",
//     subCategories: [], // <-- NEW
//     duration: 0,
//     level: "Beginner",
//     price: 0,
//     status: "Active",
//   });

//   // ================= FETCH COURSES =================
//   const fetchCourses = async () => {
//     try {
//       const data = await getCourses();
//       if (Array.isArray(data)) {
//         setCourses(data);
//       } else if (Array.isArray(data.courses)) {
//         setCourses(data.courses);
//       } else {
//         setCourses([]);
//       }
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       alert("Failed to fetch courses");
//       setCourses([]);
//     }
//   };

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   // ================= FORM HANDLERS =================
//   const openAddForm = () => {
//     setEditingId(null);
//     setFormData({
//       title: "",
//       description: "",
//       category: "Programming",
//       subCategories: [],
//       duration: 0,
//       level: "Beginner",
//       price: 0,
//       status: "Active",
//     });
//     setShowForm(true);
//   };

//   const openEditForm = (course) => {
//     setEditingId(course._id);
//     setFormData({
//       title: course.title || "",
//       description: course.description || "",
//       category: course.category || "Programming",
//       subCategories: course.subCategories || [], // <-- NEW
//       duration: course.duration || 0,
//       level: course.level || "Beginner",
//       price: course.price || 0,
//       status: course.status || "Active",
//     });
//     setShowForm(true);
//   };

//   const handleChange = (e) => {
//     const { name, value, selectedOptions } = e.target;

//     if (name === "subCategories") {
//       const values = Array.from(selectedOptions, (option) => option.value);
//       setFormData({ ...formData, subCategories: values });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = { ...formData };

//       if (editingId) {
//         await updateCourse(editingId, payload);
//         alert("Course updated successfully");
//       } else {
//         await createCourse(payload);
//         alert("Course added successfully");
//       }

//       setShowForm(false);
//       fetchCourses();
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       alert(error.response?.data?.message || "Operation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= DELETE =================
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this course?")) return;

//     try {
//       await deleteCourse(id);
//       fetchCourses();
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       alert("Delete failed");
//     }
//   };

//   // ================= FILTER COURSES =================
//   const filteredCourses = Array.isArray(courses)
//     ? courses.filter(
//         (course) =>
//           course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           course.subCategories?.some((sub) =>
//             sub.toLowerCase().includes(searchTerm.toLowerCase())
//           )
//       )
//     : [];

//   return (
//     <div style={{ display: "flex" }}>
//       <Sidebar />

//       <div
//         style={{
//           marginLeft: "250px",
//           backgroundColor: "#f3f4f6",
//           minHeight: "100vh",
//           padding: "24px",
//           flex: 1,
//         }}
//       >
//         <h1 style={{ marginBottom: "20px" }}>Courses</h1>

//         {/* ================= TABLE ================= */}
//         <div style={{ background: "#fff", padding: "20px", borderRadius: "12px" }}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginBottom: "15px",
//               alignItems: "center",
//             }}
//           >
//             <h3>All Courses</h3>
//             <div style={{ display: "flex", gap: "10px" }}>
//               <input
//                 type="text"
//                 placeholder="Search Courses"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{
//                   padding: "8px 12px",
//                   borderRadius: "8px",
//                   border: "1px solid #d1d5db",
//                 }}
//               />
//               <button
//                 onClick={openAddForm}
//                 style={{
//                   background: "#f97316",
//                   color: "#fff",
//                   border: "none",
//                   padding: "8px 16px",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                 }}
//               >
//                 + New Course
//               </button>
//             </div>
//           </div>

//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
//                 <th>#</th>
//                 <th>Title</th>
//                 <th>Category</th>
//                 <th>Subcategories</th> {/* NEW */}
//                 <th>Duration</th>
//                 <th>Level</th>
//                 <th>Price</th>
//                 <th>Status</th>
//                 <th>Edit</th>
//                 <th>Delete</th>
//                 <th>Lectures</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredCourses.length === 0 ? (
//                 <tr>
//                   <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
//                     No courses found
//                   </td>
//                 </tr>
//               ) : (
//                 filteredCourses.map((course, index) => (
//                   <tr key={course._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
//                     <td>{index + 1}</td>
//                     <td>{course.title}</td>
//                     <td>{course.category}</td>
//                     <td>{course.subCategories?.join(", ") || "-"}</td> {/* NEW */}
//                     <td>{course.duration}</td>
//                     <td>{course.level}</td>
//                     <td>{course.price}</td>
//                     <td>{course.status}</td>
//                     <td>
//                       <button
//                         onClick={() => openEditForm(course)}
//                         style={{
//                           background: "#fde047",
//                           border: "none",
//                           padding: "6px 10px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <FaEdit />
//                       </button>
//                     </td>
//                     <td>
//                       <button
//                         onClick={() => handleDelete(course._id)}
//                         style={{
//                           background: "#ef4444",
//                           color: "#fff",
//                           border: "none",
//                           padding: "6px 10px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <FaTrash />
//                       </button>
//                     </td>
//                     <td>
//                       <button
//                         onClick={() => navigate(`/lectures/${course._id}`)}
//                         style={{
//                           background: "#3b82f6",
//                           color: "#fff",
//                           border: "none",
//                           padding: "6px 10px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <FaVideo /> View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ================= ADD / EDIT FORM POPUP ================= */}
//         {showForm && (
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               backgroundColor: "rgba(0,0,0,0.5)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 1000,
//             }}
//           >
//             <div
//               style={{
//                 background: "#fff",
//                 padding: "30px",
//                 borderRadius: "12px",
//                 width: "500px",
//                 maxHeight: "90vh",
//                 overflowY: "auto",
//               }}
//             >
//               <h3 style={{ marginBottom: "20px" }}>
//                 {editingId ? "Edit Course" : "Add Course"}
//               </h3>
//               <form
//                 onSubmit={handleSubmit}
//                 style={{ display: "flex", flexDirection: "column", gap: "12px" }}
//               >
//                 <label>Title</label>
//                 <input
//                   name="title"
//                   placeholder="Course Title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   placeholder="Course Description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   required
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Category</label>
//                 <select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 >
//                   <option value="Programming">Programming</option>
//                   <option value="Design">Design</option>
//                   <option value="AI">AI</option>
//                   <option value="Business">Business</option>
//                   <option value="Other">Other</option>
//                 </select>

//                 <label>Subcategories</label>
//                 <select
//                   name="subCategories"
//                   value={formData.subCategories}
//                   onChange={handleChange}
//                   multiple
//                   style={{ width: "100%", padding: "8px", height: "100px" }}
//                 >
//                   <option value="Excel">Excel</option>
//                   <option value="Python">Python</option>
//                   <option value="TensorFlow">TensorFlow</option>
//                   <option value="PowerBI">PowerBI</option>
//                   <option value="Photoshop">Photoshop</option>
//                 </select>
//                 <small>Hold Ctrl (Cmd on Mac) to select multiple</small>

//                 <label>Duration (hours)</label>
//                 <input
//                   name="duration"
//                   type="number"
//                   placeholder="Duration"
//                   value={formData.duration}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Level</label>
//                 <select
//                   name="level"
//                   value={formData.level}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 >
//                   <option value="Beginner">Beginner</option>
//                   <option value="Intermediate">Intermediate</option>
//                   <option value="Advanced">Advanced</option>
//                 </select>

//                 <label>Price</label>
//                 <input
//                   name="price"
//                   type="number"
//                   placeholder="Price"
//                   value={formData.price}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Status</label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 >
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>

//                 <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     style={{
//                       background: "#3b82f6",
//                       color: "#fff",
//                       border: "none",
//                       padding: "10px",
//                       borderRadius: "6px",
//                       flex: 1,
//                     }}
//                   >
//                     {loading ? "Saving..." : editingId ? "Update" : "Add"}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setShowForm(false)}
//                     style={{
//                       background: "#9ca3af",
//                       color: "#fff",
//                       border: "none",
//                       padding: "10px",
//                       borderRadius: "6px",
//                       flex: 1,
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Courses;










// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { FaEdit, FaTrash, FaVideo } from "react-icons/fa";
// import { getCourses, deleteCourse, updateCourse, createCourse } from "../api/api";

// const Courses = () => {
//   const [courses, setCourses] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();

//   // ================= FORM DATA STATE =================
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "",
//     subCategories: [], // array of strings
//     duration: 0,
//     level: "",
//     price: 0,
//     status: "Active",
//   });

//   // ================= FETCH COURSES =================
//   const fetchCourses = async () => {
//     try {
//       const data = await getCourses();
//       if (Array.isArray(data)) {
//         setCourses(data);
//       } else if (Array.isArray(data.courses)) {
//         setCourses(data.courses);
//       } else {
//         setCourses([]);
//       }
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       alert("Failed to fetch courses");
//       setCourses([]);
//     }
//   };

//   useEffect(() => {
//     fetchCourses();
//   }, []);

//   // ================= FORM HANDLERS =================
//   const openAddForm = () => {
//     setEditingId(null);
//     setFormData({
//       title: "",
//       description: "",
//       category: "",
//       subCategories: [],
//       duration: 0,
//       level: "",
//       price: 0,
//       status: "Active",
//     });
//     setShowForm(true);
//   };

//   const openEditForm = (course) => {
//     setEditingId(course._id);
//     setFormData({
//       title: course.title || "",
//       description: course.description || "",
//       category: course.category || "",
//       subCategories: course.subCategories || [],
//       duration: course.duration || 0,
//       level: course.level || "",
//       price: course.price || 0,
//       status: course.status || "Active",
//     });
//     setShowForm(true);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "subCategories") {
//       // comma separated input
//       const values = value.split(",").map((v) => v.trim()).filter((v) => v !== "");
//       setFormData({ ...formData, subCategories: values });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = { ...formData };

//       // Convert subCategories to JSON string if backend expects string
//       if (Array.isArray(payload.subCategories)) {
//         payload.subCategories = JSON.stringify(payload.subCategories);
//       }

//       if (editingId) {
//         await updateCourse(editingId, payload);
//         alert("Course updated successfully");
//       } else {
//         await createCourse(payload);
//         alert("Course added successfully");
//       }

//       setShowForm(false);
//       fetchCourses();
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       alert(error.response?.data?.message || "Operation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= DELETE =================
//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this course?")) return;

//     try {
//       await deleteCourse(id);
//       fetchCourses();
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       alert("Delete failed");
//     }
//   };

//   // ================= FILTER COURSES =================
//   const filteredCourses = Array.isArray(courses)
//     ? courses.filter(
//         (course) =>
//           course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           course.subCategories?.some((sub) =>
//             sub.toLowerCase().includes(searchTerm.toLowerCase())
//           )
//       )
//     : [];

//   return (
//     <div style={{ display: "flex" }}>
//       <Sidebar />

//       <div
//         style={{
//           marginLeft: "250px",
//           backgroundColor: "#f3f4f6",
//           minHeight: "100vh",
//           padding: "24px",
//           flex: 1,
//         }}
//       >
//         <h1 style={{ marginBottom: "20px" }}>Courses</h1>

//         {/* ================= TABLE ================= */}
//         <div style={{ background: "#fff", padding: "20px", borderRadius: "12px" }}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginBottom: "15px",
//               alignItems: "center",
//             }}
//           >
//             <h3>All Courses</h3>
//             <div style={{ display: "flex", gap: "10px" }}>
//               <input
//                 type="text"
//                 placeholder="Search Courses"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{
//                   padding: "8px 12px",
//                   borderRadius: "8px",
//                   border: "1px solid #d1d5db",
//                 }}
//               />
//               <button
//                 onClick={openAddForm}
//                 style={{
//                   background: "#f97316",
//                   color: "#fff",
//                   border: "none",
//                   padding: "8px 16px",
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                 }}
//               >
//                 + New Course
//               </button>
//             </div>
//           </div>

//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
//                 <th>#</th>
//                 <th>Title</th>
//                 <th>Category</th>
//                 <th>Subcategories</th>
//                 <th>Duration</th>
//                 <th>Level</th>
//                 <th>Price</th>
//                 <th>Status</th>
//                 <th>Edit</th>
//                 <th>Delete</th>
//                 <th>Lectures</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredCourses.length === 0 ? (
//                 <tr>
//                   <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
//                     No courses found
//                   </td>
//                 </tr>
//               ) : (
//                 filteredCourses.map((course, index) => (
//                   <tr key={course._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
//                     <td>{index + 1}</td>
//                     <td>{course.title}</td>
//                     <td>{course.category}</td>
//                     <td>{course.subCategories?.join(", ") || "-"}</td>
//                     <td>{course.duration}</td>
//                     <td>{course.level}</td>
//                     <td>{course.price}</td>
//                     <td>{course.status}</td>
//                     <td>
//                       <button
//                         onClick={() => openEditForm(course)}
//                         style={{
//                           background: "#fde047",
//                           border: "none",
//                           padding: "6px 10px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <FaEdit />
//                       </button>
//                     </td>
//                     <td>
//                       <button
//                         onClick={() => handleDelete(course._id)}
//                         style={{
//                           background: "#ef4444",
//                           color: "#fff",
//                           border: "none",
//                           padding: "6px 10px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <FaTrash />
//                       </button>
//                     </td>
//                     <td>
//                       <button
//                         onClick={() => navigate(`/lectures/${course._id}`)}
//                         style={{
//                           background: "#3b82f6",
//                           color: "#fff",
//                           border: "none",
//                           padding: "6px 10px",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         <FaVideo /> View
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* ================= ADD / EDIT FORM POPUP ================= */}
//         {showForm && (
//           <div
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               backgroundColor: "rgba(0,0,0,0.5)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               zIndex: 1000,
//             }}
//           >
//             <div
//               style={{
//                 background: "#fff",
//                 padding: "30px",
//                 borderRadius: "12px",
//                 width: "500px",
//                 maxHeight: "90vh",
//                 overflowY: "auto",
//               }}
//             >
//               <h3 style={{ marginBottom: "20px" }}>
//                 {editingId ? "Edit Course" : "Add Course"}
//               </h3>
//               <form
//                 onSubmit={handleSubmit}
//                 style={{ display: "flex", flexDirection: "column", gap: "12px" }}
//               >
//                 <label>Title</label>
//                 <input
//                   name="title"
//                   placeholder="Course Title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   required
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   placeholder="Course Description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   required
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Category</label>
//                 <input
//                   name="category"
//                   placeholder="Enter category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Subcategories</label>
//                 <input
//                   name="subCategories"
//                   placeholder="Comma separated, e.g. Python,JS,Excel"
//                   value={formData.subCategories.join(", ")}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 />
//                 <small>Separate multiple subcategories with commas</small>

//                 <label>Duration (hours)</label>
//                 <input
//                   name="duration"
//                   type="number"
//                   placeholder="Duration"
//                   value={formData.duration}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Level</label>
//                 <input
//                   name="level"
//                   placeholder="Beginner / Intermediate / Advanced"
//                   value={formData.level}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Price</label>
//                 <input
//                   name="price"
//                   type="number"
//                   placeholder="Price"
//                   value={formData.price}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 />

//                 <label>Status</label>
//                 <select
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   style={{ width: "100%", padding: "8px" }}
//                 >
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>

//                 <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     style={{
//                       background: "#3b82f6",
//                       color: "#fff",
//                       border: "none",
//                       padding: "10px",
//                       borderRadius: "6px",
//                       flex: 1,
//                     }}
//                   >
//                     {loading ? "Saving..." : editingId ? "Update" : "Add"}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setShowForm(false)}
//                     style={{
//                       background: "#9ca3af",
//                       color: "#fff",
//                       border: "none",
//                       padding: "10px",
//                       borderRadius: "6px",
//                       flex: 1,
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Courses;







import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaEdit, FaTrash, FaVideo, FaPlus, FaTimes } from "react-icons/fa";
import { getCourses, deleteCourse, updateCourse, createCourse } from "../api/api";

// Predefined categories and subcategories
const CATEGORIES = [
  { 
    name: "Programming", 
    subcategories: ["Python", "JavaScript", "Java", "C++", "PHP", "Ruby", "Go", "Swift"]
  },
  { 
    name: "Web Development", 
    subcategories: ["Frontend", "Backend", "Full Stack", "React", "Angular", "Vue.js", "Node.js"]
  },
  { 
    name: "Data Science", 
    subcategories: ["Machine Learning", "AI", "Data Analysis", "Big Data", "Statistics", "Deep Learning"]
  },
  { 
    name: "Mobile Development", 
    subcategories: ["iOS", "Android", "React Native", "Flutter", "Kotlin", "Swift"]
  },
  { 
    name: "Design", 
    subcategories: ["UI/UX", "Graphic Design", "Web Design", "Adobe Photoshop", "Figma", "Adobe XD"]
  },
  { 
    name: "Business", 
    subcategories: ["Marketing", "Finance", "Management", "Entrepreneurship", "Sales", "Leadership"]
  },
  { 
    name: "Cloud Computing", 
    subcategories: ["AWS", "Azure", "Google Cloud", "DevOps", "Docker", "Kubernetes"]
  },
  { 
    name: "Database", 
    subcategories: ["MySQL", "MongoDB", "PostgreSQL", "Redis", "Firebase", "Oracle"]
  },
];

// Modal Component
const Modal = ({ children, onClose }) => (
  <div style={{
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
  }}>
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "12px",
      width: "600px",
      maxHeight: "90vh",
      overflowY: "auto",
    }}>
      {children}
    </div>
  </div>
);

// Category Checkbox Component
const CategoryCheckbox = ({ categories, selectedCategory, onSelect }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "6px",
    maxHeight: "200px",
    overflowY: "auto"
  }}>
    {categories.map(cat => (
      <label
        key={cat.name}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px",
          cursor: "pointer",
          backgroundColor: selectedCategory === cat.name ? "#e0f2fe" : "transparent",
          borderRadius: "4px",
          transition: "background-color 0.2s"
        }}
      >
        <input
          type="radio"
          checked={selectedCategory === cat.name}
          onChange={() => onSelect(cat.name)}
          style={{ marginRight: "8px" }}
        />
        <span style={{ fontWeight: selectedCategory === cat.name ? "600" : "400" }}>
          {cat.name}
        </span>
      </label>
    ))}
  </div>
);

// Subcategory Checkbox Component
const SubcategoryCheckbox = ({ subcategories, selectedSubcategories, onToggle }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "6px",
    maxHeight: "200px",
    overflowY: "auto",
    backgroundColor: subcategories.length === 0 ? "#f9fafb" : "transparent"
  }}>
    {subcategories.length === 0 ? (
      <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6b7280", margin: 0 }}>
        Please select a category first
      </p>
    ) : (
      subcategories.map(sub => (
        <label
          key={sub}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px",
            cursor: "pointer",
            backgroundColor: selectedSubcategories.includes(sub) ? "#dbeafe" : "transparent",
            borderRadius: "4px",
            transition: "background-color 0.2s"
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={selectedSubcategories.includes(sub)}
              onChange={() => onToggle(sub)}
              style={{ marginRight: "8px" }}
            />
            <span>{sub}</span>
          </div>
          {selectedSubcategories.includes(sub) && (
            <FaTimes
              onClick={(e) => {
                e.preventDefault();
                onToggle(sub);
              }}
              style={{
                color: "#ef4444",
                cursor: "pointer",
                fontSize: "12px"
              }}
            />
          )}
        </label>
      ))
    )}
  </div>
);

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subCategories: [],
    duration: 0,
    level: "Beginner",
    price: 0,
    status: "Active",
  });

  // Custom category/subcategory input
  const [customCategory, setCustomCategory] = useState("");
  const [customSubcategory, setCustomSubcategory] = useState("");

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const data = await getCourses();
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

  // Open add form
  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      subCategories: [],
      duration: 0,
      level: "Beginner",
      price: 0,
      status: "Active",
    });
    setCustomCategory("");
    setCustomSubcategory("");
    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (course) => {
    setEditingId(course._id);
    setFormData({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      subCategories: course.subCategories || [],
      duration: course.duration || 0,
      level: course.level || "Beginner",
      price: course.price || 0,
      status: course.status || "Active",
    });
    setCustomCategory("");
    setCustomSubcategory("");
    setShowForm(true);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle category selection
  const handleCategorySelect = (categoryName) => {
    setFormData({ ...formData, category: categoryName, subCategories: [] });
  };

  // Handle subcategory toggle
  const handleSubcategoryToggle = (subcategory) => {
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.includes(subcategory)
        ? prev.subCategories.filter(s => s !== subcategory)
        : [...prev.subCategories, subcategory]
    }));
  };

  // Add custom category
  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !CATEGORIES.find(c => c.name === customCategory.trim())) {
      setFormData({ ...formData, category: customCategory.trim(), subCategories: [] });
      setCustomCategory("");
    }
  };

  // Add custom subcategory
  const handleAddCustomSubcategory = () => {
    if (customSubcategory.trim() && !formData.subCategories.includes(customSubcategory.trim())) {
      setFormData(prev => ({
        ...prev,
        subCategories: [...prev.subCategories, customSubcategory.trim()]
      }));
      setCustomSubcategory("");
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };

      // Convert subCategories to JSON string if backend expects string
      if (Array.isArray(payload.subCategories)) {
        payload.subCategories = JSON.stringify(payload.subCategories);
      }

      if (editingId) {
        await updateCourse(editingId, payload);
        alert("Course updated successfully");
      } else {
        await createCourse(payload);
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

  // Delete course
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

  // Get available subcategories for selected category
  const getAvailableSubcategories = () => {
    const selectedCat = CATEGORIES.find(c => c.name === formData.category);
    return selectedCat ? selectedCat.subcategories : [];
  };

  // Filter courses
  const filteredCourses = Array.isArray(courses)
    ? courses.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.subCategories?.some((sub) =>
            sub.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    : [];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{
        marginLeft: "250px",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        padding: "24px",
        flex: 1,
      }}>
        <h1 style={{ marginBottom: "20px" }}>📚 Courses Management</h1>

        {/* Table Section */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
            alignItems: "center",
          }}>
            <h3>All Courses</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Search Courses..."
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
            <thead style={{ background: "#fafafa" }}>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>#</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Title</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Category</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Subcategories</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Duration</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Level</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Price</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Edit</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Delete</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Lectures</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course, index) => (
                  <tr key={course._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px" }}>{index + 1}</td>
                    <td style={{ padding: "12px" }}>{course.title}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        background: "#e0e7ff",
                        color: "#4338ca",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}>
                        {course.category}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {course.subCategories?.map((sub, i) => (
                        <span key={i} style={{
                          background: "#dbeafe",
                          color: "#1e40af",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          marginRight: "4px",
                          fontSize: "11px",
                          display: "inline-block",
                          marginBottom: "2px"
                        }}>
                          {sub}
                        </span>
                      )) || "-"}
                    </td>
                    <td style={{ padding: "12px" }}>{course.duration}h</td>
                    <td style={{ padding: "12px" }}>{course.level}</td>
                    <td style={{ padding: "12px" }}>${course.price}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        color: course.status === "Active" ? "#16a34a" : "#dc2626",
                        fontWeight: "500"
                      }}>
                        {course.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
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
                    <td style={{ padding: "12px", textAlign: "center" }}>
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
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => navigate(`/lectures/${course._id}`)}
                        style={{
                          background: "#3b82f6",
                          color: "#fff",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
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

        {/* Add/Edit Form Modal */}
        {showForm && (
          <Modal onClose={() => setShowForm(false)}>
            <h3 style={{ marginBottom: "20px" }}>
              {editingId ? "Edit Course" : "Add New Course"}
            </h3>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Course Title
                </label>
                <input
                  name="title"
                  placeholder="Enter course title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc"
                  }}
                />
              </div>

              <div>
                <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter course description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    resize: "vertical"
                  }}
                />
              </div>

              <div>
                <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Category
                </label>
                <CategoryCheckbox
                  categories={CATEGORIES}
                  selectedCategory={formData.category}
                  onSelect={handleCategorySelect}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <input
                    type="text"
                    placeholder="Or add custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomCategory())}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      fontSize: "13px"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>
                {formData.category && (
                  <div style={{ marginTop: "8px", fontSize: "13px", color: "#059669" }}>
                    Selected: <strong>{formData.category}</strong>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
                  Subcategories
                </label>
                <SubcategoryCheckbox
                  subcategories={getAvailableSubcategories()}
                  selectedSubcategories={formData.subCategories}
                  onToggle={handleSubcategoryToggle}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <input
                    type="text"
                    placeholder="Or add custom subcategory"
                    value={customSubcategory}
                    onChange={(e) => setCustomSubcategory(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomSubcategory())}
                    disabled={!formData.category}
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      fontSize: "13px"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubcategory}
                    disabled={!formData.category}
                    style={{
                      background: formData.category ? "#10b981" : "#9ca3af",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: formData.category ? "pointer" : "not-allowed",
                      fontSize: "13px"
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>
                {formData.subCategories.length > 0 && (
                  <div style={{ marginTop: "8px", fontSize: "13px" }}>
                    <strong>Selected:</strong>{" "}
                    {formData.subCategories.map((sub, i) => (
                      <span key={i} style={{
                        background: "#dbeafe",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        marginRight: "4px",
                        display: "inline-block",
                        marginBottom: "4px"
                      }}>
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
                    Duration (hours)
                  </label>
                  <input
                    name="duration"
                    type="number"
                    placeholder="Duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="0"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ccc"
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
                    Price ($)
                  </label>
                  <input
                    name="price"
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ccc"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ccc"
                    }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontWeight: "600", marginBottom: "6px", display: "block" }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid #ccc"
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

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
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? "Saving..." : editingId ? "Update Course" : "Add Course"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "10px",
                    borderRadius: "6px",
                    flex: 1,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Courses;

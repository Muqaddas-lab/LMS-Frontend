import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { getStudentEnrollments, getProgress, enrollStudentInCourse, getAllCourses } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaBook, FaClock, FaChartLine } from "react-icons/fa";

const StudentCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  const navigate = useNavigate();

  // ✅ Get studentId from localStorage
  const userInfo = localStorage.getItem("userInfo");
  let studentId = null;
  if (userInfo) {
    const parsed = JSON.parse(userInfo);
    studentId = parsed.id; // correct id
  }

  console.log("studentId:", studentId);

  // Fetch enrollments
  const fetchEnrollments = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const data = await getStudentEnrollments(studentId);
      setEnrollments(Array.isArray(data) ? data : []);
      
      // Fetch progress
      const progressMap = {};
      for (const e of data) {
        try {
          const res = await getProgress(studentId, e.course._id);
          progressMap[e.course._id] = res.progressPercentage || 0;
        } catch {
          progressMap[e.course._id] = 0;
        }
      }
      setProgressData(progressMap);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setEnrollments([fetchEnrollments]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available courses for enrollment
  const fetchAllCourses = async () => {
    try {
      const data = await getAllCourses(); // API to get all courses
      setAvailableCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchAllCourses();
  }, [studentId]);

  // Enroll student in selected course
  const handleEnrollCourse = async () => {
    if (!studentId || !selectedCourse) return;
    setEnrolling(true);
    try {
      const res = await enrollStudentInCourse(studentId, selectedCourse);
      console.log("Enroll response:", res);
      setSelectedCourse(""); // reset dropdown
      await fetchEnrollments(); // refresh enrollments
    } catch (err) {
      console.error("Error enrolling:", err);
    } finally {
      setEnrolling(false);
    }
  };

  const getStatus = (endDate, progress) => {
    if (progress === 100) return { text: "Completed", color: "#10b981", bg: "#d1fae5" };
    if (endDate && new Date(endDate) < new Date()) return { text: "Expired", color: "#ef4444", bg: "#fee2e2" };
    return { text: "Active", color: "#3b82f6", bg: "#dbeafe" };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#f9f9f9" }}>
        <StudentSidebar />
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9f9f9" }}>
      <StudentSidebar />

      <div style={{ flex: 1, marginLeft: "250px", padding: "30px" }}>
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827" }}>
            📚 My Enrolled Courses
          </h1>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            View and manage your enrolled courses
          </p>

          {/* Dropdown to select course */}
          <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", flex: 1 }}
            >
              <option value="">Select a course to enroll</option>
              {availableCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleEnrollCourse}
              disabled={enrolling || !selectedCourse}
              style={{
                padding: "8px 16px",
                background: "#3b82f6",
                color: "#fff",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              {enrolling ? "Enrolling..." : "Enroll"}
            </button>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              background: "#fff",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <FaBook size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
            <h3 style={{ color: "#374151", marginBottom: "8px" }}>No Courses Yet</h3>
            <p style={{ color: "#6b7280" }}>
              You are not enrolled in any courses yet. Use the dropdown above to enroll in a course.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;
              const progress = progressData[course._id] || 0;
              const status = getStatus(course.endDate, progress);

              return (
                <div
                  key={enrollment._id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                    border: "1px solid #e5e7eb",
                  }}
                  onClick={() => navigate(`/student/courses/${course._id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* Status Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ background: status.bg, color: status.color, padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                      {status.text}
                    </span>
                    <span style={{ color: "#6b7280", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <FaClock size={12} />
                      {course.duration || "N/A"} hrs
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px", lineHeight: "1.5" }}>
                    {course.description?.substring(0, 100)}
                    {course.description?.length > 100 ? "..." : ""}
                  </p>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FaChartLine size={12} />
                        Progress
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#3b82f6" }}>
                        {progress}%
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${progress}%`, height: "100%", background: progress === 100 ? "#10b981" : "#3b82f6", transition: "width 0.3s" }} />
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
                    <div>
                      <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Enrolled</p>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    {course.endDate && (
                      <div>
                        <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Ends On</p>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                          {new Date(course.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCoursesPage;















// import React, { useEffect, useState } from "react";
// import StudentSidebar from "../components/StudentSidebar";
// import { getStudentEnrollments, getProgress, enrollStudentInCourse, getAllCourses } from "../api/api";
// import { useNavigate } from "react-router-dom";
// import { FaBook, FaClock, FaChartLine } from "react-icons/fa";
// import { getUserId, isAuthenticated } from "../utils/auth"; // ⭐ Import helper

// const StudentCoursesPage = () => {
//   const [enrollments, setEnrollments] = useState([]);
//   const [progressData, setProgressData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [enrolling, setEnrolling] = useState(false);
//   const [availableCourses, setAvailableCourses] = useState([]);
//   const [selectedCourse, setSelectedCourse] = useState("");

//   const navigate = useNavigate();
//   const studentId = getUserId(); // ⭐ Use helper

//   console.log("📌 Student ID:", studentId);

//   // Fetch enrollments
//   const fetchEnrollments = async () => {
//     if (!studentId) {
//       console.error("❌ Cannot fetch enrollments - no studentId");
//       return;
//     }
    
//     try {
//       setLoading(true);
//       console.log("🔍 Fetching enrollments for student:", studentId);
      
//       const data = await getStudentEnrollments(studentId);
//       console.log("✅ Enrollments data:", data);
      
//       setEnrollments(Array.isArray(data) ? data : []);
      
//       // Fetch progress for each enrollment
//       const progressMap = {};
//       for (const e of data) {
//         try {
//           const res = await getProgress(studentId, e.course._id);
//           progressMap[e.course._id] = res.progressPercentage || 0;
//         } catch (err) {
//           console.error("Error fetching progress for course:", e.course._id, err);
//           progressMap[e.course._id] = 0;
//         }
//       }
//       setProgressData(progressMap);
//     } catch (err) {
//       console.error("❌ Error fetching enrollments:", err);
//       setEnrollments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch all available courses for enrollment
//   const fetchAllCourses = async () => {
//     try {
//       const data = await getAllCourses();
//       setAvailableCourses(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Error fetching courses:", err);
//     }
//   };

//   useEffect(() => {
//     // Check authentication
//     if (!isAuthenticated()) {
//       console.error("❌ User not authenticated");
//       navigate("/login");
//       return;
//     }

//     if (!studentId) {
//       console.error("❌ Student ID not found");
//       setLoading(false);
//       return;
//     }

//     fetchEnrollments();
//     fetchAllCourses();
//   }, [studentId, navigate]);

//   // Enroll student in selected course
//   const handleEnrollCourse = async () => {
//     if (!studentId || !selectedCourse) {
//       alert("Please select a course to enroll");
//       return;
//     }
    
//     setEnrolling(true);
//     try {
//       const res = await enrollStudentInCourse(studentId, selectedCourse);
//       console.log("✅ Enroll response:", res);
//       alert("Successfully enrolled in course!");
//       setSelectedCourse("");
//       await fetchEnrollments();
//     } catch (err) {
//       console.error("❌ Error enrolling:", err);
//       alert("Failed to enroll in course");
//     } finally {
//       setEnrolling(false);
//     }
//   };

//   const getStatus = (endDate, progress) => {
//     if (progress === 100) return { text: "Completed", color: "#10b981", bg: "#d1fae5" };
//     if (endDate && new Date(endDate) < new Date()) return { text: "Expired", color: "#ef4444", bg: "#fee2e2" };
//     return { text: "Active", color: "#3b82f6", bg: "#dbeafe" };
//   };

//   // Show error if no studentId
//   if (!studentId) {
//     return (
//       <div style={{ display: "flex", minHeight: "100vh", background: "#f9f9f9" }}>
//         <StudentSidebar />
//         <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
//           <div style={{ textAlign: "center" }}>
//             <h2 style={{ color: "#ef4444" }}>Authentication Error</h2>
//             <p>Unable to identify student. Please login again.</p>
//             <button
//               onClick={() => navigate("/login")}
//               style={{
//                 marginTop: 20,
//                 padding: "12px 24px",
//                 background: "#3b82f6",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: 8,
//                 cursor: "pointer"
//               }}
//             >
//               Go to Login
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div style={{ display: "flex", minHeight: "100vh", background: "#f9f9f9" }}>
//         <StudentSidebar />
//         <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
//           <p>Loading courses...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", background: "#f9f9f9" }}>
//       <StudentSidebar />

//       <div style={{ flex: 1, marginLeft: "250px", padding: "30px" }}>
//         <div style={{ marginBottom: "30px" }}>
//           <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111827" }}>
//             📚 My Enrolled Courses
//           </h1>
//           <p style={{ color: "#6b7280", marginTop: "8px" }}>
//             View and manage your enrolled courses
//           </p>

//           {/* Dropdown to select course */}
//           <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
//             <select
//               value={selectedCourse}
//               onChange={(e) => setSelectedCourse(e.target.value)}
//               style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", flex: 1 }}
//             >
//               <option value="">Select a course to enroll</option>
//               {availableCourses.map((course) => (
//                 <option key={course._id} value={course._id}>
//                   {course.title}
//                 </option>
//               ))}
//             </select>
//             <button
//               onClick={handleEnrollCourse}
//               disabled={enrolling || !selectedCourse}
//               style={{
//                 padding: "8px 16px",
//                 background: enrolling || !selectedCourse ? "#9ca3af" : "#3b82f6",
//                 color: "#fff",
//                 borderRadius: "6px",
//                 border: "none",
//                 cursor: enrolling || !selectedCourse ? "not-allowed" : "pointer",
//               }}
//             >
//               {enrolling ? "Enrolling..." : "Enroll"}
//             </button>
//           </div>
//         </div>

//         {enrollments.length === 0 ? (
//           <div
//             style={{
//               padding: "60px 20px",
//               background: "#fff",
//               borderRadius: "12px",
//               textAlign: "center",
//               boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//             }}
//           >
//             <FaBook size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
//             <h3 style={{ color: "#374151", marginBottom: "8px" }}>No Courses Yet</h3>
//             <p style={{ color: "#6b7280" }}>
//               You are not enrolled in any courses yet. Use the dropdown above to enroll in a course.
//             </p>
//           </div>
//         ) : (
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
//               gap: "24px",
//             }}
//           >
//             {enrollments.map((enrollment) => {
//               const course = enrollment.course;
//               if (!course) return null;
//               const progress = progressData[course._id] || 0;
//               const status = getStatus(course.endDate, progress);

//               return (
//                 <div
//                   key={enrollment._id}
//                   style={{
//                     background: "#fff",
//                     borderRadius: "12px",
//                     padding: "24px",
//                     boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                     transition: "all 0.2s",
//                     cursor: "pointer",
//                     border: "1px solid #e5e7eb",
//                   }}
//                   onClick={() => navigate(`/student/courses/${course._id}`)}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = "translateY(-4px)";
//                     e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = "translateY(0)";
//                     e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
//                   }}
//                 >
//                   {/* Status Badge */}
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
//                     <span style={{ background: status.bg, color: status.color, padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
//                       {status.text}
//                     </span>
//                     <span style={{ color: "#6b7280", fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" }}>
//                       <FaClock size={12} />
//                       {course.duration || "N/A"} hrs
//                     </span>
//                   </div>

//                   {/* Course Title */}
//                   <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "8px" }}>
//                     {course.title}
//                   </h3>

//                   {/* Course Description */}
//                   <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "16px", lineHeight: "1.5" }}>
//                     {course.description?.substring(0, 100)}
//                     {course.description?.length > 100 ? "..." : ""}
//                   </p>

//                   {/* Progress Bar */}
//                   <div style={{ marginBottom: "12px" }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
//                       <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "flex", alignItems: "center", gap: "4px" }}>
//                         <FaChartLine size={12} />
//                         Progress
//                       </span>
//                       <span style={{ fontSize: "14px", fontWeight: "700", color: "#3b82f6" }}>
//                         {progress}%
//                       </span>
//                     </div>
//                     <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
//                       <div style={{ width: `${progress}%`, height: "100%", background: progress === 100 ? "#10b981" : "#3b82f6", transition: "width 0.3s" }} />
//                     </div>
//                   </div>

//                   {/* Dates */}
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
//                     <div>
//                       <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Enrolled</p>
//                       <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
//                         {new Date(enrollment.enrolledAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                     {course.endDate && (
//                       <div>
//                         <p style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "4px" }}>Ends On</p>
//                         <p style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
//                           {new Date(course.endDate).toLocaleDateString()}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StudentCoursesPage;
import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar"; 
import { FaBook, FaVideo, FaCheck, FaClock } from "react-icons/fa";
import {
  getStudentEnrollments,
  getProgress,
  getAllCourses,
  enrollStudentInCourse,
} from "../api/api";

const StudentDashboard = () => {
  const [myCourses, setMyCourses] = useState(0);
  const [totalLectures, setTotalLectures] = useState(0);
  const [completedLectures, setCompletedLectures] = useState(0);
  const [remainingLectures, setRemainingLectures] = useState(0);
  const [subscriptionTime, setSubscriptionTime] = useState("Loading...");
  const [coursesList, setCoursesList] = useState([]);
  const [enrollData, setEnrollData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    dob: "",
    gender: "",
    courses: "",
    idCard: null,
    message: "",
    agree: false,
  });

  const userInfo = localStorage.getItem("userInfo");
  const studentId = userInfo ? JSON.parse(userInfo)._id || JSON.parse(userInfo).id : null;

  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    fetchDashboard();
    fetchCourses();
  }, []);

  const fetchDashboard = async () => {
    if (!studentId) return;
    const enrollments = await getStudentEnrollments(studentId);
    setEnrolledCourses(enrollments.map(e => e.course._id));
    setMyCourses(enrollments.length);

    let total = 0,
      completed = 0;

    for (const e of enrollments) {
      const progress = await getProgress(studentId, e.course._id);
      total += progress.totalLectures || 0;
      completed += progress.completedLectures?.length || 0;
    }

    setTotalLectures(total);
    setCompletedLectures(completed);
    setRemainingLectures(total - completed);

    if (enrollments[0]?.course?.endDate) {
      const diff = new Date(enrollments[0].course.endDate) - new Date();
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      setSubscriptionTime(`${d} Days Remaining`);
    }
  };

  const fetchCourses = async () => {
    const res = await getAllCourses();
    setCoursesList(res);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setEnrollData({
      ...enrollData,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  };

  const handleEnroll = async (e) => {
    e.preventDefault();

    if (!enrollData.courses) {
      alert("Please select a course");
      return;
    }
    if (!enrollData.agree) {
      alert("You must agree to the rules");
      return;
    }
    if (enrolledCourses.includes(enrollData.courses)) {
      alert("You are already enrolled in this course");
      return;
    }

    try {
      await enrollStudentInCourse(studentId, enrollData.courses);
      alert("Enrolled successfully!");
      fetchDashboard(); // Refresh dashboard after enrollment
    } catch (err) {
      console.error("Enroll Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Enrollment failed! Please try again.");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <StudentSidebar />

      <div style={{ flex: 1, marginLeft: 250, padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Student Dashboard</h1>

        <div style={cardGrid}>
          <StatCard icon={<FaBook />} title="My Courses" value={myCourses} />
          <StatCard icon={<FaVideo />} title="Total Lectures" value={totalLectures} />
          <StatCard icon={<FaCheck />} title="Completed" value={completedLectures} />
          <StatCard icon={<FaClock />} title="Remaining" value={remainingLectures} />
          <StatCard icon={<FaClock />} title="Time Left" value={subscriptionTime} />
        </div>

        <div style={formWrapper}>
          <h2 style={{ marginBottom: 10 }}>Enroll Now</h2>

          <form style={formStyle} onSubmit={handleEnroll}>
            <LabelInput label="Full Name" name="name" onChange={handleChange} />
            <LabelInput label="Email Address" name="email" onChange={handleChange} />
            <LabelInput label="Phone Number" name="phone" onChange={handleChange} />
            <LabelInput label="Date of Birth" name="dob" onChange={handleChange} />

            <div>
              <label>Gender</label>
              <select name="gender" onChange={handleChange} style={inputStyle}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <LabelInput label="Country" name="country" onChange={handleChange} />

            <div>
              <label>Course</label>
              <select name="courses" onChange={handleChange} style={inputStyle}>
                <option value="">Select Course</option>
                {coursesList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* <div>
              <label>ID Card</label>
              <input type="file" name="idCard" onChange={handleChange} />
            </div> */}

            <div>
              <label>Message</label>
              <textarea name="message" onChange={handleChange} style={textareaStyle} />
            </div>

            <textarea
              readOnly
              value="Lectures downloads, screenshots, screen recordings, and sharing links are strictly prohibited. Any violation will be considered illegal."
              style={noteStyle}
            />

            <label>
              <input type="checkbox" name="agree" onChange={handleChange} /> I agree to the rules
            </label>

            <button type="submit" style={buttonStyle}>
              Submit & Pay
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ===== REUSABLE COMPONENTS ===== */
const StatCard = ({ icon, title, value }) => (
  <div style={statCard}>
    <div style={{ fontSize: 22 }}>{icon}</div>
    <div>{title}</div>
    <b style={{ fontSize: 18 }}>{value}</b>
  </div>
);

const LabelInput = ({ label, name, onChange }) => (
  <div>
    <label>{label}</label>
    <input name={name} onChange={onChange} style={inputStyle} />
  </div>
);

/* ===== STYLES ===== */
const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 20,
  marginBottom: 40,
};

const statCard = {
  background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
  color: "#fff",
  padding: 20,
  borderRadius: 14,
  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
};

const formWrapper = {
  maxWidth: 480,
  margin: "auto",
  background: "#fff",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const textareaStyle = { ...inputStyle, height: 80 };

const noteStyle = {
  background: "#f3f4f6",
  padding: 10,
  borderRadius: 6,
  border: "none",
};

const buttonStyle = {
  background: "#1e3a8a",
  color: "#fff",
  padding: 12,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
};

export default StudentDashboard;

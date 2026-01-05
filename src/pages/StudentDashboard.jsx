import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { FaBook, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import {
  getStudentEnrollments,
  getProgress,
  getAllCourses,
  enrollStudentInCourse,
} from "../api/api";

const StudentDashboard = () => {
  /* ================= USER INFO ================= */
  const userInfo = localStorage.getItem("userInfo");
  const parsedUser = userInfo ? JSON.parse(userInfo) : null;

  const studentId = parsedUser?._id || parsedUser?.id || null;
  const studentName = parsedUser?.fullName || parsedUser?.name || "Student";

  /* ================= STATES ================= */
  const [loading, setLoading] = useState(true);
  const [myCourses, setMyCourses] = useState(0);
  const [subscriptionTime, setSubscriptionTime] = useState("Loading...");
  const [coursesList, setCoursesList] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [enrollData, setEnrollData] = useState({
    name: parsedUser?.fullName || "",
    email: parsedUser?.email || "",
    phone: "",
    country: "",
    dob: "",
    gender: "",
    courses: "",
    message: "",
    agree: false,
  });

  /* ================= EFFECTS ================= */
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchCourses()]);
      setLoading(false);
    };
    initializeDashboard();
  }, []);

  /* ================= FUNCTIONS ================= */
  const fetchDashboard = async () => {
    if (!studentId) return;

    try {
      const enrollments = await getStudentEnrollments(studentId);
      setMyCourses(enrollments.length);
      setEnrolledCourses(enrollments.map((e) => e.course._id));

      if (enrollments[0]?.course?.endDate) {
        const diff = new Date(enrollments[0].course.endDate) - new Date();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        setSubscriptionTime(days > 0 ? `${days} Days Remaining` : "Expired");
      } else {
        setSubscriptionTime("N/A");
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await getAllCourses();
      setCoursesList(res);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!enrollData.name.trim()) newErrors.name = "Full name is required";
    if (!enrollData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enrollData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!enrollData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!enrollData.country.trim()) newErrors.country = "Country is required";
    if (!enrollData.dob) newErrors.dob = "Date of birth is required";
    if (!enrollData.gender) newErrors.gender = "Gender is required";
    if (!enrollData.courses) newErrors.courses = "Please select a course";
    if (!enrollData.agree) newErrors.agree = "You must agree to the rules";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEnrollData({
      ...enrollData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (enrolledCourses.includes(enrollData.courses)) {
      setErrors({ courses: "You are already enrolled in this course" });
      return;
    }

    setIsSubmitting(true);

    try {
      await enrollStudentInCourse(studentId, enrollData.courses);
      
      // Show success message
      alert("✅ Enrolled successfully!");
      
      // Reset form
      setEnrollData({
        name: parsedUser?.fullName || "",
        email: parsedUser?.email || "",
        phone: "",
        country: "",
        dob: "",
        gender: "",
        courses: "",
        message: "",
        agree: false,
      });
      
      // Refresh dashboard
      await fetchDashboard();
    } catch (err) {
      setErrors({
        submit: err.response?.data?.message || "Enrollment failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <StudentSidebar />
        <div style={loadingContainer}>
          <div style={spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <StudentSidebar />

      <div style={mainContainer}>
        {/* 🔹 HEADER SECTION */}
        <div style={headerSection}>
          <div>
            <h1 style={welcomeText}>
              Welcome back, <span style={{ color: "#0284c7" }}>{studentName}</span> 👋
            </h1>
            <p style={subtitleText}>Here's your learning overview and progress</p>
          </div>
        </div>

        {/* 🔹 STATISTICS CARDS */}
        <div style={cardGrid}>
          <StatCard
            icon={<FaBook />}
            title="My Courses"
            value={myCourses}
            subtitle={`${myCourses} ${myCourses === 1 ? 'course' : 'courses'} enrolled`}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <StatCard
            icon={<FaClock />}
            title="Subscription Time"
            value={subscriptionTime}
            subtitle="Until your access expires"
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </div>

        {/* 🔹 ENROLLMENT FORM */}
        <div style={formSection}>
          <div style={formHeader}>
            <h2 style={formTitle}>Enroll in a New Course</h2>
            <p style={formSubtitle}>Fill out the form below to enroll in your desired course</p>
          </div>

          <div style={formStyle} onSubmit={handleEnroll}>
            <div style={formGrid}>
              <FormInput
                label="Full Name"
                name="name"
                value={enrollData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={enrollData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
            </div>

            <div style={formGrid}>
              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={enrollData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
              />
              <FormInput
                label="Country"
                name="country"
                value={enrollData.country}
                onChange={handleChange}
                error={errors.country}
                required
              />
            </div>

            <div style={formGrid}>
              <FormInput
                label="Date of Birth"
                name="dob"
                type="date"
                value={enrollData.dob}
                onChange={handleChange}
                error={errors.dob}
                required
              />
              <FormSelect
                label="Gender"
                name="gender"
                value={enrollData.gender}
                onChange={handleChange}
                error={errors.gender}
                options={["Male", "Female", "Other"]}
                required
              />
            </div>

            <FormSelect
              label="Select Course"
              name="courses"
              value={enrollData.courses}
              onChange={handleChange}
              error={errors.courses}
              options={coursesList.map((c) => ({ value: c._id, label: c.title }))}
              required
            />

            <div style={fieldContainer}>
              <label style={labelStyle}>Message (Optional)</label>
              <textarea
                name="message"
                value={enrollData.message}
                onChange={handleChange}
                style={textareaStyle}
                placeholder="Add any additional information or questions..."
                rows={4}
              />
            </div>

            <div style={rulesContainer}>
              <FaExclamationCircle style={{ color: "#f59e0b", fontSize: 18 }} />
              <p style={rulesText}>
                Lectures downloads, screenshots, recordings, and sharing are strictly prohibited.
              </p>
            </div>

            <label style={checkboxLabel}>
              <input
                type="checkbox"
                name="agree"
                checked={enrollData.agree}
                onChange={handleChange}
                style={checkboxStyle}
              />
              <span>I agree to the terms and rules stated above</span>
            </label>
            {errors.agree && <ErrorMessage message={errors.agree} />}
            {errors.submit && <ErrorMessage message={errors.submit} />}

            <button type="button" onClick={handleEnroll} style={submitButton} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div style={buttonSpinner}></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Submit & Proceed to Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */
const StatCard = ({ icon, title, value, subtitle, gradient }) => (
  <div style={{ ...statCard, background: gradient }}>
    <div style={statIconContainer}>{icon}</div>
    <div style={statContent}>
      <h3 style={statTitle}>{title}</h3>
      <p style={statValue}>{value}</p>
      <p style={statSubtitle}>{subtitle}</p>
    </div>
  </div>
);

const FormInput = ({ label, name, type = "text", value, onChange, error, required }) => (
  <div style={fieldContainer}>
    <label style={labelStyle}>
      {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      style={{ ...inputStyle, ...(error ? errorInputStyle : {}) }}
    />
    {error && <ErrorMessage message={error} />}
  </div>
);

const FormSelect = ({ label, name, value, onChange, error, options, required }) => (
  <div style={fieldContainer}>
    <label style={labelStyle}>
      {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      style={{ ...inputStyle, ...(error ? errorInputStyle : {}) }}
    >
      <option value="">Select {label}</option>
      {options.map((opt) =>
        typeof opt === "string" ? (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ) : (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )
      )}
    </select>
    {error && <ErrorMessage message={error} />}
  </div>
);

const ErrorMessage = ({ message }) => (
  <p style={errorText}>
    <FaExclamationCircle style={{ fontSize: 12 }} /> {message}
  </p>
);

/* ================= STYLES ================= */
const loadingContainer = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 250,
};

const spinner = {
  width: 50,
  height: 50,
  border: "4px solid #e5e7eb",
  borderTop: "4px solid #0284c7",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const mainContainer = {
  flex: 1,
  marginLeft: 250,
  padding: "32px 40px",
  maxWidth: 1400,
};

const headerSection = {
  marginBottom: 32,
};

const welcomeText = {
  fontSize: 32,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 8,
};

const subtitleText = {
  fontSize: 16,
  color: "#64748b",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 24,
  marginBottom: 48,
};

const statCard = {
  color: "#fff",
  padding: 28,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  display: "flex",
  alignItems: "center",
  gap: 20,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
};

const statIconContainer = {
  fontSize: 36,
  opacity: 0.9,
};

const statContent = {
  flex: 1,
};

const statTitle = {
  fontSize: 14,
  fontWeight: 500,
  opacity: 0.9,
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const statValue = {
  fontSize: 28,
  fontWeight: 700,
  marginBottom: 4,
};

const statSubtitle = {
  fontSize: 13,
  opacity: 0.8,
};

const formSection = {
  maxWidth: 800,
  margin: "0 auto",
  background: "#fff",
  padding: 40,
  borderRadius: 20,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
};

const formHeader = {
  marginBottom: 32,
  textAlign: "center",
};

const formTitle = {
  fontSize: 28,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 8,
};

const formSubtitle = {
  fontSize: 15,
  color: "#64748b",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
  }
};

const fieldContainer = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
};

const inputStyle = {
  width: "90%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "2px solid #e2e8f0",
  fontSize: 14,
  transition: "border-color 0.3s ease",
  outline: "none",
  fontFamily: "inherit",
};

const errorInputStyle = {
  borderColor: "#ef4444",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  fontFamily: "inherit",
};

const rulesContainer = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: 16,
  backgroundColor: "#fef3c7",
  borderRadius: 10,
  border: "1px solid #fde68a",
};

const rulesText = {
  fontSize: 13,
  color: "#92400e",
  margin: 0,
  lineHeight: 1.6,
};

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 14,
  color: "#475569",
  cursor: "pointer",
};

const checkboxStyle = {
  width: 18,
  height: 18,
  cursor: "pointer",
};

const errorText = {
  fontSize: 13,
  color: "#ef4444",
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 4,
};

const submitButton = {
  background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
  color: "#fff",
  padding: "14px 32px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)",
};

const buttonSpinner = {
  width: 16,
  height: 16,
  border: "2px solid rgba(255,255,255,0.3)",
  borderTop: "2px solid #fff",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};

// Add keyframe animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(2, 132, 199, 0.4);
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  input:focus, select:focus, textarea:focus {
    border-color: #0284c7;
  }
`;
document.head.appendChild(styleSheet);

export default StudentDashboard;
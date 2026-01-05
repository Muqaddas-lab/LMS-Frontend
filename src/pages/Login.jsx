import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/api';
import ATLogo from '../assets/AT.png';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student', // default role
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // ✅ Save token in localStorage for API calls
      if (response.token) {
        localStorage.setItem('userInfo', JSON.stringify(response));
      }

      // Update AuthContext
      login(response.user);

      // // Navigate based on role
      // if (response.user.role.toLowerCase() === 'admin') {
      //   navigate('/admin/dashboard');
      // } else {
      //   navigate('/dashboard');
      // }
    if (response.user.role.toLowerCase() === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/student/dashboard");
    }

    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed. Please check your credentials.');
      if (error.errors) setErrors(error.errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "350px",
        margin: "50px auto",
        padding: "25px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <img src={ATLogo} alt="AT Logo" style={{ width: "100px", marginBottom: "2px" }} />
      </div>

      <h2 style={{
        textAlign: "center",
        marginBottom: "15px",
        color: "#2563eb",
        fontSize: "16px",
        fontWeight: "700"
      }}>
        Learning Management System
      </h2>

      {/* Email input */}
      <div style={{ position: "relative" }}>
        <FaUser style={{
          position: "absolute",
          left: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#888"
        }} />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          style={{
            width: "87%",
            padding: "10px 10px 10px 35px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }}
        />
        {errors.email && <span style={{ color: "red", fontSize: "12px" }}>{errors.email}</span>}
      </div>

      {/* Password input */}
      <div style={{ position: "relative" }}>
        <FaLock style={{
          position: "absolute",
          left: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#888"
        }} />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          style={{
            width: "87%",
            padding: "10px 10px 10px 35px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }}
        />
        {errors.password && <span style={{ color: "red", fontSize: "12px" }}>{errors.password}</span>}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "12px",
          border: "none",
          borderRadius: "8px",
          backgroundColor: loading ? "#888" : "#2563eb",
          color: "#fff",
          fontWeight: "600",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          transition: "0.3s"
        }}
        onMouseOver={e => !loading && (e.currentTarget.style.backgroundColor = "#1e40af")}
        onMouseOut={e => !loading && (e.currentTarget.style.backgroundColor = "#2563eb")}
      >
        <FaSignInAlt /> {loading ? "Logging in..." : "Login"}
      </button>

      <p style={{ textAlign: "center", fontSize: "14px" }}>
        Don’t have an account?{" "}
        <span
          style={{ color: "#2563eb", cursor: "pointer", fontWeight: "600" }}
          onClick={() => navigate('/register')}
        >
          Register here
        </span>
      </p>
    </form>
  );
};

export default Login;
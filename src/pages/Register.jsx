import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api'; // Ensure you have this API
import ATLogo from '../assets/AT.png';
import { FaUser, FaLock } from 'react-icons/fa';


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
    const handleRegister = async (e) => {
    e.preventDefault();
    if (validateForm()) {
        setLoading(true);
        try {
        const payload = {
            ...formData,
            role: formData.role.charAt(0).toUpperCase() + formData.role.slice(1) // Capitalize
        };
        const response = await registerUser(payload);
        console.log(response);
        alert(`Registration successful! Welcome ${response.data.fullName}`); // Correct path
        navigate('/login');
        } catch (error) {
        alert(error.message || 'Registration failed.');
        if (error.errors) setErrors(error.errors);
        } finally {
        setLoading(false);
        }
    }
    };


  return (
    <form
      onSubmit={handleRegister}
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
        <div style={{ fontSize: "14px", color: "#555", fontWeight: "500" }}>
          Learning Management System
        </div>
      </div>

      <h2 style={{
        textAlign: "center",
        marginBottom: "15px",
        color: "#2563eb",
        fontSize: "24px",
        fontWeight: "700"
      }}>
        Register
      </h2>

      {/* Role dropdown */}
      <select
        name="role"
        value={formData.role}
        onChange={handleInputChange}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px"
        }}
      >
        <option value="admin">Admin</option>
        <option value="student">Student</option>
      </select>

      {/* Full Name */}
      <div style={{ position: "relative" }}>
        <FaUser style={{
          position: "absolute",
          left: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#888"
        }} />
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Full Name"
          style={{
            width: "87%",
            padding: "10px 10px 10px 35px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }}
        />
        {errors.fullName && <span style={{ color: "red", fontSize: "12px" }}>{errors.fullName}</span>}
      </div>

      {/* Email */}
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

      {/* Password */}
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

      {/* Confirm Password */}
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
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          style={{
            width: "87%",
            padding: "10px 10px 10px 35px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px"
          }}
        />
        {errors.confirmPassword && <span style={{ color: "red", fontSize: "12px" }}>{errors.confirmPassword}</span>}
      </div>

      {/* Register button */}
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
        {loading ? "Registering..." : "Register"}
      </button>

      {/* Login link */}
      <p style={{ textAlign: "center", fontSize: "14px" }}>
        Already have an account?{" "}
        <span
          style={{ color: "#2563eb", cursor: "pointer", fontWeight: "600" }}
          onClick={() => navigate('/login')}
        >
          Login here
        </span>
      </p>
    </form>
  );
};

export default Register;

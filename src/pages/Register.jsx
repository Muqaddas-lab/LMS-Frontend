import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api'; 
import ATLogo from '../assets/AT.png';
import { FaUser, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.general) setErrors(prev => ({ ...prev, general: '' }));
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // Clear previous errors
    setSuccessMessage(''); // Clear previous success message

    try {
      // Keep confirmPassword in payload as backend expects it
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
      };

      // console.log('Payload sent to API:', payload);
      const response = await registerUser(payload);
      // console.log('API Response:', response);

      // ✅ Check if registration was successful
      if (response.success === true || response.user) {
        const userName = response?.user?.fullName || response?.data?.user?.fullName || formData.fullName;
        // setSuccessMessage(`Registration successful! Welcome ${userName}`);
        alert(`Registration successful! Welcome ${userName}`);
        
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'Student'
        });

        // Redirect after 2 seconds
        setTimeout(() => navigate('/student/dashboard'), 2000);
      } else {
        // If success is false, treat it as an error
        const errorMsg = response.message || 'Registration failed';
        setErrors({ general: errorMsg });
      }

    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error);
      
      // Handle specific error messages from backend
      const message = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      
      console.log('Error message:', message);
      
      // Check error type and display under appropriate field
      if (typeof message === 'string') {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('email')) {
          setErrors({ email: message });
        } else if (lowerMessage.includes('phone')) {
          setErrors({ phone: message });
        } else if (lowerMessage.includes('password')) {
          setErrors({ password: message });
        } else if (lowerMessage.includes('all fields')) {
          setErrors({ general: message });
        } else {
          // Generic error
          setErrors({ general: message });
        }
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} style={styles.form}>
      <div style={{ textAlign: "center" }}>
        <img src={ATLogo} alt="AT Logo" style={{ width: "100px" }} />
        <p style={{ fontSize: "14px", color: "#555" }}>Learning Management System</p>
      </div>

      <h2 style={styles.heading}>Register</h2>

      {successMessage && <p style={{ color: 'green', textAlign: 'center', fontWeight: '500' }}>{successMessage}</p>}
      {errors.general && <p style={{ color: 'red', textAlign: 'center', fontWeight: '500' }}>{errors.general}</p>}

      {/* <select
        name="role"
        value={formData.role}
        onChange={handleInputChange}
        style={styles.input}
      >
        <option value="Admin">Admin</option>
        <option value="Student">Student</option>
      </select> */}

      <div style={styles.inputWrapper}>
        <FaUser style={styles.icon} />
        <input 
          type="text" 
          name="fullName" 
          value={formData.fullName} 
          onChange={handleInputChange} 
          placeholder="Full Name" 
          style={styles.inputField} 
        />
        {errors.fullName && <span style={styles.error}>{errors.fullName}</span>}
      </div>

      <div style={styles.inputWrapper}>
        <FaUser style={styles.icon} />
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleInputChange} 
          placeholder="Email" 
          style={styles.inputField} 
        />
        {errors.email && <span style={styles.error}>{errors.email}</span>}
      </div>

      <div style={styles.inputWrapper}>
        <FaPhone style={styles.icon} />
        <input 
          type="text" 
          name="phone" 
          value={formData.phone} 
          onChange={handleInputChange} 
          placeholder="Phone Number" 
          style={styles.inputField} 
        />
        {errors.phone && <span style={styles.error}>{errors.phone}</span>}
      </div>

      <div style={styles.inputWrapper}>
        <FaLock style={styles.icon} />
        <input 
          type={showPassword ? "text" : "password"} 
          name="password" 
          value={formData.password} 
          onChange={handleInputChange} 
          placeholder="Password" 
          style={styles.inputField} 
        />
        <span 
          style={styles.passwordToggle} 
          onClick={() => setShowPassword(prev => !prev)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
        {errors.password && <span style={styles.error}>{errors.password}</span>}
      </div>

      <div style={styles.inputWrapper}>
        <FaLock style={styles.icon} />
        <input 
          type={showConfirm ? "text" : "password"} 
          name="confirmPassword" 
          value={formData.confirmPassword} 
          onChange={handleInputChange} 
          placeholder="Confirm Password" 
          style={styles.inputField} 
        />
        <span 
          style={styles.passwordToggle} 
          onClick={() => setShowConfirm(prev => !prev)}
        >
          {showConfirm ? <FaEyeSlash /> : <FaEye />}
        </span>
        {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
      </div>

      <button 
        type="submit" 
        disabled={loading} 
        style={{ 
          ...styles.button, 
          backgroundColor: loading ? "#888" : "#2563eb",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <p style={{ textAlign: "center", fontSize: "14px" }}>
        Already have an account?{' '}
        <span 
          style={{ color: "#2563eb", cursor: "pointer", fontWeight: "600" }} 
          onClick={() => navigate('/login')}
        >
          Login
        </span>
      </p>
    </form>
  );
};

const styles = {
  form: { 
    width: "350px", 
    margin: "50px auto", 
    padding: "25px", 
    borderRadius: "12px", 
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)", 
    backgroundColor: "#f9f9f9", 
    display: "flex", 
    flexDirection: "column", 
    gap: "15px", 
    position: "relative" 
  },
  heading: { 
    textAlign: "center", 
    marginBottom: "15px", 
    color: "#2563eb", 
    fontSize: "24px", 
    fontWeight: "700" 
  },
  input: { 
    padding: "10px", 
    borderRadius: "8px", 
    border: "1px solid #ccc", 
    fontSize: "16px" 
  },
  inputWrapper: { 
    position: "relative" 
  },
  icon: { 
    position: "absolute", 
    left: "10px", 
    top: "50%", 
    transform: "translateY(-50%)", 
    color: "#888" 
  },
  inputField: { 
    width: "87%", 
    padding: "10px 10px 10px 35px", 
    borderRadius: "8px", 
    border: "1px solid #ccc", 
    fontSize: "16px" 
  },
  button: { 
    padding: "12px", 
    border: "none", 
    borderRadius: "8px", 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: "16px", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    gap: "8px", 
    transition: "0.3s" 
  },
  error: { 
    color: "red", 
    fontSize: "12px",
    marginTop: "4px",
    display: "block"
  },
  passwordToggle: { 
    position: "absolute", 
    right: "10px", 
    top: "50%", 
    transform: "translateY(-50%)", 
    cursor: "pointer", 
    color: "#888" 
  }
};

export default Register;
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Load user on app start
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userInfo");
      const token = localStorage.getItem("token");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // 🔐 Restore token in axios
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth load failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Login
  const login = (userData) => {
    setUser(userData);

    localStorage.setItem("userInfo", JSON.stringify(userData));

    if (userData.token) {
      localStorage.setItem("token", userData.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    }
  };

  // 🔹 Logout (VERY IMPORTANT)
  const logout = () => {
    setUser(null);

    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");

    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    // <AuthContext.Provider
    //   value={{
    //     user,
    //     login,
    //     logout,
    //     loading,
    //   }}
    // >
    //   {!loading && children}
    // </AuthContext.Provider>
    <AuthContext.Provider value={{ user, login, logout, loading }}>
  {loading ? (
    <div style={{ textAlign: "center", padding: 50 }}>Loading user...</div>
  ) : (
    children
  )}
</AuthContext.Provider>

  );
};

// ✅ Custom hook
export const useAuth = () => useContext(AuthContext);

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role || user.Role;

  if (role && userRole?.toLowerCase() !== role.toLowerCase()) {
    if (userRole?.toLowerCase() === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole?.toLowerCase() === "student") {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

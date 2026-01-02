import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import StartScreen from "./pages/StartScreen";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboards
import Dashboard from "./pages/Dashboard"; // Admin Dashboard
import StudentDashboard from "./pages/StudentDashboard";

// Admin Pages
import Users from "./pages/Users";
import Students from "./pages/Students";
import CoursesPage from "./pages/Courses";
import Lectures from "./pages/Lectures";
import MockExams from "./pages/MockExam";
import ExamQuestionsPage from "./pages/ExamQuestionsPage";
import AdminExamResults from "./pages/AdminExamResults";
import AdminMessages from "./pages/AdminMessages";
import StudentMessages from "./pages/StudentMessages";
// Student Pages
import StudentCoursesPage from "./pages/StudentCoursesPage";
import StudentLecturesPage from "./pages/StudentLecturesPage";
import StudentExamsPage from "./pages/StudentExamsPage";
import StudentExamAttemptPage from "./pages/StudentExamAttemptPage";
// Protected Route
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<StartScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="Admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute role="Admin">
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute role="Admin">
                <Students />
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute role="Admin">
                <CoursesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lectures/:courseId"
            element={
              <ProtectedRoute role="Admin">
                <Lectures />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mockexams"
            element={
              <ProtectedRoute role="Admin">
                <MockExams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mock-exams/:examId/questions"
            element={
              <ProtectedRoute role="Admin">
                <ExamQuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exam-results"
            element={<AdminExamResults />}
          />

         {/* Admin */}
          <Route path="/admin/messages" element={
            <ProtectedRoute role="Admin">
              <AdminMessages />
            </ProtectedRoute>
          } />

            
          {/* ================= STUDENT ROUTES ================= */}
          
          {/* Student Dashboard */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="Student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student Courses - List of Enrolled Courses */}
          <Route
            path="/student/courses"
            element={
              <ProtectedRoute role="Student">
                <StudentCoursesPage />
              </ProtectedRoute>
            }
          />

          {/* Student Lectures - View Lectures for a Specific Course */}
          <Route
            path="/student/courses/:courseId"
            element={
              <ProtectedRoute role="Student">
                <StudentLecturesPage />
              </ProtectedRoute>
            }
          />

          {/* Student Mock Exams - View All Available Exams */}
          <Route
            path="/student/exams"
            element={
              <ProtectedRoute role="Student">
                <StudentExamsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/exams/:examId"
            element={
              <ProtectedRoute role="Student">
                <StudentExamAttemptPage />
              </ProtectedRoute>
            }
          />
          {/* Student */}
        <Route path="/student/messages" element={
          <ProtectedRoute role="Student">
            <StudentMessages />
          </ProtectedRoute>
        } />

          {/* Catch all - redirect to appropriate dashboard */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
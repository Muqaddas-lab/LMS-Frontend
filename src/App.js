import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import StartScreen from "./pages/StartScreen";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Students from "./pages/Students";
import CoursesPage from "./pages/Courses";
import Lectures from "./pages/Lectures";
import MockExams from "./pages/MockExam";
import ExamQuestionsPage from "./pages/ExamQuestionsPage"
import Messages from "./pages/Messages";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<StartScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />  // Add this

          {/* Admin / Protected Routes */}
          <Route path="/admin/dashboard" element={<Dashboard />} />

          {/* Users */}
          <Route path="/users" element={<Users />} />

          {/* Students */}
          <Route path="/students" element={<Students />} />

          {/* Courses */}
          <Route path="/courses" element={<CoursesPage />} />

          {/* Lectures (Course-specific) */}
          <Route path="/lectures/:courseId" element={<Lectures />} />

          {/* Mock Exams */}
          <Route path="/mockexams" element={<MockExams />} />
          {/* <Route path="/mock-exams" element={<MockExamsPage />} /> */}
          <Route path="/mock-exams/:examId/questions" element={<ExamQuestionsPage />} />
          {/* Messages */}
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

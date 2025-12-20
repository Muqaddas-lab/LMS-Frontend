// src/pages/StudentExam.jsx
import React, { useEffect, useState } from "react";
import { getAllExams } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const StudentExam = () => {
  const [exams, setExams] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchExams = async () => {
    const data = await getAllExams();
    setExams(data);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const startExam = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Available Mock Exams</h2>
      <ul>
        {exams.map((exam) => (
          <li key={exam._id}>
            {exam.title}{" "}
            <button onClick={() => startExam(exam._id)}>Start Exam</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentExam;

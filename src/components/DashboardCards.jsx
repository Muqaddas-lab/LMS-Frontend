


// src/components/DashboardCards.jsx
import React from "react";
import { FaUser, FaBook, FaVideo } from "react-icons/fa";
import "./DashboardCards.css";

const DashboardCards = ({ totalStudents = 0, totalCourses = 0, totalLectures = 0 }) => {
  return (
    <div className="grid">
      <div className="card">
        <div>
          <h2>Total Students</h2>
          <p>{totalStudents}</p>
        </div>
        <FaUser size={40} className="text-blue-500" />
      </div>

      <div className="card">
        <div>
          <h2>Total Courses</h2>
          <p>{totalCourses}</p>
        </div>
        <FaBook size={40} className="text-green-500" />
      </div>

      <div className="card">
        <div>
          <h2>Total Lectures</h2>
          <p>{totalLectures}</p>
        </div>
        <FaVideo size={40} className="text-red-500" />
      </div>
    </div>
  );
};

export default DashboardCards;

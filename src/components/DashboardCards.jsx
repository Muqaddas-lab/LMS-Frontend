import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUserGraduate, 
  faBook, 
  faVideo, 
  faPenFancy 
} from "@fortawesome/free-solid-svg-icons";

const DashboardCards = ({ totalStudents, totalCourses, totalLectures, totalExams }) => {
  const cards = [
    {
      title: "Total Students",
      count: totalStudents || 0,
      icon: faUserGraduate,
      bgColor: "#dbeafe",
      textColor: "#1e40af",
      borderColor: "#3b82f6"
    },
    {
      title: "Total Courses",
      count: totalCourses || 0,
      icon: faBook,
      bgColor: "#fef3c7",
      textColor: "#92400e",
      borderColor: "#f59e0b"
    },
    {
      title: "Total Lectures",
      count: totalLectures || 0,
      icon: faVideo,
      bgColor: "#d1fae5",
      textColor: "#065f46",
      borderColor: "#10b981"
    },
    {
      title: "Mock Exams",
      count: totalExams || 0,
      icon: faPenFancy,
      bgColor: "#fce7f3",
      textColor: "#831843",
      borderColor: "#ec4899"
    }
  ];

  return (
    <>
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            backgroundColor: card.bgColor,
            padding: "24px",
            borderRadius: "12px",
            borderLeft: `4px solid ${card.borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
          }}
        >
          <div>
            <p style={{ 
              color: card.textColor, 
              fontSize: "14px", 
              fontWeight: "600",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              {card.title}
            </p>
            <h2 style={{ 
              color: card.textColor, 
              fontSize: "36px", 
              fontWeight: "bold", 
              margin: 0 
            }}>
              {card.count}
            </h2>
          </div>
          <div style={{ 
            fontSize: "52px",
            opacity: 0.8
          }}>
            <FontAwesomeIcon icon={card.icon} />
          </div>
        </div>
      ))}
    </>
  );
};

export default DashboardCards;

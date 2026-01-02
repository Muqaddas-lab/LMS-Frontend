import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAllExamResults } from "../api/api";
import { FaCheckCircle, FaTimesCircle, FaUser, FaEnvelope, FaBook, FaSearch, FaChartLine, FaExclamationTriangle } from "react-icons/fa";

const AdminExamResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, pass, fail
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  // ✅ CORRECT STATUS CALCULATION FUNCTION
  const calculateStatus = (obtained, total, passing) => {
    // Convert to numbers
    const obtainedNum = parseFloat(obtained) || 0;
    const totalNum = parseFloat(total) || 1; // Avoid division by zero
    const passingNum = parseFloat(passing) || 0;
    
    // If passing marks are 0 or invalid, use 50% criteria
    if (passingNum <= 0) {
      const percentage = (obtainedNum / totalNum) * 100;
      return percentage >= 50 ? "Pass" : "Fail";
    }
    
    // Otherwise use passing marks criteria
    return obtainedNum >= passingNum ? "Pass" : "Fail";
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await getAllExamResults();
      console.log("getAllExamResults Response:", res);
      
      // ✅ PROCESS RESULTS WITH CORRECT STATUS CALCULATION
      const processedResults = res.map(r => {
        const obtained = r.obtainedMarks || 0;
        const total = r.totalMarks || 1;
        const passing = r.passingMarks || 0;
        
        // Calculate correct status
        const correctStatus = calculateStatus(obtained, total, passing);
        
        // Log mismatches for debugging
        if (r.status !== correctStatus) {
          console.warn(`⚠️ Status Mismatch for ${r.studentName}:`, {
            exam: r.examTitle,
            obtained: obtained,
            total: total,
            passing: passing,
            backendStatus: r.status,
            calculatedStatus: correctStatus,
            percentage: ((obtained / total) * 100).toFixed(1) + "%"
          });
        }
        
        return {
          ...r,
          // ✅ OVERRIDE WITH CORRECT STATUS
          status: correctStatus,
          // ✅ Ensure numeric values
          obtainedMarks: parseFloat(obtained) || 0,
          totalMarks: parseFloat(total) || 0,
          passingMarks: parseFloat(passing) || 0,
          // ✅ Recalculate percentage
          percentage: total > 0 ? ((obtained / total) * 100).toFixed(1) : "0"
        };
      });
      
      setResults(Array.isArray(processedResults) ? processedResults : []);
      setError(null);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      setError("Failed to load exam results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Group results by student (using email as unique key)
  const groupedByStudent = {};
  results.forEach(result => {
    const key = result.studentEmail || result.studentName || "unknown";
    if (!groupedByStudent[key]) {
      groupedByStudent[key] = {
        studentName: result.studentName || "Unknown Student",
        studentEmail: result.studentEmail || "No Email",
        exams: []
      };
    }
    groupedByStudent[key].exams.push(result);
  });

  let studentsArray = Object.values(groupedByStudent);

  // Filter students based on search query
  studentsArray = studentsArray.filter(student => {
    const query = searchQuery.toLowerCase();
    return (
      student.studentName.toLowerCase().includes(query) ||
      student.studentEmail.toLowerCase().includes(query)
    );
  });

  // ✅ Apply status filter with CORRECT calculation
  let displayStudents = studentsArray;
  if (filterStatus !== "all") {
    displayStudents = studentsArray.map(student => ({
      ...student,
      exams: student.exams.filter(exam => {
        const status = calculateStatus(
          exam.obtainedMarks, 
          exam.totalMarks, 
          exam.passingMarks
        );
        return status.toLowerCase() === filterStatus.toLowerCase();
      })
    })).filter(student => student.exams.length > 0);
  }

  // ✅ Calculate statistics with CORRECT calculation
  const totalStudents = Object.values(groupedByStudent).length;
  const totalExams = results.length;
  const passedExams = results.filter(r => {
    return calculateStatus(r.obtainedMarks, r.totalMarks, r.passingMarks) === "Pass";
  }).length;
  
  const failedExams = results.filter(r => {
    return calculateStatus(r.obtainedMarks, r.totalMarks, r.passingMarks) === "Fail";
  }).length;
  
  const passPercentage = totalExams > 0 ? ((passedExams / totalExams) * 100).toFixed(1) : 0;

  // ✅ Debug: Check a few results
  if (debugMode && results.length > 0) {
    console.log("🔍 DEBUG MODE - Sample Results:");
    results.slice(0, 3).forEach((r, i) => {
      console.log(`[${i}] ${r.studentName}:`, {
        exam: r.examTitle,
        marks: `${r.obtainedMarks}/${r.totalMarks}`,
        passing: r.passingMarks,
        percentage: ((r.obtainedMarks / r.totalMarks) * 100).toFixed(1) + "%",
        status: r.status,
        calculated: calculateStatus(r.obtainedMarks, r.totalMarks, r.passingMarks)
      });
    });
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={styles.container}>
        <div style={styles.headerSection}>
          <div style={styles.headerTop}>
            <h2 style={styles.heading}>📊 All Students Exam Results</h2>
            <button 
              onClick={() => setDebugMode(!debugMode)}
              style={styles.debugButton}
              title="Toggle debug mode"
            >
              {debugMode ? "🔴 Debug ON" : "🐛 Debug"}
            </button>
          </div>

          {/* ✅ DEBUG INFO PANEL */}
          {debugMode && !loading && !error && results.length > 0 && (
            <div style={styles.debugPanel}>
              <h4 style={styles.debugTitle}>
                <FaExclamationTriangle /> Debug Information
              </h4>
              <div style={styles.debugGrid}>
                <div style={styles.debugItem}>
                  <span style={styles.debugLabel}>Total Results:</span>
                  <span style={styles.debugValue}>{results.length}</span>
                </div>
                <div style={styles.debugItem}>
                  <span style={styles.debugLabel}>Students with passingMarks = 0:</span>
                  <span style={styles.debugValue}>
                    {results.filter(r => r.passingMarks === 0).length}
                  </span>
                </div>
                <div style={styles.debugItem}>
                  <span style={styles.debugLabel}>Using 50% Rule:</span>
                  <span style={styles.debugValue}>
                    {results.filter(r => r.passingMarks <= 0).length}
                  </span>
                </div>
              </div>
              
              <div style={styles.debugSample}>
                <h5>Sample Results (First 2):</h5>
                {results.slice(0, 2).map((r, i) => {
                  const uses50Percent = r.passingMarks <= 0;
                  return (
                    <div key={i} style={styles.debugResult}>
                      <div><strong>{r.studentName}</strong> - {r.examTitle}</div>
                      <div>Marks: {r.obtainedMarks}/{r.totalMarks} ({r.percentage}%)</div>
                      <div>Passing Marks: {r.passingMarks} {uses50Percent && "(Using 50% Rule)"}</div>
                      <div>Status: <strong style={{
                        color: r.status === "Pass" ? "#4caf50" : "#f44336"
                      }}>{r.status}</strong></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          {!loading && !error && (
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{...styles.statIcon, backgroundColor: "#e3f2fd"}}>
                  <FaUser style={{color: "#1976d2"}} />
                </div>
                <div style={styles.statInfo}>
                  <div style={styles.statValue}>{totalStudents}</div>
                  <div style={styles.statLabel}>Total Students</div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{...styles.statIcon, backgroundColor: "#e8f5e9"}}>
                  <FaCheckCircle style={{color: "#4caf50"}} />
                </div>
                <div style={styles.statInfo}>
                  <div style={styles.statValue}>{passedExams}</div>
                  <div style={styles.statLabel}>Passed Exams</div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{...styles.statIcon, backgroundColor: "#ffebee"}}>
                  <FaTimesCircle style={{color: "#f44336"}} />
                </div>
                <div style={styles.statInfo}>
                  <div style={styles.statValue}>{failedExams}</div>
                  <div style={styles.statLabel}>Failed Exams</div>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={{...styles.statIcon, backgroundColor: "#fff3e0"}}>
                  <FaChartLine style={{color: "#ff9800"}} />
                </div>
                <div style={styles.statInfo}>
                  <div style={styles.statValue}>{passPercentage}%</div>
                  <div style={styles.statLabel}>Pass Rate</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Search and Filter Bar */}
          <div style={styles.controlsBar}>
            <div style={styles.searchContainer}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  style={styles.clearButton}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={styles.filterButtons}>
              <button 
                onClick={() => setFilterStatus("all")}
                style={{
                  ...styles.filterButton, 
                  ...(filterStatus === "all" ? styles.filterButtonActive : {})
                }}
              >
                All Results
              </button>
              <button 
                onClick={() => setFilterStatus("pass")}
                style={{
                  ...styles.filterButton, 
                  ...(filterStatus === "pass" ? styles.filterButtonActivePass : {})
                }}
              >
                <FaCheckCircle /> Passed Only
              </button>
              <button 
                onClick={() => setFilterStatus("fail")}
                style={{
                  ...styles.filterButton, 
                  ...(filterStatus === "fail" ? styles.filterButtonActiveFail : {})
                }}
              >
                <FaTimesCircle /> Failed Only
              </button>
            </div>
          </div>

          {/* Results Summary */}
          {!loading && !error && (
            <div style={styles.summaryBar}>
              <span style={styles.summaryText}>
                Showing {displayStudents.length} of {totalStudents} students
              </span>
              <span style={styles.summaryText}>
                Displaying {displayStudents.reduce((sum, s) => sum + s.exams.length, 0)} exams
              </span>
              <span style={styles.summaryText}>
                Passed: {passedExams} | Failed: {failedExams} | Pass Rate: {passPercentage}%
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p>Loading results...</p>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button onClick={fetchResults} style={styles.retryButton}>
              Retry
            </button>
          </div>
        ) : results.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FaBook style={styles.emptyIcon} />
            <p>No exam results found</p>
          </div>
        ) : displayStudents.length === 0 ? (
          <div style={styles.emptyContainer}>
            <FaSearch style={styles.emptyIcon} />
            <p>
              {filterStatus !== "all" 
                ? `No students with ${filterStatus} results found` 
                : `No students found matching "${searchQuery}"`}
            </p>
            <button onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
            }} style={styles.resetButton}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={styles.studentsGrid}>
            {displayStudents.map((student, index) => {
              // ✅ Calculate stats with CORRECT calculation
              const originalStudent = Object.values(groupedByStudent).find(
                s => s.studentEmail === student.studentEmail
              );
              
              const allExams = originalStudent?.exams || student.exams;
              
              const studentPassCount = allExams.filter(e => 
                calculateStatus(e.obtainedMarks, e.totalMarks, e.passingMarks) === "Pass"
              ).length;
              
              const studentFailCount = allExams.filter(e => 
                calculateStatus(e.obtainedMarks, e.totalMarks, e.passingMarks) === "Fail"
              ).length;
              
              const studentAvgPercentage = allExams.length > 0 
                ? allExams.reduce((sum, e) => sum + parseFloat(e.percentage || 0), 0) / allExams.length 
                : 0;

              return (
                <div key={index} style={styles.studentCard}>
                  {/* Student Header */}
                  <div style={styles.studentHeader}>
                    <div style={styles.studentAvatar}>
                      <FaUser />
                    </div>
                    <div style={styles.studentInfo}>
                      <h3 style={styles.studentName}>{student.studentName}</h3>
                      <p style={styles.studentEmail}>
                        <FaEnvelope style={styles.smallIcon} />
                        {student.studentEmail}
                      </p>
                    </div>
                    <div style={styles.examBadge}>
                      <FaBook style={styles.smallIcon} />
                      {allExams.length} Total {allExams.length === 1 ? 'Exam' : 'Exams'}
                    </div>
                  </div>

                  {/* Student Stats */}
                  <div style={styles.studentStats}>
                    <div style={styles.miniStat}>
                      <span style={{...styles.miniStatValue, color: "#4caf50"}}>
                        {studentPassCount}
                      </span>
                      <span style={styles.miniStatLabel}>Passed</span>
                    </div>
                    <div style={styles.miniStat}>
                      <span style={{...styles.miniStatValue, color: "#f44336"}}>
                        {studentFailCount}
                      </span>
                      <span style={styles.miniStatLabel}>Failed</span>
                    </div>
                    <div style={styles.miniStat}>
                      <span style={{...styles.miniStatValue, color: "#216a7e"}}>
                        {studentAvgPercentage.toFixed(1)}%
                      </span>
                      <span style={styles.miniStatLabel}>Avg Score</span>
                    </div>
                  </div>

                  {/* Exams List */}
                  <div style={styles.examsContainer}>
                    {filterStatus !== "all" && (
                      <div style={styles.filterNote}>
                        Showing {filterStatus} results only ({student.exams.length} of {allExams.length} exams)
                      </div>
                    )}
                    {student.exams.map((exam, examIndex) => {
                      // ✅ Calculate status for each exam
                      const examStatus = calculateStatus(
                        exam.obtainedMarks, 
                        exam.totalMarks, 
                        exam.passingMarks
                      );
                      
                      return (
                        <div key={examIndex} style={styles.examRow}>
                          <div style={styles.examDetails}>
                            <div style={styles.examTitle}>{exam.examTitle}</div>
                            <div style={styles.examMeta}>
                              Attempt #{exam.attemptNumber} • 
                              Passing: {exam.passingMarks} marks • 
                              {new Date(exam.submittedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                              {exam.passingMarks <= 0 && (
                                <span style={{color: "#ff9800", marginLeft: "5px"}}>
                                  (Using 50% Rule)
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div style={styles.examStats}>
                            <div style={styles.marks}>
                              <span style={styles.obtained}>{exam.obtainedMarks}</span>
                              <span style={styles.separator}>/</span>
                              <span style={styles.total}>{exam.totalMarks}</span>
                            </div>
                            <div style={styles.percentage}>
                              {exam.percentage}%
                            </div>
                            <div style={styles.statusContainer}>
                              {examStatus === "Pass" ? (
                                <span style={styles.passStatus}>
                                  <FaCheckCircle /> Pass
                                </span>
                              ) : (
                                <span style={styles.failStatus}>
                                  <FaTimesCircle /> Fail
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExamResults;

/* ================= STYLES ================= */

const styles = {
  container: {
    marginLeft: "250px",
    padding: "30px",
    width: "100%",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  headerSection: {
    marginBottom: "30px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  heading: {
    color: "#216a7e",
    fontSize: "28px",
    fontWeight: "bold",
    margin: 0,
  },
  debugButton: {
    padding: "8px 16px",
    backgroundColor: "#9c27b0",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  debugPanel: {
    backgroundColor: "#fff8e1",
    border: "2px solid #ffd54f",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "25px",
  },
  debugTitle: {
    color: "#ff8f00",
    marginTop: "0",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  debugGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  debugItem: {
    backgroundColor: "white",
    padding: "10px 15px",
    borderRadius: "6px",
    border: "1px solid #ffe082",
  },
  debugLabel: {
    display: "block",
    fontSize: "12px",
    color: "#666",
    marginBottom: "5px",
  },
  debugValue: {
    display: "block",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
  },
  debugSample: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "6px",
    border: "1px solid #ffe082",
  },
  debugResult: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    marginBottom: "10px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },
  statCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #e0e0e0",
  },
  statIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#333",
    lineHeight: 1,
    marginBottom: "5px",
  },
  statLabel: {
    fontSize: "13px",
    color: "#666",
    fontWeight: "500",
  },
  controlsBar: {
    display: "flex",
    gap: "15px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  searchContainer: {
    position: "relative",
    flex: "1 1 300px",
    minWidth: "250px",
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#999",
    fontSize: "16px",
  },
  searchInput: {
    width: "90%",
    padding: "12px 45px 12px 45px",
    fontSize: "15px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.3s",
  },
  clearButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#999",
    cursor: "pointer",
    padding: "5px 10px",
  },
  filterButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#666",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.3s",
  },
  filterButtonActive: {
    backgroundColor: "#216a7e",
    color: "#fff",
    borderColor: "#216a7e",
  },
  filterButtonActivePass: {
    backgroundColor: "#4caf50",
    color: "#fff",
    borderColor: "#4caf50",
  },
  filterButtonActiveFail: {
    backgroundColor: "#f44336",
    color: "#fff",
    borderColor: "#f44336",
  },
  summaryBar: {
    display: "flex",
    gap: "30px",
    padding: "12px 20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    flexWrap: "wrap",
  },
  summaryText: {
    fontSize: "14px",
    color: "#666",
    fontWeight: "500",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
    color: "#666",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #216a7e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "50px",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: "18px",
    marginBottom: "20px",
  },
  retryButton: {
    padding: "12px 24px",
    backgroundColor: "#216a7e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px 20px",
    fontSize: "18px",
    color: "#666",
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  emptyIcon: {
    fontSize: "60px",
    color: "#ccc",
    marginBottom: "20px",
  },
  resetButton: {
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#216a7e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  studentsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(550px, 1fr))",
    gap: "25px",
  },
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    border: "1px solid #e0e0e0",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  studentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "20px",
    backgroundColor: "#216a7e",
    color: "white",
  },
  studentAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    margin: "0 0 5px 0",
    fontSize: "20px",
    fontWeight: "600",
  },
  studentEmail: {
    margin: 0,
    fontSize: "13px",
    opacity: 0.9,
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  smallIcon: {
    fontSize: "12px",
  },
  examBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "8px 15px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  studentStats: {
    display: "flex",
    justifyContent: "space-around",
    padding: "15px 20px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  miniStat: {
    textAlign: "center",
  },
  miniStatValue: {
    display: "block",
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "3px",
  },
  miniStatLabel: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "500",
  },
  examsContainer: {
    padding: "15px",
  },
  filterNote: {
    backgroundColor: "#fff3cd",
    color: "#856404",
    padding: "10px 15px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "12px",
    fontWeight: "500",
    border: "1px solid #ffeaa7",
  },
  examRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  examDetails: {
    flex: 1,
  },
  examTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "5px",
  },
  examMeta: {
    fontSize: "12px",
    color: "#666",
  },
  examStats: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  marks: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    fontSize: "16px",
  },
  obtained: {
    fontWeight: "700",
    color: "#216a7e",
  },
  separator: {
    color: "#999",
  },
  total: {
    color: "#666",
    fontWeight: "500",
  },
  percentage: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#216a7e",
    minWidth: "60px",
    textAlign: "center",
  },
  statusContainer: {
    minWidth: "80px",
  },
  passStatus: {
    color: "#4caf50",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "14px",
  },
  failStatus: {
    color: "#f44336",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "14px",
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
}
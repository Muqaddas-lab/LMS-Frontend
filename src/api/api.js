import axios from "axios";

/* ================= AXIOS INSTANCE ================= */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/* ================= TOKEN INTERCEPTOR ================= */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

/* ================= AUTH ================= */
export const registerUser = async (userData) => {
  const { data } = await API.post("/auth/register", userData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await API.post("/auth/login", credentials);
  localStorage.setItem("token", data.token);
  localStorage.setItem("userInfo", JSON.stringify(data));
  return data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
};

/* ================= USERS (ADMIN) ================= */
export const getAllUsers = async () => {
  const { data } = await API.get("/users");
  return Array.isArray(data) ? data : [];
};

export const getUserById = async (id) => {
  const { data } = await API.get(`/users/${id}`);
  return data;
};

export const createUser = async (userData) => {
  const { data } = await API.post("/users", userData);
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await API.put(`/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await API.delete(`/users/${id}`);
  return data;
};

/* ================= COURSES ================= */
export const getCourses = async () => {
  const { data } = await API.get("/courses");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.courses)) return data.courses;
  return [];
};

export const getCourseById = async (id) => {
  const { data } = await API.get(`/courses/${id}`);
  return data;
};

export const createCourse = async (formData) => {
  const { data } = await API.post("/courses/create", formData);
  return data;
};

export const updateCourse = async (id, formData) => {
  const { data } = await API.put(`/courses/update/${id}`, formData);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await API.delete(`/courses/delete/${id}`);
  return data;
};

/* ================= ENROLLMENTS ================= */
export const enrollStudentInCourse = async (studentId, courseId) => {
  const { data } = await API.post("/enrollments/enroll", { studentId, courseId });
  return data;
};

export const getStudentEnrollments = async (studentId) => {
  const { data } = await API.get(`/enrollments/student/${studentId}`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.enrollments)) return data.enrollments;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const removeEnrollment = async (enrollmentId) => {
  const { data } = await API.delete(`/enrollments/${enrollmentId}`);
  return data;
};

/* ================= PROGRESS ================= */
export const trackLectureProgress = async (studentId, courseId, lectureId) => {
  const { data } = await API.post("/progress/track", { studentId, courseId, lectureId });
  return data;
};

export const getProgress = async (studentId, courseId) => {
  const { data } = await API.get(`/progress/${studentId}/${courseId}`);
  const completed = data?.completedLectures?.length || 0;
  const total = data?.totalLectures || 0;
  return { ...data, progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
};

/* ================= LECTURES ================= */
export const getLectures = async () => {
  const { data } = await API.get("/lectures");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.lectures)) return data.lectures;
  return [];
};

export const getLecturesByCourse = async (courseId) => {
  const { data } = await API.get(`/lectures/course/${courseId}`);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.lectures)) return data.lectures;
  return [];
};

export const getLectureById = async (id) => {
  const { data } = await API.get(`/lectures/${id}`);
  return data;
};

export const createLecture = async (formData) => {
  const { data } = await API.post("/lectures/create", formData);
  return data;
};

export const updateLecture = async (id, formData) => {
  const { data } = await API.put(`/lectures/update/${id}`, formData);
  return data;
};

export const deleteLecture = async (id) => {
  const { data } = await API.delete(`/lectures/delete/${id}`);
  return data;
};

/* ================= EXAMS ================= */
export const getAllExams = async () => {
  const { data } = await API.get("/exams");
  return data;
};

export const getExamById = async (id) => {
  const { data } = await API.get(`/exams/${id}`);
  return data;
};

export const createExam = async (examData) => {
  const { data } = await API.post("/exams", examData);
  return data;
};

export const updateExam = async (id, examData) => {
  const { data } = await API.put(`/exams/${id}`, examData);
  return data;
};

export const deleteExam = async (id) => {
  const { data } = await API.delete(`/exams/${id}`);
  return data;
};

/* ================= QUESTIONS ================= */
export const getQuestionsByExam = async (examId) => {
  const { data } = await API.get(`/questions/exam/${examId}`);
  return Array.isArray(data) ? data : [];
};

export const addQuestion = async (questionData) => {
  const { data } = await API.post("/questions", questionData);
  return data;
};

export const updateQuestion = async (questionId, questionData) => {
  const { data } = await API.put(`/questions/${questionId}`, questionData);
  return data;
};

export const deleteQuestion = async (questionId) => {
  const { data } = await API.delete(`/questions/${questionId}`);
  return data;
};

/* ================= ATTEMPTS ================= */
export const submitAttempt = async (attemptData) => {
  const { data } = await API.post("/attempts", attemptData);
  return data;
};

export const getAttemptsByUser = async (userId) => {
  const { data } = await API.get(`/attempts/user/${userId}`);
  return Array.isArray(data) ? data : data?.attempts || [];
};

export const getAttemptsByExam = async (examId) => {
  const { data } = await API.get(`/attempts/exam/${examId}`);
  return Array.isArray(data) ? data : data?.attempts || [];
};

export const getExamStatus = async (studentId, examId) => {
  const { data } = await API.get(`/attempts/status/${studentId}/${examId}`);
  return data;
};

/* ================= MESSAGES ================= */
export const sendMessage = async (messageData) => {
  const { data } = await API.post("/messages", messageData);
  return data;
};

export const getMessages = async (userId) => {
  const { data } = await API.get(`/messages/${userId}`);
  return data;
};

export const getUsersForMessaging = async () => {
  const { data } = await API.get("/messages");
  return data;
};

export const deleteMessage = async (messageId) => {
  const { data } = await API.delete(`/messages/${messageId}`);
  return data;
};

/* ================= NEW: EXAM RESULTS ================= */
export const getAllExamResults = async () => {
  const { data } = await API.get("/admin/exam-results");
  return data;
};


/* ================= EXPORT HELPERS ================= */
export const getAllCourses = getCourses;
export const getAllLectures = getLectures;

export default API;

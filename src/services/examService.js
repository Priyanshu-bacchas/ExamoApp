
import api from "./api";

// ===============================
// GET ALL EXAMS
// ===============================
export const getExams = async () => {
  return await api.get("/Exams");
};

// ===============================
// GET EXAM BY ID
// ===============================
export const getExamById = async (id) => {
  return await api.get(`/Exams/${id}`);
};

// ===============================
// CREATE EXAM
// ===============================
export const createExam = async (data) => {
  return await api.post("/Exams", {
    examName: data.examName,
    examDate: data.examDate || null,
    status: data.status || "Coming Soon",
  });
};

// ===============================
// UPDATE EXAM
// ===============================
export const updateExam = async (id, data) => {
  return await api.put(`/Exams/${id}`, {
    examName: data.examName,
    examDate: data.examDate || null,
    status: data.status || "Coming Soon",
  });
};

// ===============================
// DELETE EXAM
// ===============================
export const deleteExam = async (id) => {
  return await api.delete(`/Exams/${id}`);
};


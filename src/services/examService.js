import api from "./api";

export const getExams = async () => {
  return await api.get("/Exams");
};

export const createExam = async (data) => {
  return await api.post("/Exams", {
    examName: data.examName,
    examDate: data.examDate || null,
    status: data.status,
  });
};

export const updateExam = async (id, data) => {
  return await api.put(`/Exams/${id}`, {
    examName: data.examName,
    examDate: data.examDate || null,
    status: data.status,
  });
};

export const deleteExam = async (id) => {
  return await api.delete(`/Exams/${id}`);
};
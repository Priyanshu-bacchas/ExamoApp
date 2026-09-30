import api from "./api";

export const getDashboardData = async () => {
  const [
    studentsResponse,
    examFormsResponse,
    examsResponse,
    preparationsResponse,
    subjectsResponse,
    schedulesResponse,
  ] = await Promise.all([
    api.get("/Students"),
    api.get("/ExamForms"),
    api.get("/Exams"),
    api.get("/Preparations"),
    api.get("/Subjects"),
    api.get("/Schedules"),
  ]);

  return {
    students: studentsResponse.data || [],
    examForms: examFormsResponse.data || [],
    exams: examsResponse.data || [],
    preparations: preparationsResponse.data || [],
    subjects: subjectsResponse.data || [],
    schedules: schedulesResponse.data || [],
  };
};
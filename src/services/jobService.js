import { apiGet, apiPost, apiPut, apiDelete } from "./api";

// category: "Job" | "Result" | "AdmitCard"
//   activeOnly: true -> sirf wo Jobs jinki last date nikli nahi (students ke liye)
export const getJobPosts = (
  category,
  { activeOnly = false, take = 200 } = {}
) =>
  apiGet(
    `/Jobs?category=${category}&activeOnly=${activeOnly}&take=${take}`
  );

// Sirf Admin
export const createJobPost = (data) => apiPost("/Jobs", data);

export const updateJobPost = (id, data) => apiPut(`/Jobs/${id}`, data);

export const deleteJobPost = (id) => apiDelete(`/Jobs/${id}`);

// Logged-in user: Job ko apne Exam Forms / Exams / Preparation / Results me add karo
export const addJobToMyList = (id) => apiPost(`/Jobs/${id}/add`);

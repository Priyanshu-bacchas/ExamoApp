import { apiGet, apiPost, apiPut, apiDelete } from "./api";

// category: "Job" | "Result" | "AdmitCard"
//   activeOnly: true -> sirf wo Jobs jinki last date nikli nahi (students ke liye)
export const getJobPosts = (
  category,
  { activeOnly = false, includeDrafts = false, take = 200 } = {}
) =>
  apiGet(
    `/Jobs?category=${category}&activeOnly=${activeOnly}&includeDrafts=${includeDrafts}&take=${take}`
  );

// Sirf Admin
export const createJobPost = (data) => apiPost("/Jobs", data);

export const updateJobPost = (id, data) => apiPut(`/Jobs/${id}`, data);

// Sirf Admin: Draft <-> Published (published = true -> students ko dikhe)
export const setJobPublished = (id, published) =>
  apiPut(`/Jobs/${id}/publish`, { published });

export const deleteJobPost = (id) => apiDelete(`/Jobs/${id}`);

// Logged-in user: Job ko apne Exam Forms / Exams / Preparation / Results me add karo
export const addJobToMyList = (id) => apiPost(`/Jobs/${id}/add`);

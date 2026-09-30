import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const getStudents = () => apiGet("/Students");

export const getStudentById = (id) =>
  apiGet(`/Students/${id}`);

export const createStudent = (data) =>
  apiPost("/Students", data);

export const updateStudent = (id, data) =>
  apiPut(`/Students/${id}`, data);

export const deleteStudent = (id) =>
  apiDelete(`/Students/${id}`);
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const getExamForms = () =>
  apiGet("/ExamForms");

export const getExamFormById = (id) =>
  apiGet(`/ExamForms/${id}`);

export const createExamForm = (data) =>
  apiPost("/ExamForms", data);

export const updateExamForm = (id, data) =>
  apiPut(`/ExamForms/${id}`, data);

export const deleteExamForm = (id) =>
  apiDelete(`/ExamForms/${id}`);
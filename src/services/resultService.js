import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const getResults = () => apiGet("/Results");

export const getResultById = (id) =>
  apiGet(`/Results/${id}`);

export const createResult = (data) =>
  apiPost("/Results", data);

export const updateResult = (id, data) =>
  apiPut(`/Results/${id}`, data);

export const deleteResult = (id) =>
  apiDelete(`/Results/${id}`);

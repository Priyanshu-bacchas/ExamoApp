import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const getPreparations = () =>
  apiGet("/Preparations");

export const getPreparationById = (id) =>
  apiGet(`/Preparations/${id}`);

export const createPreparation = (data) =>
  apiPost("/Preparations", data);

export const updatePreparation = (id, data) =>
  apiPut(`/Preparations/${id}`, data);

export const deletePreparation = (id) =>
  apiDelete(`/Preparations/${id}`);
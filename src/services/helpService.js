import { apiGet } from "./api";

// Featured cards + saare FAQ (backend se)
export const getHelpContent = () => apiGet("/Help/content");

// Sawal likho -> milte-julte jawab
export const searchHelp = (query) =>
  apiGet(`/Help/search?q=${encodeURIComponent(query)}`);
import axios from "axios";

export const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/+$/g, "");

export const api = axios.create({
  baseURL: API_BASE,
});

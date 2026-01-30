import axios from "axios";
import { API_BASE_URL } from "../config/api";

export function getApiBaseUrl() {
  // Single source of truth for device networking.
  // Normalize common mistakes: missing scheme or missing backend port.
  let url = (API_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  if (!/:\d+$/.test(url)) url = `${url}:4000`;
  return url;
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 20000,
});

export async function sendPrompt(prompt, language = "en") 
{
  const res = await api.post(`/chat`, { prompt, language });
    return res.data?.text || "I couldn't produce a reply.";
  // try {
    
  // }catch(error)
  // {
  //   console.error("Error in sendPrompt:", error);
  //   return "An error occurred while processing your request.";
  // } 
}

export async function login(email, password) {
  const res = await api.post(`/auth/login`, { email, password });
  return res.data;
}

export async function register(email, password) {
  const res = await api.post(`/auth/register`, { email, password });
  return res.data;
}

export async function uploadVaultDocument({ userId, name, type, uri }) {
  const res = await api.post(`/vault/upload`, { userId, name, type, uri });
  return res.data;
}

export async function listVaultDocuments(userId) {
  const res = await api.get(`/vault/${userId}`);
  return res.data;
}
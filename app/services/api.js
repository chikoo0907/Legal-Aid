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
  try {
    const res = await api.post(`/chat`, { prompt, language });
    return res.data?.text || "I couldn't produce a reply.";
  } catch (error) {
    const baseUrl = getApiBaseUrl();
    const status = error?.response?.status;
    const data = error?.response?.data;
    const serverMsg =
      data?.error ||
      data?.detail?.error?.message ||
      data?.detail?.message ||
      null;

    console.error("Error in sendPrompt:", { baseUrl, status, data });

    if (!status) {
      throw new Error(`Cannot reach server at ${baseUrl}. Check Wi‑Fi/IP and that backend is running.`);
    }

    throw new Error(
      serverMsg
        ? `Server error (${status}): ${serverMsg}`
        : `Server error (${status}). Check backend logs.`
    );
  }
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

export async function register(data) {
  // ✅ Send full object (name, email, phone, password)
  const res = await api.post(`/auth/register`, data);
  return res.data;
}

export async function uploadVaultDocument({ userId, uri, name, type, folderId }) {
  const formData = new FormData();
  formData.append("userId", userId);
  if (folderId) formData.append("folderId", folderId);
  formData.append("file", {
    uri,
    name,
    type: type || "application/octet-stream",
  });

  const res = await api.post(`/vault/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function listVaultDocuments(userId) {
  const res = await api.get(`/vault/${userId}`);
  return res.data;
}

export async function deleteVaultDocument(id) {
  const res = await api.delete(`/vault/${id}`);
  return res.data;
}

export async function renameVaultDocument(id, name, category) {
  const res = await api.patch(`/vault/${id}`, { name, category });
  return res.data;
}

export async function getDocumentsList(params = {}) {
  const { q = "", category = "" } = params;
  const res = await api.get("/documents", { params: { q, category } });
  const res = await api.get("/documents", { params: { q, category } });
  return res.data;
}

export async function getDocumentById(id) {
  const res = await api.get(`/documents${id}`);
  return res.data;
}
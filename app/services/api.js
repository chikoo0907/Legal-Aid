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

export async function getUser(userId) {
  const res = await api.get(`/user/${userId}`);
  return res.data;
}

export async function updateUserLanguage(userId, language) {
  const res = await api.patch(`/user/${userId}/language`, { language });
  return res.data;
}

// Vault PIN helpers
export async function setVaultPin(userId, pin) {
  const res = await api.post(`/user/${userId}/vault-pin`, { pin });
  return res.data;
}

export async function verifyVaultPin(userId, pin) {
  const res = await api.post(`/user/${userId}/vault-pin/verify`, { pin });
  return res.data;
}

export async function resetVaultPin(userId, password, newPin) {
  const res = await api.post(`/user/${userId}/vault-pin/reset`, {
    password,
    newPin,
  });
  return res.data;
}

// Generic Gemini-based translation middleware.
// payload: string | object | array
// language: "en" | "hi" | "mr" | "gu" | "pa" | "ta" | "te"
export async function translatePayload(payload, language) {
  const res = await api.post(`/translate`, { payload, language });
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
  return res.data;
}

export async function getDocumentById(id) {
  const res = await api.get(`/documents${id}`);
  return res.data;
}

// Lawyer registration
export async function registerLawyer(data) {
  const formData = new FormData();
  
  // Basic user info
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("name", data.name);
  formData.append("phone", data.phone || "");
  
  // Lawyer specific info
  formData.append("barCouncilNumber", data.barCouncilNumber);
  formData.append("specialization", data.specialization || "");
  formData.append("experience", data.experience?.toString() || "");
  formData.append("bio", data.bio || "");
  formData.append("address", data.address || "");
  formData.append("city", data.city || "");
  formData.append("state", data.state || "");
  formData.append("pincode", data.pincode || "");
  
  // Documents - use uri from image picker asset
  if (data.barCouncilCertificate && data.barCouncilCertificate.uri) {
    const filename = data.barCouncilCertificate.uri.split("/").pop() || "barCouncilCertificate.jpg";
    formData.append("barCouncilCertificate", {
      uri: data.barCouncilCertificate.uri,
      name: filename,
      type: data.barCouncilCertificate.mimeType || "image/jpeg",
    });
  }
  
  if (data.idProof && data.idProof.uri) {
    const filename = data.idProof.uri.split("/").pop() || "idProof.jpg";
    formData.append("idProof", {
      uri: data.idProof.uri,
      name: filename,
      type: data.idProof.mimeType || "image/jpeg",
    });
  }
  
  if (data.photo && data.photo.uri) {
    const filename = data.photo.uri.split("/").pop() || "photo.jpg";
    formData.append("photo", {
      uri: data.photo.uri,
      name: filename,
      type: data.photo.mimeType || "image/jpeg",
    });
  }

  try {
    console.log("Sending lawyer registration request to:", `${getApiBaseUrl()}/auth/register-lawyer`);
    const res = await api.post(`/auth/register-lawyer`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30 seconds timeout for file uploads
    });
    return res.data;
  } catch (error) {
    console.error("Lawyer registration API error:", error);
    if (error.response) {
      // Server responded with error
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      throw new Error(error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      // Request made but no response
      console.error("No response from server. Is the server running?");
      throw new Error(`Cannot reach server at ${getApiBaseUrl()}. Make sure the server is running.`);
    } else {
      // Error setting up request
      console.error("Request setup error:", error.message);
      throw error;
    }
  }
}

// Get lawyers
export async function getLawyers(params = {}) {
  const { city = "", specialization = "", search = "" } = params;
  const res = await api.get("/lawyers", {
    params: { city, specialization, search },
  });
  return res.data;
}

// Get lawyer by ID
export async function getLawyerById(id) {
  const res = await api.get(`/lawyers/${id}`);
  return res.data;
}

// Get lawyer by userId
export async function getLawyerByUserId(userId) {
  const res = await api.get(`/lawyers/by-user/${userId}`);
  return res.data;
}

// Appointment functions
export async function getLawyerAppointments(lawyerId, status) {
  const params = status ? { status } : {};
  const res = await api.get(`/appointments/lawyer/${lawyerId}`, { params });
  return res.data;
}

export async function getUserAppointments(userId, status) {
  const params = status ? { status } : {};
  const res = await api.get(`/appointments/user/${userId}`, { params });
  return res.data;
}

export async function createAppointment(data) {
  const res = await api.post(`/appointments`, data);
  return res.data;
}

export async function updateAppointment(id, data) {
  const res = await api.patch(`/appointments/${id}`, data);
  return res.data;
}

export async function getAppointmentById(id) {
  const res = await api.get(`/appointments/${id}`);
  return res.data;
}
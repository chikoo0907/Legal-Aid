import Constants from "expo-constants";
import { Platform } from "react-native";

// If you run on a physical phone, you can set this in `.env`:
// EXPO_PUBLIC_API_BASE_URL=http://<YOUR_LAPTOP_LAN_IP>:4000
const ENV_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "").trim();

function getExpoHostIp() {
  // Expo Go / dev: often provides something like "192.168.x.x:8081"
  const host =
    Constants?.expoGoConfig?.debuggerHost ||
    Constants?.expoConfig?.hostUri ||
    "";
  const raw = String(host).trim();
  if (!raw) return "";
  const ip = raw.split(":")[0]?.trim() || "";
  if (!ip) return "";
  if (ip === "localhost" || ip === "127.0.0.1") return "";
  return ip;
}

// Defaults:
// - If we can infer the LAN IP from Expo, use it (works on physical phone + most setups).
// - Else Android emulator uses 10.0.2.2.
// - Else localhost for iOS/web.
const EXPO_IP = getExpoHostIp();
const DEFAULT_URL = EXPO_IP
  ? `http://${EXPO_IP}:4000`
  : Platform.OS === "android"
    ? "http://10.0.2.2:4000"
    : "http://localhost:4000";

export const API_BASE_URL = ENV_URL || DEFAULT_URL;

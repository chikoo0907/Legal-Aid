import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { register as apiRegister } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function Register({ navigation }) {
  // ✅ NEW: Added name & phone state
  const [name, setName] = useState("");        // 🔹 NEW
  const [phone, setPhone] = useState("");      // 🔹 NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigation.replace("Home");
    }
  }, [isAuthenticated, loading]);

  async function handleRegister() {
    try {
      // ✅ UPDATED: Send name & phone to API
      const user = await apiRegister({
        name,
        email,
        phone,
        password,
      });

      await login(user);
      navigation.replace("Home", { user });
    } catch (e) {
      Alert.alert(t("signUpFailed"), t("unableToCreateAccount"));
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">

          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-6">
              <Ionicons name="hammer-outline" size={36} color="white" />
            </View>
            <Text className="text-3xl font-bold text-slate-900">
              {t("createAccount")}
            </Text>
          </View>

          {/* ✅ NEW: Name Input */}
          <View className="mt-5">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("fullName").toUpperCase()}
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
              <Ionicons name="person-outline" size={18} color="#94a3b8" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t("enterFullName")}
                className="flex-1 ml-3 text-slate-900"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mt-5">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("email").toUpperCase()}
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
              <Ionicons name="mail-outline" size={18} color="#94a3b8" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholder="you@example.com"
                className="flex-1 ml-3 text-slate-900"
              />
            </View>
          </View>

          {/* ✅ NEW: Phone Input */}
          <View className="mt-5">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("phoneNumber").toUpperCase()}
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
              <Ionicons name="call-outline" size={18} color="#94a3b8" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder={t("enterPhoneNumber")}
                className="flex-1 ml-3 text-slate-900"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mt-5">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("password").toUpperCase()}
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
              <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={t("createPassword")}
                className="flex-1 ml-3 text-slate-900"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            className="bg-blue-600 rounded-xl py-4 mt-12 items-center"
          >
            <Text className="text-white font-bold text-base">
              {t("createAccount")}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

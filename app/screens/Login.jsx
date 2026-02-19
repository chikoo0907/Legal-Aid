import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { login as apiLogin } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigation.replace("Home");
    }
  }, [isAuthenticated, loading]);

  async function handleLogin() {
    try {
      const user = await apiLogin(email, password);
      await login(user);
      navigation.replace("Home", { user });
    } catch (e) {
      Alert.alert(t("loginFailed"), t("invalidCredentials"));
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">

          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="shield-checkmark" size={40} color="#2563eb" />
            </View>
            <Text className="text-3xl font-bold text-slate-900">
              {t("welcomeBack")}
            </Text>
            <Text className="text-slate-500 mt-2">
              {t("signInToContinue")}
            </Text>
          </View>

          {/* Email */}
          <View>
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("email").toUpperCase()}
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
              <Ionicons name="mail-outline" size={18} color="#94a3b8" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
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
                placeholder="••••••••"
                className="flex-1 ml-3 text-slate-900"
              />
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-blue-600 rounded-xl py-4 mt-12 items-center"
          >
            <Text className="text-white font-bold text-base">
              {t("login")}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text className="text-center text-slate-500 mt-8">
            {t("newHere")}{" "}
            <Text
              className="text-blue-600 font-semibold"
              onPress={() => navigation.navigate("Register")}
            >
              {t("createAccount")}
            </Text>
          </Text>

        </View>
      </ScrollView>
    </View>
  );
}
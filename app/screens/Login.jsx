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
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, isAuthenticated, loading, user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    // Only redirect if user is already logged in (not during active login)
    if (!loading && isAuthenticated && user && !isLoggingIn) {
      // Route based on user role - this handles when user is already logged in
      if (user?.role === "lawyer") {
        if (user?.lawyer?.isVerified) {
          navigation.replace("LawyerHome");
        } else {
          navigation.replace("LawyerPendingVerification");
        }
      } else {
        navigation.replace("Home");
      }
    }
  }, [isAuthenticated, loading, user, isLoggingIn]);

  async function handleLogin() {
    try {
      setIsLoggingIn(true);
      const userData = await apiLogin(email, password);
      console.log("Login response:", JSON.stringify(userData, null, 2));
      
      // Route based on user role BEFORE updating auth state
      // This prevents useEffect from interfering
      console.log("User role:", userData?.role);
      console.log("Lawyer data:", userData?.lawyer);
      console.log("Is verified:", userData?.lawyer?.isVerified);
      
      let targetRoute = "Home";
      if (userData?.role === "lawyer") {
        if (userData?.lawyer?.isVerified) {
          console.log("Routing to LawyerHome");
          targetRoute = "LawyerHome";
        } else {
          console.log("Routing to LawyerPendingVerification");
          targetRoute = "LawyerPendingVerification";
        }
      } else {
        console.log("Routing to Home");
        targetRoute = "Home";
      }
      
      // Update auth state
      await login(userData);
      
      // Use reset to clear navigation stack and prevent redirects
      navigation.reset({
        index: 0,
        routes: [{ name: targetRoute }],
      });
      setIsLoggingIn(false);
    } catch (e) {
      console.error("Login error:", e);
      setIsLoggingIn(false);
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
              onPress={() => navigation.navigate("RoleSelection")}
            >
              {t("createAccount")}
            </Text>
          </Text>

        </View>
      </ScrollView>
    </View>
  );
}
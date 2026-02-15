import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login as apiLogin } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigation.replace("Home");
    }
  }, [isAuthenticated, loading, navigation]);

  async function handleLogin() {
    try {
      const user = await apiLogin(email, password);
      await login(user);
      navigation.replace("Home", { user });
    } catch (e) {
      Alert.alert("Login failed", "Invalid credentials or server not reachable.");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">

          {/* Icon */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-[#1152d4]/10 rounded-full items-center justify-center">
              <Ionicons name="shield-checkmark-outline" size={40} color="#1152d4" />
            </View>
          </View>

          {/* Header */}
          <View className="items-center mb-16">
            <Text className="text-3xl font-bold text-[#0f172a]">
              Welcome Back
            </Text>
            <Text className="text-[#64748b] mt-2 text-center">
              Sign in to your legal assistant
            </Text>
          </View>

          {/* Email */}
          <View>
            <Text className="text-xs font-semibold text-[#475569] mb-2">
              EMAIL
            </Text>
            <View className="flex-row items-center border border-[#1152d4]/30 bg-[#f1f5f9] rounded-xl px-4 py-4">
              <Ionicons name="mail-outline" size={18} color="#94a3b8" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                className="flex-1 ml-3 text-[#0f172a]"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mt-5">
            <Text className="text-xs font-semibold text-[#475569] mb-2">
              PASSWORD
            </Text>
            <View className="flex-row border border-[#1152d4]/30 items-center bg-[#f1f5f9] rounded-xl px-4 py-4">
              <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="flex-1 ml-3 text-[#0f172a]"
              />
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-[#1152d4] rounded-xl py-4 mt-16 items-center shadow-lg"
          >
            <Text className="text-white font-bold text-base">
              Login
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text className="text-center text-[#64748b] mt-8">
            New here?{" "}
            <Text
              className="text-[#1152d4] font-semibold"
              onPress={() => navigation.navigate("Register")}
            >
              Create an account
            </Text>
          </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

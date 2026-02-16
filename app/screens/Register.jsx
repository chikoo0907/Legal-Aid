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
import { register as apiRegister } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function Register({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigation.replace("Home");
    }
  }, [isAuthenticated, loading, navigation]);

  async function handleRegister() {
    try {
      const user = await apiRegister(email, password);
      await login(user);
      navigation.replace("Home", { user });
    } catch (e) {
      Alert.alert(
        "Sign up failed",
        "Could not create account or server not reachable."
      );
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-8">

          {/* Logo */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-[#1152d4] rounded-2xl items-center justify-center shadow-lg">
              <Ionicons name="hammer-outline" size={28} color="white" />
            </View>
          </View>

          {/* Header */}
          <View className="mb-16 items-center">
            <Text className="text-2xl font-bold text-[#0f172a]">
              Create Account
            </Text>
            <Text className="text-sm text-[#64748b] mt-2 text-center">
              Join thousands learning their legal rights.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">

            {/* Email */}
            <View>
              <Text className="text-xs font-semibold text-[#475569] mb-2">
                EMAIL ADDRESS
              </Text>
              <View className="flex-row items-center bg-[#f1f5f9] border border-[#1152d4]/30 rounded-xl px-4 py-3">
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
            <View className="mt-4">
              <Text className="text-xs font-semibold text-[#475569] mb-2">
                PASSWORD
              </Text>
              <View className="flex-row items-center bg-[#f1f5f9] border border-[#1152d4]/30 rounded-xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  className="flex-1 ml-3 text-[#0f172a]"
                />
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleRegister}
              className="bg-[#1152d4] rounded-xl py-4 mt-16 items-center shadow-lg"
            >
              <Text className="text-white font-bold text-base">
                Create Account
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text className="text-center text-[#64748b] mt-6">
              Already have an account?{" "}
              <Text
                className="text-[#1152d4] font-semibold"
                onPress={() => navigation.navigate("Login")}
              >
                Login
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

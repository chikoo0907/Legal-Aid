import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function RoleSelection({ navigation }) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-6">
              <Ionicons name="people-outline" size={36} color="white" />
            </View>
            <Text className="text-3xl font-bold text-slate-900 text-center">
              {t("selectAccountType") || "Select Account Type"}
            </Text>
            <Text className="text-slate-500 mt-2 text-center">
              {t("chooseAccountTypeDesc") || "Choose how you want to use Legal Aid"}
            </Text>
          </View>

          {/* User Option */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Register", { role: "user" })}
            className="bg-white border-2 border-slate-200 rounded-2xl p-6 mb-4"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-14 h-14 bg-blue-100 rounded-xl items-center justify-center mr-4">
                <Ionicons name="person-outline" size={28} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-900">
                  {t("user") || "User"}
                </Text>
                <Text className="text-slate-500 text-sm mt-1">
                  {t("userAccountDesc") || "Get legal assistance and information"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
            </View>
          </TouchableOpacity>

          {/* Lawyer Option */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Register", { role: "lawyer" })}
            className="bg-white border-2 border-slate-200 rounded-2xl p-6"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-14 h-14 bg-amber-100 rounded-xl items-center justify-center mr-4">
                <Ionicons name="briefcase-outline" size={28} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-900">
                  {t("lawyer") || "Lawyer"}
                </Text>
                <Text className="text-slate-500 text-sm mt-1">
                  {t("lawyerAccountDesc") || "Register as a verified lawyer to help users"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
            </View>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-8"
          >
            <Text className="text-center text-slate-500">
              {t("alreadyHaveAccount") || "Already have an account? "}
              <Text className="text-blue-600 font-semibold">
                {t("login") || "Login"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

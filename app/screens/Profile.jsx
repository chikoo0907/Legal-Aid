import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Profile({ navigation }) {
  const { user, logout, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1152d4" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>{t("noUserDataFound")}</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  return (
    <View className="flex-1 bg-white">

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ===== HEADER SECTION ===== */}
        <View className="bg-[#1152d4] pt-14 pb-20 px-6 rounded-b-3xl">

          {/* Top Bar */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back-ios"
                size={20}
                color="white"
              />
            </TouchableOpacity>

            <Text className="text-white text-lg font-semibold">
              {t("profile")}
            </Text>

            <TouchableOpacity>
              <MaterialIcons name="edit" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Image */}
          <View className="items-center">
            <View className="relative">
              <View className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 items-center justify-center">

                {user.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <MaterialIcons
                    name="person"
                    size={50}
                    color="white"
                  />
                )}

              </View>

              {/* Verified Badge */}
              <View className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                <MaterialIcons
                  name="verified"
                  size={18}
                  color="#1152d4"
                />
              </View>
            </View>

            <Text className="text-white text-xl font-bold mt-4">
              {user.name || "User"}
            </Text>

            <Text className="text-white/70 text-sm mt-1">
              {t("verifiedMember")}
            </Text>
          </View>
        </View>

        {/* ===== INFO CARD ===== */}
        <View className="px-6 -mt-10">
          <View className="bg-white rounded-3xl shadow-md overflow-hidden">

            <InfoItem label={t("fullName")} value={user.name} />
            <InfoItem label={t("phoneNumber")} value={user.phone} />
            <InfoItem label={t("emailAddress")} value={user.email} isLast />

          </View>
        </View>

        {/* ===== LOGOUT BUTTON ===== */}
        <View className="px-6 py-10">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center py-4 bg-red-100 rounded-2xl"
          >
            <MaterialIcons
              name="logout"
              size={20}
              color="#ef4444"
            />
            <Text className="text-red-500 font-semibold ml-2">
              {t("logout")}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

function InfoItem({ label, value, isLast }) {
  const { t } = useTranslation();
  return (
    <View
      className={`py-5 px-6 ${
        !isLast ? "border-b border-slate-100" : ""
      }`}
    >
      <Text className="text-xs font-semibold text-slate-400 uppercase mb-1">
        {label}
      </Text>
      <Text className="text-slate-800 font-medium">
        {value || t("notProvided")}
      </Text>
    </View>
  );
}
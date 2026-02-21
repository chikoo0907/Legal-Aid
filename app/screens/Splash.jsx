import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Splash({ navigation }) {
  // const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const [checking, setChecking] = useState(false);
  const { t } = useTranslation();

  const handleGetStarted = async () => {
    setChecking(true);

    const hasSelectedLanguage = await AsyncStorage.getItem("hasSelectedLanguage");

    if (!isAuthenticated) {
      navigation.replace("Login");
    } else if (!hasSelectedLanguage && !user?.language) {
      navigation.replace("Language");
    } else {
      // Route lawyers to LawyerHome, regular users to Home
      if (user?.role === "lawyer") {
        navigation.replace("LawyerHome");
      } else {
        navigation.replace("Home");
      }
    }

    setChecking(false);
  };

  return (
    <View className="flex-1 bg-[#f8f8f7] items-center justify-between px-6 py-12">
      
      {/* Spacer */}
      <View />

      {/* Center Content */}
      <View className="items-center gap-8 w-full max-w-[480px]">
        {/* Icon Circle */}
        <View className="w-32 h-32 rounded-full items-center justify-center bg-[#1152d4]/10">
          <Text className="text-[#1152d4] text-[64px]">⚖️</Text>
        </View>

        {/* Text Content */}
        <View className="items-center space-y-3">
          <Text className="text-[#1152d4] text-3xl font-bold">{t("appName")}</Text>

          <Text className="text-[#0d121b] text-[28px] font-bold text-center leading-tight px-4">
            {t("understandLawSimple")}
          </Text>

          <Text className="text-[#4f7396] text-base text-center leading-relaxed max-w-[320px]">
            {t("splashSubtitle")}
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View className="w-full max-w-[480px] space-y-4">
        <Pressable
          onPress={handleGetStarted}
          disabled={checking}
          className="h-14 rounded-xl items-center justify-center bg-[#1152d4]"
        >
          <Text className="text-white text-lg font-bold">
            {t("getStarted")}
          </Text>
        </Pressable>

        <Text className="text-center text-[#4f7396] text-sm font-medium mb-12 mt-3">
          {t("legalAidTagline")}
        </Text>
      </View>

      {/* Background Glow */}
      <View className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#1152d4]/5 blur-3xl" />
      <View className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#1152d4]/5 blur-3xl" />
    </View>
  );
}

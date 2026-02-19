import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function Language({ navigation }) {
  const { t } = useTranslation();
  const { supportedLanguages, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);

  const handleContinue = async () => {
    if (!selected) return;
    try {
      await setLanguage(selected);
      // If the user is logged in, language has been stored in DB via LanguageContext.
      // For non-auth flows, it is still stored locally.
      navigation.replace("Home", { user });
    } catch (e) {
      Alert.alert(t("error"), t("saveLanguageFailed"));
    }
  };

  return (
    <View className="flex-1 bg-[#f6f6f8]">

      {/* Header */}
      <View className="px-4 py-4 border-b border-[#e5e7eb]">
        <Text className="text-center text-lg font-bold text-[#0d121b]">
          {t("selectLanguage")}
        </Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 py-8 items-center">
          <Text className="text-2xl font-bold text-[#0d121b] mb-2">
            {t("choosePreferredLanguage")}
          </Text>
          <Text className="text-[#4c669a] text-base text-center">
            {t("languageHelpsExplain")}
          </Text>
        </View>

        <View className="px-4 flex-row flex-wrap justify-between">
          {supportedLanguages.map((lang) => {
            const isSelected = selected === lang.id;

            return (
              <Pressable
                key={lang.id}
                onPress={() => setSelected(lang.id)}
                className={`w-[48%] mb-4 p-5 rounded-xl items-center border
                  ${isSelected
                    ? "border-[#1152d4] bg-[#1152d4]/5"
                    : "border-transparent bg-white"
                  }`}
              >
                <View className="w-14 h-14 rounded-full bg-[#1152d4]/10 items-center justify-center mb-3">
                  <Text className="text-[#1152d4] text-xl">🌐</Text>
                </View>

                <Text className="text-lg font-bold text-[#0d121b]">
                  {lang.nativeLabel}
                </Text>
                <Text className="text-sm text-[#4c669a]">
                  {lang.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="py-6" />
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#e5e7eb] bg-[#f6f6f8]">
        <Pressable
          onPress={handleContinue}
          disabled={!selected}
          className={`h-14 rounded-xl items-center justify-center
            ${selected ? "bg-[#1152d4]" : "bg-[#bfcbe6]"}`}
        >
          <Text className="text-white text-base font-bold">
            {t("continue")}
          </Text>
        </Pressable>
      </View>

    </View>
  );
}

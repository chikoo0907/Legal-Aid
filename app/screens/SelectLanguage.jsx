import { View, Text, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGES = [
  { id: "hi", label: "हिन्दी", sub: "Hindi" },
  { id: "en", label: "English", sub: "English" },
  { id: "mr", label: "मराठी", sub: "Marathi" },
  { id: "ta", label: "தமிழ்", sub: "Tamil" },
  { id: "bn", label: "বাংলা", sub: "Bengali" },
  { id: "te", label: "తెలుగు", sub: "Telugu" },
  { id: "gu", label: "ગુજરાતી", sub: "Gujarati" },
  { id: "kn", label: "ಕನ್ನಡ", sub: "Kannada" },
];

export default function Language({ navigation }) {
  const [selected, setSelected] = useState(null);

  const handleContinue = async () => {
    if (!selected) return;

    await AsyncStorage.setItem("selectedLanguage", selected);
    await AsyncStorage.setItem("hasSelectedLanguage", "true");

    navigation.replace("Home");
  };

  return (
    <View className="flex-1 bg-[#f6f6f8]">

      {/* Header */}
      <View className="px-4 py-4 border-b border-[#e5e7eb]">
        <Text className="text-center text-lg font-bold text-[#0d121b]">
          Select Language
        </Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 py-8 items-center">
          <Text className="text-2xl font-bold text-[#0d121b] mb-2">
            Choose your preferred language
          </Text>
          <Text className="text-[#4c669a] text-base text-center">
            This will help us explain the law in a language you understand best.
          </Text>
        </View>

        <View className="px-4 flex-row flex-wrap justify-between">
          {LANGUAGES.map((lang) => {
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
                  {lang.label}
                </Text>
                <Text className="text-sm text-[#4c669a]">
                  {lang.sub}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="text-center text-sm text-[#4c669a] py-6">
          More languages coming soon
        </Text>
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
            Continue / आगे बढ़ें
          </Text>
        </Pressable>
      </View>

    </View>
  );
}

import { View, Text, Pressable, ScrollView } from "react-native";

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Marathi", value: "mr" },
  { label: "Gujarati", value: "gu" },
  { label: "Punjabi", value: "pa" },
  { label: "Tamil", value: "ta" },
  { label: "Telugu", value: "te" },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <View className="bg-white border-b border-gray-200">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 8,
        }}
      >
        {LANGUAGES.map((l) => {
          const active = l.value === value;
          return (
            <Pressable
              key={l.value}
              onPress={() => onChange(l.value)}
              className={`px-3 py-2 rounded-full border ${
                active
                  ? "bg-blue-600 border-blue-600"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <Text className={`text-xs font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                {l.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
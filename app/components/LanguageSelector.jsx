import { View, Text, Pressable, ScrollView } from "react-native";
import { SUPPORTED_LANGUAGES } from "../i18n/resources";

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
        {SUPPORTED_LANGUAGES.map((l) => {
          const active = l.id === value;
          return (
            <Pressable
              key={l.id}
              onPress={() => onChange(l.id)}
              className={`px-3 py-2 rounded-full border ${
                active
                  ? "bg-blue-600 border-blue-600"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <Text className={`text-xs font-semibold ${active ? "text-white" : "text-slate-900"}`}>
                {l.nativeLabel}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

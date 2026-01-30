import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";

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
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {LANGUAGES.map((l) => {
          const active = l.value === value;
          return (
            <Pressable
              key={l.value}
              onPress={() => onChange(l.value)}
              style={[styles.pill, active && styles.pillActive]}
            >
              <Text style={[styles.text, active && styles.textActive]}>
                {l.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pillActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  text: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "600",
  },
  textActive: {
    color: "#FFFFFF",
  },
});
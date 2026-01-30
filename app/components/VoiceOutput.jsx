import * as Speech from "expo-speech";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const languageCodes = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  ta: "ta-IN",
  te: "te-IN",
};

export default function VoiceOutput({ text, language = "en" }) {
  if (!text) return null;
  
  const speak = () => {
    const langCode = languageCodes[language] || "en-US";
    Speech.speak(text, {
      language: langCode,
      pitch: 1.0,
      rate: 0.9,
    });
  };

  return (
    <TouchableOpacity
      accessibilityLabel="Play response audio"
      style={styles.button}
      onPress={speak}
    >
      <Text style={styles.icon}>🔈</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginLeft: 12,
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    color: "#FFFFFF",
  },
});
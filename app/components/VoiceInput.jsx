import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

// Placeholder voice input button with mic symbol; replace with real ASR if available.
export default function VoiceInput({ onResult }) {
  return (
    <TouchableOpacity
      accessibilityLabel="Voice input"
      style={styles.button}
      onPress={() => onResult("voice input simulated")}
    >
      <Text style={styles.icon}>🎤</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
    color: "#FFFFFF",
  },
});
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

// Placeholder voice input button with mic symbol; replace with real ASR if available.
export default function VoiceInput({ onResult }) {
  return (
    <TouchableOpacity
      accessibilityLabel="Voice input"
      className="w-11 h-11 rounded-full bg-blue-600 items-center justify-center"
      onPress={() => onResult("voice input simulated")}
    >
      <MaterialIcons size={20} name="mic"/>
    </TouchableOpacity>
  );
}
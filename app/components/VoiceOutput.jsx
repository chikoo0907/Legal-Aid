import { MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { TouchableOpacity } from "react-native";

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
      className="w-11 h-11 rounded-full bg-[#1152d4] items-center justify-center self-start ml-3 mb-2"
      onPress={speak}
    >
     <MaterialIcons size={22} color={"#ffffff"} name="campaign"/>
    </TouchableOpacity>
  );
}
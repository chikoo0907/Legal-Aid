// import { MaterialIcons } from "@expo/vector-icons";
// import { TouchableOpacity } from "react-native";

// // Placeholder voice input button with mic symbol; replace with real ASR if available.
// export default function VoiceInput({ onResult }) {
//   return (
//     <TouchableOpacity
//       accessibilityLabel="Voice input"
//       className="w-11 h-11 rounded-full bg-blue-600 items-center justify-center"
//       onPress={() => onResult("voice input simulated")}
//     >
//       <MaterialIcons size={20} name="mic"/>
//     </TouchableOpacity>
//   );
// }

import { useState, useRef } from "react";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export default function VoiceInput({ onResult }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.log("Start recording error:", err);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setLoading(true);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to backend
      const response = await fetch("http://YOUR_BACKEND_IP:5000/speech-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio: base64 }),
      });

      const data = await response.json();

      if (data.text) {
        onResult(data.text); // fill input
      }

      setLoading(false);
    } catch (err) {
      console.log("Stop recording error:", err);
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} className="ml-2">
      {loading ? (
        <ActivityIndicator size="small" color="#1152d4" />
      ) : (
        <MaterialIcons
          name={isRecording ? "stop-circle" : "mic"}
          size={26}
          color={isRecording ? "red" : "#1152d4"}
        />
      )}
    </TouchableOpacity>
  );
}

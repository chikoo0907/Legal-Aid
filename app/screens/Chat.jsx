import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LanguageSelector from "../components/LanguageSelector";

import { sendPrompt } from "../services/api";
import { useAuth } from "../context/AuthContext";
import VoiceInput from "../components/VoiceInput";
import VoiceOutput from "../components/VoiceOutput";

export default function Chat({ route, navigation }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("EN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const flatListRef = useRef(null);
  const { user, setUser } = useAuth();
  const routeUser = route?.params?.user;

  useEffect(() => {
    if (!user && routeUser) {
      setUser(routeUser);
      AsyncStorage.setItem("auth_user", JSON.stringify(routeUser));
    }
  }, [routeUser]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  const ask = async () => {
    if (!canSend) return;

    const text = input.trim();
    setInput("");

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, isUser: true },
    ]);

    setLoading(true);

    try {
      const reply = await sendPrompt(text, language);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-bot", text: reply, isUser: false },
      ]);
    } catch (e) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const sendAudioToBackend = async (uri) => {
    try {
      // console.log("Sending audio to backend...");

      const formData = new FormData();
      formData.append("audio", {
        uri: uri,
        type: "audio/m4a",
        name: "recording.m4a",
      });

      const baseUrl = getApiBaseUrl();
      console.log("BASE URL:", baseUrl);

      const response = await fetch(`${baseUrl}/speech-to-text`, {
        method: "POST",
        // headers: {
        //   "Content-Type": "application/json",
        // },
        body: formData, //JSON.stringify({ audio: base64Audio }),
      });
      // console.log("Response received from backend");
      const data = await response.json();
      console.log("Backend response:", data);

      if (!data.text) return;

      if (data.text) {
        const transcribedText = data.text.trim();

        // Directly send the message without relying on state
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), text: transcribedText, isUser: true },
        ]);

        setLoading(true);

        try {
          const reply = await sendPrompt(transcribedText, language);

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-bot",
              text: reply,
              isUser: false,
            },
          ]);
        } catch (e) {
          console.log("Chat error:", e);
        } finally {
          setLoading(false);
        }
      }

    } catch (error) {
      console.log("Send audio error:", error);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();

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
      setIsTranscribing(true);

      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      console.log("Recording URI:", uri);

      // const base64 = await FileSystem.readAsStringAsync(uri, {
      //   encoding: "base64",
      // });

      console.log("Audio captured successfully");

      await sendAudioToBackend(uri);

      setRecording(null);
    } catch (err) {
      console.log("Stop recording error:", err);
    }
    finally {
    setIsTranscribing(false);
  }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8]">
      {/* ---------- HEADER ---------- */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#0d121b" />
          </TouchableOpacity>

          <View>
            <Text className="text-base font-bold text-[#0d121b]">
              {user.email}
            </Text>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2 rounded-full bg-green-500" />
              <Text className="text-xs text-gray-500">Online</Text>
            </View>
          </View>
        </View>

        <View className="px-3 py-1 rounded-full bg-gray-100">
          <Text className="text-xs font-bold text-[#1152d4]">
            {language}
          </Text>
        </View>
      </View>

      {/* ---------- LANGUAGE SELECTOR ---------- */}
      <LanguageSelector value={language} onChange={setLanguage} />

      {/* ---------- CHAT AREA ---------- */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) =>
            item.isUser ? (
              /* USER MESSAGE */
              <View className="items-end mb-4">
                <Text className="text-[11px] text-gray-400 mb-1">You</Text>
                <View className="bg-[#1152d4] px-4 py-3 rounded-xl rounded-br-none max-w-[80%]">
                  <Text className="text-white text-sm leading-relaxed">
                    {item.text}
                  </Text>
                </View>
              </View>
            ) : (
              /* BOT MESSAGE */
              <View className="items-start mb-4">
                <Text className="text-[11px] text-gray-400 mb-1">
                  NyayaSahayak
                </Text>
                <View className="bg-white border border-gray-200 px-4 py-3 rounded-xl rounded-bl-none max-w-[80%]">
                  <Text className="text-[#0d121b] text-sm leading-relaxed">
                    {item.text}
                  </Text>
                  <VoiceOutput text={item.text} language={language} />
                </View>
              </View>
            )
          }

          ListEmptyComponent={
            <View className="items-center mt-16">
              <Text className="text-sm text-gray-500">
                Ask me about your legal rights 🇮🇳
              </Text>
              <Text className="text-sm text-gray-500">
                Send Hi to start chatting
              </Text>
            </View>
          }
        />

        {loading && (
          <View className="flex-row items-center px-4 pb-2 gap-2">
            <ActivityIndicator size="small" color="#1152d4" />
            <Text className="text-gray-500 text-sm">Thinking…</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* ---------- INPUT AREA ---------- */}
        <View className="border-t border-gray-200 bg-white px-4 pt-3 pb-6">
          <View className="flex-row items-center gap-2">
            
            <View className="flex-1 relative">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask about your rights..."
                className="bg-gray-100 rounded-2xl px-4 py-3 pr-10 text-sm"
                multiline
              />

               {/* SEND BUTTON */}
                <TouchableOpacity
                  onPress={ask}
                  disabled={!canSend}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <MaterialIcons
                    name="send"
                    size={20}
                    color={canSend ? "#1152d4" : "#9ca3af"}
                  />
                </TouchableOpacity>
              </View>

              {/* 🎤 MIC BUTTON CLEANLY PLACED */}
              {/* <VoiceInput onResult={(text) => setInput(text)} /> */}
              <View className="items-center ml-2">
                {isRecording ? (
                  <View className="items-center">
                    <View className="w-3 h-3 bg-red-600 rounded-full mb-1" />
                    <TouchableOpacity
                      onPress={stopRecording}
                      className="bg-red-600 p-3 rounded-full"
                    >
                      <MaterialIcons name="stop" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xs text-red-600 mt-1">Recording</Text>
                  </View>
                ) : isTranscribing ? (
                  <View className="items-center">
                    <ActivityIndicator size="small" color="#1152d4" />
                    <Text className="text-xs text-gray-500 mt-1">
                      Transcribing...
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={startRecording}
                    className="bg-[#1152d4] p-3 rounded-full"
                  >
                    <MaterialIcons name="mic" size={24} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

          <Text className="text-[10px] text-center text-gray-400 mt-3">
            NyayaSahayak provides legal information, not legal advice.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

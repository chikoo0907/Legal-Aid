import { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { sendPrompt } from "../services/api";
import VoiceInput from "../components/VoiceInput";
import VoiceOutput from "../components/VoiceOutput";
import ChatBubble from "../components/ChatBubble";
import LanguageSelector from "../components/LanguageSelector";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function Chat({ route, navigation }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const flatListRef = useRef(null);
  const { user, setUser } = useAuth();
  const routeUser = route?.params?.user;
  useEffect(() => {
    if (!user && routeUser) {
      // sync context if landed with param user
      setUser(routeUser);
      AsyncStorage.setItem("auth_user", JSON.stringify(routeUser)).catch(() => {});
    }
  }, [routeUser, user, setUser]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  const scrollToEnd = () => {
    requestAnimationFrame(() =>
      flatListRef.current?.scrollToEnd({ animated: true })
    );
  };

  async function ask() {
    if (!canSend) return;
    const text = input.trim();
    setInput("");
    setError("");
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, text, isUser: true },
    ]);
    scrollToEnd();
    setLoading(true);
    try {
      const r = await sendPrompt(text, language);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-bot`, text: r, isUser: false },
      ]);
    } catch (e) {
      setError("Could not get a reply. Check connection and try again.");
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Legal Assistant</Text>
          <Text style={styles.subtitle}>
            Ask legal questions in simple language
          </Text>
        </View>
        {!!user && (
          <View style={styles.userPill}>
            <Text style={styles.userPillText}>{user.email}</Text>
          </View>
        )}
      </View>

      <LanguageSelector value={language} onChange={setLanguage} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ChatBubble text={item.text} isUser={item.isUser} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Welcome</Text>
              <Text style={styles.emptySubtitle}>
                Ask me anything about legal rights, processes, or documents.
              </Text>
            </View>
          }
        />

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputRow}>
          <VoiceInput onResult={setInput} />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your question..."
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            onPress={ask}
            disabled={!canSend}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>

        <VoiceOutput text={messages[messages.length - 1]?.text || ""} language={language} />

        {!!user && (
          <View style={styles.vaultRow}>
            <Button
              title="Open Vault"
              onPress={() => navigation.navigate("Vault", { userId: user.id })}
            />
            <View style={{ height: 8 }} />
            <Button
              title="Logout"
              color="#EF4444"
              onPress={async () => {
                await AsyncStorage.removeItem("auth_user");
                setUser(null);
                navigation.replace("Login");
              }}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  subtitle: { color: "#475569", marginTop: 4 },
  userPill: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  userPillText: { color: "#0369A1", fontSize: 12 },
  flex: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#0F172A" },
  emptySubtitle: { color: "#475569", textAlign: "center" },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingText: { color: "#475569" },
  error: {
    color: "#DC2626",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  sendBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  sendBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  sendBtnText: { color: "#FFFFFF", fontWeight: "600" },
  vaultRow: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },
});
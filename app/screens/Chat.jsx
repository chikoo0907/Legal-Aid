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
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LanguageSelector from "../components/LanguageSelector";
import { sendPrompt } from "../services/api";
import { useAuth } from "../context/AuthContext";
import VoiceOutput from "../components/VoiceOutput";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

export default function Chat({ route, navigation }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const { language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

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
      setError(t("somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#0d121b" />
          </TouchableOpacity>

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{t("online")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.langBadge}>
          <Text style={styles.langText}>{language.toUpperCase()}</Text>
        </View>
      </View>

      {/* ---------- LANGUAGE SELECTOR ---------- */}
      <LanguageSelector value={language} onChange={setLanguage} />

      {/* ---------- CHAT AREA ---------- */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          renderItem={({ item }) =>
            item.isUser ? (
              <View style={styles.userWrapper}>
                <Text style={styles.senderLabel}>{t("you")}</Text>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{item.text}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.botWrapper}>
                <Text style={styles.senderLabel}>{t("appName")}</Text>
                <View style={styles.botBubble}>
                  <Text style={styles.botText}>{item.text}</Text>
                </View>
              </View>
            )
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {t("chatEmpty1")} 🇮🇳
              </Text>
              <Text style={styles.emptyText}>
                {t("chatEmpty2")}
              </Text>
            </View>
          }
        />

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#1152d4" />
            <Text style={styles.loadingText}>{t("thinking")}</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* ---------- INPUT AREA ---------- */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={t("askAboutRightsPlaceholder")}
                style={styles.input}
                multiline
              />
              <TouchableOpacity
                onPress={ask}
                disabled={!canSend}
                style={styles.sendBtn}
              >
                <MaterialIcons
                  name="send"
                  size={20}
                  color={canSend ? "#1152d4" : "#9ca3af"}
                />
              </TouchableOpacity>
            </View>

            <VoiceOutput
              text={messages[messages.length - 1]?.text || ""}
              language={language}
            />
          </View>

          <Text style={styles.disclaimer}>
            {t("chatDisclaimer")}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F8" },

  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  userEmail: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0d121b",
  },

  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 5,
  },

  onlineText: {
    fontSize: 11,
    color: "#6B7280",
  },

  langBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  langText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1152d4",
  },

  chatContent: {
    padding: 16,
    paddingBottom: 30,
  },

  userWrapper: {
    alignItems: "flex-end",
    marginBottom: 16,
  },

  botWrapper: {
    alignItems: "flex-start",
    marginBottom: 16,
  },

  senderLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },

  userBubble: {
    backgroundColor: "#1152d4",
    padding: 12,
    borderRadius: 14,
    borderBottomRightRadius: 4,
    maxWidth: "80%",
  },

  botBubble: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    maxWidth: "80%",
  },

  userText: {
    color: "#FFF",
    fontSize: 14,
    lineHeight: 20,
  },

  botText: {
    color: "#0d121b",
    fontSize: 14,
    lineHeight: 20,
  },

  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 6,
  },

  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#6B7280",
  },

  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 40,
    fontSize: 14,
    minHeight: 42,
  },

  sendBtn: {
    position: "absolute",
    right: 12,
    top: 12,
  },

  disclaimer: {
    fontSize: 10,
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 10,
  },

  error: {
    color: "red",
    textAlign: "center",
    marginVertical: 6,
  },
});
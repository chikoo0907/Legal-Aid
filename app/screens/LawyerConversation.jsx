import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getLawyerUserMessages, sendLawyerUserMessage } from "../services/api";

export default function LawyerConversation({ navigation, route }) {
  const { user: currentUser } = useAuth();
  const { user: chatUser, lawyerId } = route.params || {};
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  const effectiveLawyerId = lawyerId || currentUser?.lawyer?.id;

  useEffect(() => {
    loadMessages();
  }, [effectiveLawyerId, chatUser?.userId]);

  const loadMessages = async () => {
    if (!effectiveLawyerId || !chatUser?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getLawyerUserMessages(effectiveLawyerId, chatUser.userId);
      setMessages(
        (data || []).map((m) => ({
          id: m.id,
          text: m.message,
          sender: m.sender,
          timestamp: new Date(m.createdAt),
        }))
      );
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !effectiveLawyerId || !chatUser?.userId) return;

    const text = message.trim();
    setMessage("");
    setSending(true);

    const tempId = Date.now().toString();
    const tempMsg = {
      id: tempId,
      text,
      sender: "lawyer",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const sent = await sendLawyerUserMessage(
        effectiveLawyerId,
        chatUser.userId,
        "lawyer",
        text
      );
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, id: sent.id } : m
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setMessage(text);
    } finally {
      setSending(false);
    }
  };

  if (!chatUser) {
    navigation.goBack();
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{chatUser.userName || "User"}</Text>
          {chatUser.userEmail && (
            <Text style={styles.headerSubtitle}>{chatUser.userEmail}</Text>
          )}
        </View>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>
                Start a conversation with this user about their legal matter.
              </Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.sender === "lawyer" ? styles.lawyerMessage : styles.userMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === "lawyer"
                      ? styles.lawyerMessageText
                      : styles.userMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    msg.sender === "user" && styles.messageTimeDark,
                  ]}
                >
                  {msg.timestamp.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
          placeholderTextColor="#94A3B8"
          editable={!sending}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!message.trim() || sending}
        >
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#CBD5E1",
    marginTop: 8,
    textAlign: "center",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  lawyerMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  userMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  lawyerMessageText: {
    color: "#FFF",
  },
  userMessageText: {
    color: "#0f172a",
  },
  messageTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  messageTimeDark: {
    color: "#64748B",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0f172a",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

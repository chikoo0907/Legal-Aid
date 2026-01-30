import { View, Text, StyleSheet } from "react-native";

export default function ChatBubble({ text, isUser }) {
  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleBot,
        isUser ? styles.alignEnd : styles.alignStart,
      ]}
    >
      <Text style={isUser ? styles.textUser : styles.textBot}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "80%",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: "#DCF4FF",
  },
  bubbleBot: {
    backgroundColor: "#F2F4F7",
  },
  alignEnd: {
    alignSelf: "flex-end",
  },
  alignStart: {
    alignSelf: "flex-start",
  },
  textUser: {
    color: "#0F172A",
  },
  textBot: {
    color: "#111827",
  },
});
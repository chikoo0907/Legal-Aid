import { View, Text } from "react-native";

export default function ChatBubble({ text, isUser }) {
  return (
    <View 
    className={`max-w-[80%] rounded-[14px] px-3 py-2.5 my-1.5 shadow-sm ${isUser ? "bg-sky-100 self-end" : "bg-gray-100 self-start"}`}
    >
      <Text className={isUser ? "text-slate-900" : "text-gray-900"}>{text}</Text>
    </View>
  );
}
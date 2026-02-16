import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const translations = {
  en: {
    title: "Nyayasahayak",
    subtitle: "Your Legal Assistant",
    greeting: "How can we help you understand the law today?",
    ask: "Ask Legal Assistant",
    knowRights: "Know Your Rights",
    awareness: "Awareness",
    vault: "Document Vault",
    documentsNeeded: "Documents Needed",
    stepbystep: "Step By Step help"
  },
  hi: {
    title: "न्यायसहायक",
    subtitle: "आपका कानूनी सहायक",
    greeting: "आज हम आपको कानून समझने में कैसे मदद कर सकते हैं?",
    ask: "कानूनी सहायक से पूछें",
    knowRights: "अपने अधिकार जानें",
    awareness: "जागरूकता",
    vault: "दस्तावेज़ तिजोरी",
    documentsNeeded: "आवश्यक दस्तावेज़",
  },
};

export default function Home({ navigation, route }) {
  const { user } = useAuth();
  const language = route?.params?.language || "en";
  const t = translations[language];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Top App Bar */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
              <Ionicons name="person" size={22} color="#2563eb" />
            </View>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">
            {t.title}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Ionicons name="notifications-outline" size={22} color="#0f172a" />
          <Ionicons name="settings-outline" size={22} color="#0f172a" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View className="px-4 pt-6 mb-3">
          <Text className="text-2xl font-bold text-slate-900">
            Namaste!!
          </Text>
          <Text className="text-slate-600 mt-1">
            {t.greeting}
          </Text>
          {user && (
            <Text className="text-xs text-blue-600 mt-1">
              {user.email}
            </Text>
          )}
        </View>

        {/* Featured Ask Card */}
        <View className="px-4 mt-5">
          <View className="bg-teal-600 rounded-2xl p-5 overflow-hidden">
            <Text className="text-[10px] font-bold text-white bg-white/20 self-start px-2 py-0.5 rounded-full">
              AI POWERED
            </Text>

            <Text className="text-xl font-bold text-white mt-3">
              {t.ask}
            </Text>

            <Text className="text-teal-100 text-sm mt-1">
              Chat with our AI to get instant legal guidance in simple language.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Chat", { language })}
              className="mt-4 bg-white py-3 rounded-lg flex-row items-center justify-center gap-2"
            >
              <Text className="font-bold text-teal-700">
                Start Chatting
              </Text>
              <Ionicons name="chatbubble-ellipses" size={18} color="#0f766e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Grid */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-slate-900 mb-3">
            Explore Services
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {/* Know Your Rights */}
            <TouchableOpacity
              onPress={() => navigation.navigate("StepByStep", { language })}
              className="w-[48%] bg-indigo-600 rounded-xl p-4"
            >
              <MaterialCommunityIcons name="help" size={28} color="white" />
              <Text className="text-white font-bold mt-3">
                {t.stepbystep}
              </Text>
              <Text className="text-indigo-200 text-xs mt-1">
                Simplified legal guides
              </Text>
            </TouchableOpacity>

            {/* Documents Needed */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("DocumentsNeeded", { language })
              }
              className="w-[48%] bg-blue-600 rounded-xl p-4"
            >
              <Ionicons name="document-text" size={28} color="white" />
              <Text className="text-white font-bold mt-3">
                {t.documentsNeeded}
              </Text>
              <Text className="text-blue-200 text-xs mt-1">
                Required paperwork
              </Text>
            </TouchableOpacity>

            {/* Vault */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Vault", { language })}
              className="w-[48%] bg-white rounded-xl p-4 border border-slate-200"
            >
              <Ionicons name="folder-open" size={28} color="#2563eb" />
              <Text className="text-slate-900 font-bold mt-3">
                {t.vault}
              </Text>
              <Text className="text-slate-500 text-xs mt-1">
                Secure document storage
              </Text>
            </TouchableOpacity>

            {/* Awareness */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Awareness", { language })}
              className="w-[48%] bg-white rounded-xl p-4 border border-slate-200"
            >
              <Ionicons name="megaphone" size={28} color="#f97316" />
              <Text className="text-slate-900 font-bold mt-3">
                {t.awareness}
              </Text>
              <Text className="text-slate-500 text-xs mt-1">
                Legal updates & news
              </Text>
            </TouchableOpacity>

            {/* Step by step help */}
            {/* <TouchableOpacity
              onPress={() => navigation.navigate("StepByStep", { language })}
              className="w-[48%] bg-white border border-slate-200 rounded-xl p-4"
            >
              <MaterialCommunityIcons name="help" size={28} color="#f97316" />
              <Text className="text-slate-900 font-bold mt-3">
                {t.stepbystep}
              </Text>
              <Text className="text-slate-500 text-xs mt-1">
                Simplified legal guides
              </Text>
            </TouchableOpacity> */}
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}

import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const translations = {
  en: {
    title: "Know Your Rights",
    subtitle: "Understand your legal protections",
    intro:
      "Learn about your fundamental legal rights and how to exercise them properly.",
    police: "Rights During Police Interaction",
    women: "Women’s Rights",
    consumer: "Consumer Rights",
    labor: "Labor & Employment Rights",
    property: "Property Rights",
  },
  hi: {
    title: "अपने अधिकार जानें",
    subtitle: "अपने कानूनी संरक्षण को समझें",
    intro:
      "अपने मौलिक कानूनी अधिकारों के बारे में जानें और उनका सही तरीके से उपयोग करें।",
    police: "पुलिस से संबंधित अधिकार",
    women: "महिला अधिकार",
    consumer: "उपभोक्ता अधिकार",
    labor: "श्रम एवं रोजगार अधिकार",
    property: "संपत्ति अधिकार",
  },
};

export default function KnowRights({ navigation, route }) {
  const language = route?.params?.language || "en";
  const t = translations[language];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-slate-200 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">
          {t.title}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Section */}
        <View className="mt-6">
          <Text className="text-lg font-semibold text-slate-900">
            {t.subtitle}
          </Text>
          <Text className="text-slate-600 mt-2 text-sm leading-6">
            {t.intro}
          </Text>
        </View>

        {/* Rights Cards */}
        <View className="mt-6 gap-4">
          <TouchableOpacity className="bg-indigo-600 rounded-xl p-4">
            <Ionicons name="shield-checkmark" size={26} color="white" />
            <Text className="text-white font-bold mt-3">
              {t.police}
            </Text>
            <Text className="text-indigo-200 text-xs mt-1">
              What to do & what not to do
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-pink-600 rounded-xl p-4">
            <Ionicons name="female" size={26} color="white" />
            <Text className="text-white font-bold mt-3">
              {t.women}
            </Text>
            <Text className="text-pink-200 text-xs mt-1">
              Protection & safety laws
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-blue-600 rounded-xl p-4">
            <Ionicons name="cart" size={26} color="white" />
            <Text className="text-white font-bold mt-3">
              {t.consumer}
            </Text>
            <Text className="text-blue-200 text-xs mt-1">
              Refunds, complaints & safety
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-emerald-600 rounded-xl p-4">
            <Ionicons name="briefcase" size={26} color="white" />
            <Text className="text-white font-bold mt-3">
              {t.labor}
            </Text>
            <Text className="text-emerald-200 text-xs mt-1">
              Workplace protections
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white border border-slate-200 rounded-xl p-4">
            <Ionicons name="home" size={26} color="#2563eb" />
            <Text className="text-slate-900 font-bold mt-3">
              {t.property}
            </Text>
            <Text className="text-slate-500 text-xs mt-1">
              Ownership & land laws
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
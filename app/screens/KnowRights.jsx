import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function KnowRights({ navigation }) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-slate-200 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">
          {t("knowRightsTitle")}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Section */}
        <View className="mt-6">
          <Text className="text-lg font-semibold text-slate-900">
            {t("knowRightsSubtitle")}
          </Text>
          <Text className="text-slate-600 mt-2 text-sm leading-6">
            {t("knowRightsIntro")}
          </Text>
        </View>

        {/* Rights Cards */}
        <View className="mt-6 gap-4">
          <TouchableOpacity className="bg-indigo-600 rounded-xl p-4">
            <Ionicons name="shield-checkmark" size={26} color="white" />
            <Text className="text-white font-bold mt-3">
              {t("knowRightsPolice")}
            </Text>
            <Text className="text-indigo-200 text-xs mt-1">
              {t("knowRightsPoliceDesc")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-pink-600 rounded-xl p-4">
            <Ionicons name="female" size={26} color="white" />
            <Text className="text-white font-bold mt-3">
              {t("knowRightsWomen")}
            </Text>
            <Text className="text-pink-200 text-xs mt-1">
              {t("knowRightsWomenDesc")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-blue-600 rounded-xl p-4">
            <Ionicons name="cart" size={26} color="white" />
            <Text className="text-white font-bold mt-3">
              {t("knowRightsConsumer")}
            </Text>
            <Text className="text-blue-200 text-xs mt-1">
              {t("knowRightsConsumerDesc")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-emerald-600 rounded-xl p-4">
            <Ionicons name="briefcase" size={26} color="white" />
            <Text className="text-white font-bold mt-3">
              {t("knowRightsLabor")}
            </Text>
            <Text className="text-emerald-200 text-xs mt-1">
              {t("knowRightsLaborDesc")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white border border-slate-200 rounded-xl p-4">
            <Ionicons name="home" size={26} color="#2563eb" />
            <Text className="text-slate-900 font-bold mt-3">
              {t("knowRightsProperty")}
            </Text>
            <Text className="text-slate-500 text-xs mt-1">
              {t("knowRightsPropertyDesc")}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
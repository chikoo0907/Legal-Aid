import { View, Text, FlatList, TouchableOpacity, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getStepCategories } from "../server/data/legalGuides/adapter";
import { useTranslation } from "react-i18next";

export default function StepByStep({ navigation }) {
  const STEP_CATEGORIES = getStepCategories();
  const { t } = useTranslation();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("StepDetails", { category: item })}
      className="px-4 py-2"
    >
      <View className="flex-row items-center bg-white p-4 rounded-xl border border-slate-200">
        <View className={`h-14 w-14 rounded-lg items-center justify-center ${item.color}`}>
          <MaterialIcons name={item.icon} size={26} />
        </View>

        <View className="flex-1 ml-4">
          <Text className="text-base font-bold text-slate-900">
            {item.title}
          </Text>
          <Text className="text-sm text-slate-500">
            {item.subtitle}
          </Text>
        </View>

        <MaterialIcons name="chevron-right" size={24} color="#94A3B8" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-50">

      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-slate-200">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">
            {t("stepByStepHeader")}
          </Text>
        </View>
        <Text className="text-sm text-slate-500 mt-1">
          {t("stepByStepSubheader")}
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 py-4">
        <TextInput
          placeholder={t("stepByStepSearchPlaceholder")}
          placeholderTextColor="#94A3B8"
          className="bg-white h-12 rounded-xl px-4 border border-slate-200"
        />
      </View>

      {/* List */}
      <FlatList
        data={STEP_CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
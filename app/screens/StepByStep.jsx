import { View, Text, FlatList, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { getStepCategories } from "../server/data/legalGuides/adapter";

export default function StepByStep({ navigation }) {
  const STEP_CATEGORIES = getStepCategories();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("StepDetails", { category: item })}
      className="px-4 py-2"
    >
      <View className="flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <View className={`h-14 w-14 rounded-lg items-center justify-center ${item.color}`}>
          <MaterialIcons name={item.icon} size={28} />
        </View>

        <View className="flex-1">
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
    <SafeAreaView className="flex-1 bg-[#f6f6f8]">
      {/* Header */}
      <View className="px-4 py-4">
        <View className="flex-row">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">
            Step-by-Step Legal Help
          </Text>
        </View>
        <Text className="text-sm text-slate-500 mt-1">
          Select a category to see simple guides
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 pb-4">
        <TextInput
          placeholder="Search legal categories"
          placeholderTextColor="#94A3B8"
          className="bg-white h-12 rounded-xl px-4 shadow-sm"
        />
      </View>

      {/* Categories */}
      <FlatList
        data={STEP_CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerClassName="pb-5"
      />
    </SafeAreaView>
  );
}
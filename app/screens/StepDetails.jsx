import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function StepDetail({ route, navigation }) {
  const { category } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8]">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold">
          {category.title}
        </Text>
      </View>

      <ScrollView className="px-6 pb-28">
        {/* Steps */}
        <Text className="text-lg font-bold mt-4 mb-3">
          Procedure Steps
        </Text>

        {category.steps.map((step, index) => (
          <View key={index} className="flex-row gap-3 mb-6">
            <View className="h-8 w-8 rounded-full bg-[#1152d4] items-center justify-center">
              <Text className="text-white font-bold">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-slate-900">
                {step.title}
              </Text>
              <Text className="text-sm text-slate-600 mt-1">
                {step.description}
              </Text>
            </View>
          </View>
        ))}

        {/* Documents */}
        <Text className="text-lg font-bold mt-6 mb-3">
          Documents Required
        </Text>

        {category.documents.map((doc, index) => (
            <View
                key={index}
                className="flex-row items-center justify-between bg-white p-4 mb-3 rounded-xl border border-slate-200"
            >
                <Text className="text-sm font-medium">
                {doc.name}
                </Text>

                {doc.mandatory && (
                <Text className="text-xs text-red-600 font-semibold">
                    Mandatory
                </Text>
                )}
            </View>
            ))}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-slate-200">
        <TouchableOpacity className="bg-[#1152d4] mb-10 py-4 rounded-xl items-center">
          <Text className="text-white font-bold">
            Download Templates
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function StepDetail({ route, navigation }) {
  const { category } = route.params;
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-slate-50">

      {/* Header */}
      <View className="px-4 pt-14 pb-4 bg-white border-b border-slate-200">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900">
            {category.title}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >

        {/* Steps Section */}
        <Text className="text-lg font-bold text-slate-900 mt-6 mb-4">
          {t("stepDetailsProcedureSteps")}
        </Text>

        {category.steps.map((step, index) => (
          <View
            key={index}
            className="flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-200"
          >
            <View className="h-8 w-8 rounded-full bg-blue-600 items-center justify-center">
              <Text className="text-white font-bold text-sm">
                {index + 1}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="font-bold text-slate-900">
                {step.title}
              </Text>
              <Text className="text-sm text-slate-600 mt-1 leading-5">
                {step.description}
              </Text>
            </View>
          </View>
        ))}

        {/* Documents Section */}
        <Text className="text-lg font-bold text-slate-900 mt-6 mb-4">
          {t("stepDetailsDocumentsRequired")}
        </Text>

        {category.documents.map((doc, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between bg-white p-4 mb-3 rounded-xl border border-slate-200"
          >
            <Text className="text-sm font-medium text-slate-900">
              {doc.name}
            </Text>

            {doc.mandatory && (
              <View className="px-2 py-1 bg-red-100 rounded-full">
                <Text className="text-xs text-red-600 font-semibold">
                  {t("stepDetailsMandatory")}
                </Text>
              </View>
            )}
          </View>
        ))}

        <View className="h-28" />
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-slate-200">
        <TouchableOpacity className="bg-blue-600 py-4 rounded-xl items-center">
          <Text className="text-white font-bold">
            {t("stepDetailsDownloadTemplates")}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
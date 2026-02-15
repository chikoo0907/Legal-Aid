import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDocumentsList } from "../services/api";
import { MaterialIcons } from "@expo/vector-icons";

const translations = {
  en: {
    title: "Documents Needed",
    subtitle: "Indian laws & procedures",
    search: "Search (e.g. PAN, land, passport)",
    all: "All",
    documents: "Documents Required",
    steps: "Steps to Follow",
  },
  hi: {
    title: "आवश्यक दस्तावेज़",
    subtitle: "भारतीय कानून व प्रक्रियाएं",
    search: "खोज (जैसे PAN, जमीन, पासपोर्ट)",
    all: "सभी",
    documents: "आवश्यक दस्तावेज़",
    steps: "चरण",
  },
};

export default function DocumentsNeeded({ navigation, route }) {
  const language = route?.params?.language || "en";
  const t = translations[language] || translations.en;

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async (q = "", cat = "") => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDocumentsList({ q, category: cat });

      const items = Array.isArray(data) ? data : data.items || [];
      const categories = data.categories || [];

      setCategories(categories);
      setItems(items);

      console.log("Documents API response:", data);

    } catch (e) {
      setError(e.message || "Failed to load.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => load(query, categoryId), 300);
    return () => clearTimeout(debounce);
  }, [query, categoryId, load]);

  const onSearch = () => load(query, categoryId);

  const renderCategory = ({ item }) => {
    const label = language === "hi" ? item.labelHi : item.labelEn;
    const active = categoryId === item.id;

    return (
      <TouchableOpacity
        onPress={() => setCategoryId(active ? "" : item.id)}
        className={`h-9 px-5 rounded-full mr-2 ${
          active
            ? "bg-[#1152d4]"
            : "bg-white border border-slate-200"
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            active ? "text-white" : "text-slate-600"
          }`}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const isSelected = selected?.id === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setSelected(isSelected ? null : item)}
        className={`rounded-xl mb-4 overflow-hidden ${
          isSelected
            ? "bg-white border-l-4 border-[#1152d4] shadow-md"
            : "bg-white border border-slate-200"
        }`}
      >
        {/* Header */}
        <View className="p-4 flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="bg-blue-100 p-2 rounded-lg">
              <Text className="text-[#1152d4] font-bold">📄</Text>
            </View>
            <View>
              <Text className="text-slate-900 font-bold text-base">
                {item.titleEn}
              </Text>
              {item.subtitle && (
                <Text className="text-xs text-slate-500">
                  {item.subtitle}
                </Text>
              )}
            </View>
          </View>
          <MaterialIcons
            name={isSelected ? "expand-less" : "expand-more"}
            size={24}
            color="#94A3B8"
          />
        </View>

        {/* Expanded Content */}
        {isSelected && (
          <View className="px-4 pb-5">
            <View className="h-px bg-slate-200 mb-4" />

            {/* Documents */}
            <Text className="text-[#1152d4] font-bold text-sm mb-3">
              {t.documents}
            </Text>

            {(item.documents || []).map((doc, i) => (
              <View key={i} className="flex-row items-start mb-2 gap-2">
                <Text className="text-[#1152d4] mt-0.5">✔</Text>
                <Text className="text-sm text-slate-700 flex-1">
                  {doc}
                </Text>
              </View>
            ))}

            {/* Steps */}
            <Text className="text-[#1152d4] font-bold text-sm mt-5 mb-3">
              {t.steps}
            </Text>

            {(item.steps || []).map((step, i) => (
              <View key={i} className="flex-row gap-3 mb-3">
                <View className="h-6 w-6 rounded-full bg-[#1152d4] items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {i + 1}
                  </Text>
                </View>
                <Text className="text-sm text-slate-700 flex-1">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8]">
      {/* Header */}
      <View className="bg-[#f6f6f8]/90 backdrop-blur px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#0d121b" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-slate-900">
              {t.title}
            </Text>
            <Text className="text-xs uppercase tracking-wider text-[#1152d4]/70">
              {t.subtitle}
            </Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 pb-4">
        <View className="relative">
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearch}
            placeholder={t.search}
            placeholderTextColor="#94A3B8"
            className="bg-white h-12 rounded-xl pl-4 pr-4 text-base shadow-sm"
          />
        </View>
      </View>

      {/* Categories */}
      <View className="px-4 pb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: "", labelEn: t.all, labelHi: t.all }, 
            ...categories
          ]}
          // data={categories}
          keyExtractor={(item) => item.id || "all"}
          renderItem={renderCategory}
        />
      </View>

      {/* Content */}
      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center">{error}</Text>
        </View>
      ) : loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1152d4" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) =>
            item.id || item._id || String(index)
          }
          renderItem={renderItem}
          contentContainerClassName="px-4 pb-24"
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-slate-400">No matches found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

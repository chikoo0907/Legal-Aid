import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDocumentsList } from "../services/api";

const translations = {
  en: {
    title: "Documents Needed",
    subtitle: "Indian laws & procedures",
    search: "Search (e.g. PAN, land, passport)",
    all: "All",
    documents: "Documents required",
    steps: "Steps",
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
      setCategories(data.categories || []);
      setItems(data.items || []);
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
        style={[styles.chip, active && styles.chipActive]}
        onPress={() => setCategoryId(active ? "" : item.id)}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const isSelected = selected?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelected(isSelected ? null : item)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardTitle}>{item.titleEn}</Text>
        {isSelected && (
          <View style={styles.detail}>
            <Text style={styles.detailHead}>{t.documents}</Text>
            {(item.documents || []).map((d, i) => (
              <Text key={i} style={styles.bullet}>• {d}</Text>
            ))}
            <Text style={[styles.detailHead, { marginTop: 12 }]}>{t.steps}</Text>
            {(item.steps || []).map((s, i) => (
              <Text key={i} style={styles.bullet}>• {s}</Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder={t.search}
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearch}
        />
      </View>

      <View style={styles.chipsWrap}>
        <TouchableOpacity
          style={[styles.chip, !categoryId && styles.chipActive]}
          onPress={() => setCategoryId("")}
        >
          <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>
            {t.all}
          </Text>
        </TouchableOpacity>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(c) => c.id}
          renderItem={renderCategory}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        />
      </View>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.muted}>No matches.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  back: { alignSelf: "flex-start", padding: 4, marginBottom: 4 },
  backText: { fontSize: 24, color: "#0EA5E9" },
  title: { fontSize: 22, fontWeight: "bold", color: "#1E293B" },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  searchRow: { padding: 12, backgroundColor: "#FFF" },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#1E293B",
  },
  chipsWrap: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  chips: { paddingHorizontal: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    marginLeft: 12,
  },
  chipActive: { backgroundColor: "#0EA5E9" },
  chipText: { fontSize: 14, color: "#475569" },
  chipTextActive: { color: "#FFF" },
  list: { padding: 12, paddingBottom: 32 },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardSelected: { borderColor: "#0EA5E9", borderWidth: 2 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1E293B" },
  detail: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  detailHead: { fontSize: 14, fontWeight: "600", color: "#475569" },
  bullet: { fontSize: 14, color: "#64748B", marginTop: 4, marginLeft: 4 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { color: "#DC2626", textAlign: "center" },
  muted: { color: "#94A3B8" },
});

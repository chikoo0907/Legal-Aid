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
import { getDocumentsList } from "../services/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function DocumentsNeeded({ navigation }) {
  const { t } = useTranslation();

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
      setError(e.message || t("docsNeededLoadFailed"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const debounce = setTimeout(() => load(query, categoryId), 300);
    return () => clearTimeout(debounce);
  }, [query, categoryId, load]);

  const onSearch = () => load(query, categoryId);

  const renderCategory = ({ item }) => {
    const label = item.labelEn;
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
        activeOpacity={0.8}
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelected(isSelected ? null : item)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>📄</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.titleEn}</Text>
            {item.subtitle && (
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            )}
          </View>

          <MaterialIcons
            name={isSelected ? "expand-less" : "expand-more"}
            size={24}
            color="#94A3B8"
          />
        </View>

        {/* Expanded Content */}
        {isSelected && (
          <View style={styles.detail}>
            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>{t("docsNeededDocuments")}</Text>

            {(item.documents || []).map((doc, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.check}>✔</Text>
                <Text style={styles.text}>{doc}</Text>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              {t("docsNeededSteps")}
            </Text>

            {(item.steps || []).map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{i + 1}</Text>
                </View>
                <Text style={styles.text}>{step}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#0d121b" />
        </TouchableOpacity>

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>{t("docsNeededTitle")}</Text>
          <Text style={styles.subtitle}>{t("docsNeededSubtitle")}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.input}
          placeholder={t("docsNeededSearchPlaceholder")}
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearch}
        />
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: "", labelEn: t("docsNeededAll") }, ...categories]}
        keyExtractor={(item) => item.id || "all"}
        renderItem={renderCategory}
        contentContainerStyle={styles.chips}
      />

      

      {/* Content */}
      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1152d4" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) =>
            item.id || item._id || String(index)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.muted}>{t("docsNeededNoMatches")}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F8" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#F6F6F8",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },

  subtitle: {
    fontSize: 12,
    color: "#1152d4",
    textTransform: "uppercase",
    marginTop: 2,
  },

  searchWrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    elevation: 2,
  },
  chips: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  
  chipActive: {
    backgroundColor: "#1152d4",
  },
  
  chipText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
  },
  
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },    

  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  cardSelected: {
    borderLeftWidth: 4,
    borderLeftColor: "#1152d4",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    backgroundColor: "#DBEAFE",
    padding: 8,
    borderRadius: 10,
    marginRight: 10,
  },

  icon: {
    fontSize: 16,
    color: "#1152d4",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },

  detail: {
    marginTop: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1152d4",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    marginBottom: 6,
  },

  check: {
    color: "#1152d4",
    marginRight: 6,
  },

  text: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
  },

  stepRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  stepCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    backgroundColor: "#1152d4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  stepNumber: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },

  muted: {
    color: "#94A3B8",
  },
});
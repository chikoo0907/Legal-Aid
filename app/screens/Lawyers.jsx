import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { getLawyers, getApiBaseUrl } from "../services/api";

export default function Lawyers({ navigation }) {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    loadLawyers();
  }, []);

  async function loadLawyers() {
    try {
      setLoading(true);
      const data = await getLawyers({
        city: filterCity,
        specialization: filterSpecialization,
        search: searchQuery,
      });
      setLawyers(data);
    } catch (error) {
      console.error("Error loading lawyers:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLawyers();
  }, [searchQuery, filterCity, filterSpecialization]);

  const verifiedLawyers = lawyers.filter((lawyer) => lawyer.isVerified);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("findLawyers") || "Find Lawyers"}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder={t("searchLawyers") || "Search lawyers..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <TextInput
            style={styles.filterInput}
            placeholder={t("filterByCity") || "City"}
            value={filterCity}
            onChangeText={setFilterCity}
          />
          <TextInput
            style={styles.filterInput}
            placeholder={t("filterBySpecialization") || "Specialization"}
            value={filterSpecialization}
            onChangeText={setFilterSpecialization}
          />
        </View>
      </View>

      {/* Lawyers List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : verifiedLawyers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyText}>
            {t("noLawyersFound") || "No verified lawyers found"}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {verifiedLawyers.map((lawyer) => (
            <TouchableOpacity
              key={lawyer.id}
              style={styles.lawyerCard}
              onPress={() => {
                navigation.navigate("LawyerDetail", { lawyer });
              }}
            >
              <View style={styles.lawyerHeader}>
                <View style={styles.avatarContainer}>
                  {lawyer.photoUrl ? (
                    <Image
                      source={{ uri: `${getApiBaseUrl()}${lawyer.photoUrl}` }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={32} color="#2563eb" />
                    </View>
                  )}
                </View>
                <View style={styles.lawyerInfo}>
                  <Text style={styles.lawyerName}>{lawyer.user?.name || "Lawyer"}</Text>
                  {lawyer.specialization && (
                    <Text style={styles.specialization}>{lawyer.specialization}</Text>
                  )}
                  {lawyer.experience && (
                    <Text style={styles.experience}>
                      {lawyer.experience} {t("yearsExperience") || "years of experience"}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
              </View>

              {lawyer.bio && (
                <Text style={styles.bio} numberOfLines={2}>
                  {lawyer.bio}
                </Text>
              )}

              <View style={styles.locationRow}>
                {lawyer.city && lawyer.state && (
                  <View style={styles.locationItem}>
                    <Ionicons name="location-outline" size={16} color="#64748b" />
                    <Text style={styles.locationText}>
                      {lawyer.city}, {lawyer.state}
                    </Text>
                  </View>
                )}
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.verifiedText}>
                    {t("verified") || "Verified"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterInput: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 16,
  },
  listContainer: {
    flex: 1,
  },
  lawyerCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  lawyerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  lawyerInfo: {
    flex: 1,
  },
  lawyerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 2,
  },
  experience: {
    fontSize: 12,
    color: "#64748b",
  },
  bio: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#64748b",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: "#065f46",
    fontWeight: "600",
  },
});

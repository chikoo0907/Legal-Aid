import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import { getLawyerAppointments, getLawyerById } from "../services/api";

export default function LawyerHome({ navigation, route }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [lawyerData, setLawyerData] = useState(null);
  const [appointmentsCount, setAppointmentsCount] = useState({ pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait a bit for user state to be fully updated after login
    if (!user) {
      return;
    }
    
    // Small delay to ensure state is updated
    const timer = setTimeout(() => {
      loadLawyerData();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [user]);

  const loadLawyerData = async () => {
    console.log("LawyerHome - loadLawyerData called");
    console.log("User data:", JSON.stringify(user, null, 2));
    
    // Only verified lawyers should hit this screen
    if (!user?.id) {
      console.warn("LawyerHome: No user ID");
      setLoading(false);
      navigation.replace("Home");
      return;
    }
    
    if (user?.role !== "lawyer") {
      console.warn("LawyerHome: User is not a lawyer, role is:", user?.role);
      setLoading(false);
      navigation.replace("Home");
      return;
    }
    
    if (!user?.lawyer?.id) {
      console.warn("LawyerHome: Missing lawyer.id. User lawyer data:", user?.lawyer);
      setLoading(false);
      navigation.replace("Home");
      return;
    }

    // Check if lawyer is verified
    if (!user?.lawyer?.isVerified) {
      console.warn("LawyerHome: Lawyer not verified");
      setLoading(false);
      navigation.replace("LawyerPendingVerification");
      return;
    }
    
    console.log("LawyerHome: All checks passed, loading lawyer data");

    try {
      // Get lawyer details by lawyerId from the logged‑in user
      const lawyer = await getLawyerById(user.lawyer.id);
      setLawyerData(lawyer);

      // Get appointment counts
      const [pendingAppts, completedAppts] = await Promise.all([
        getLawyerAppointments(lawyer.id, "pending"),
        getLawyerAppointments(lawyer.id, "completed"),
      ]);

      setAppointmentsCount({
        pending: pendingAppts?.length || 0,
        completed: completedAppts?.length || 0,
      });
    } catch (error) {
      console.error("Error loading lawyer data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  const lawyerName = user?.name || lawyerData?.user?.name || "Lawyer";

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color="#2563eb" />
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>{lawyerName}</Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setLangOpen(true)} accessibilityLabel={t("switchLanguage")}>
            <View style={styles.langChip}>
              <Text style={styles.langChipText}>{language.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color="#0f172a" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingTitle}>{t("namaste")}</Text>
          <Text style={styles.greetingText}>Welcome to your lawyer dashboard</Text>
          {user && (
            <Text style={styles.email}>{user.email}</Text>
          )}
        </View>

        {/* AI Card */}
        <View style={styles.cardWrap}>
          <View style={styles.aiCard}>
            <Text style={styles.aiBadge}>{t("aiPowered")}</Text>

            <Text style={styles.aiTitle}>{t("askLegalAssistant")}</Text>

            <Text style={styles.aiDesc}>
              {t("aiCardDesc")}
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Chat")}
              style={styles.aiButton}
            >
              <Text style={styles.aiButtonText}>{t("startChatting")}</Text>
              <Ionicons name="chatbubble-ellipses" size={18} color="#0f766e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Services */}
        <View style={styles.servicesWrap}>
          <Text style={styles.servicesTitle}>Manage Your Practice</Text>

          <View style={styles.grid}>
            {/* Appointments */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Appointments")}
              style={[styles.serviceCard, { backgroundColor: "#2563eb" }]}
            >
              <Ionicons name="calendar" size={28} color="white" />
              <Text style={styles.serviceTitle}>Appointments</Text>
              <Text style={styles.serviceDescLight}>
                {appointmentsCount.pending} pending
              </Text>
              <Text style={styles.serviceDescLight}>
                {appointmentsCount.completed} completed
              </Text>
            </TouchableOpacity>

            {/* Chat with Users */}
            <TouchableOpacity
              onPress={() => navigation.navigate("LawyerChat")}
              style={[styles.serviceCard, { backgroundColor: "#0f766e" }]}
            >
              <Ionicons name="chatbubbles" size={28} color="white" />
              <Text style={styles.serviceTitle}>Chat with Users</Text>
              <Text style={styles.serviceDescLight}>
                Connect with clients
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLangOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>{t("switchLanguage")}</Text>
            <View style={{ marginTop: 10 }}>
              {supportedLanguages.map((l) => {
                const active = l.id === language;
                return (
                  <TouchableOpacity
                    key={l.id}
                    onPress={async () => {
                      await setLanguage(l.id);
                      setLangOpen(false);
                    }}
                    style={[styles.langRow, active && styles.langRowActive]}
                  >
                    <Text style={[styles.langRowText, active && styles.langRowTextActive]}>
                      {l.nativeLabel} ({l.label})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 50,
  },

  header: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },

  headerIcons: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  langChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  langChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  greetingWrap: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  greetingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },

  greetingText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
  },

  email: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 6,
  },

  cardWrap: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  aiCard: {
    backgroundColor: "#0f766e",
    borderRadius: 20,
    padding: 20,
  },

  aiBadge: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFF",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    borderRadius: 20,
  },

  aiTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 10,
  },

  aiDesc: {
    fontSize: 13,
    color: "#CCFBF1",
    marginTop: 6,
  },

  aiButton: {
    backgroundColor: "#FFF",
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  aiButtonText: {
    fontWeight: "bold",
    color: "#0f766e",
  },

  servicesWrap: {
    paddingHorizontal: 16,
    marginTop: 25,
  },

  servicesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  serviceCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  serviceTitle: {
    color: "#FFF",
    fontWeight: "bold",
    marginTop: 10,
  },

  serviceDescLight: {
    color: "#E0E7FF",
    fontSize: 12,
    marginTop: 4,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  langRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  langRowActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD",
  },
  langRowText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },
  langRowTextActive: {
    color: "#1D4ED8",
  },
});

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

export default function Home({ navigation, route }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

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
          <Text style={styles.title}>{t("appName")}</Text>
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
          <Text style={styles.greetingText}>{t("homeGreeting")}</Text>
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
          <Text style={styles.servicesTitle}>{t("exploreServices")}</Text>

          <View style={styles.grid}>
            {/* Step By Step */}
            <TouchableOpacity
              onPress={() => navigation.navigate("StepByStep")}
              style={[styles.serviceCard, { backgroundColor: "#4f46e5" }]}
            >
              <MaterialCommunityIcons name="help" size={28} color="white" />
              <Text style={styles.serviceTitle}>{t("stepByStep")}</Text>
              <Text style={styles.serviceDescLight}>
                {t("stepByStepDesc")}
              </Text>
            </TouchableOpacity>

            {/* Documents Needed */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("DocumentsNeeded")
              }
              style={[styles.serviceCard, { backgroundColor: "#2563eb" }]}
            >
              <Ionicons name="document-text" size={28} color="white" />
              <Text style={styles.serviceTitle}>{t("documentsNeeded")}</Text>
              <Text style={styles.serviceDescLight}>
                {t("documentsNeededDesc")}
              </Text>
            </TouchableOpacity>

            {/* Vault */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Vault")}
              style={styles.serviceCardWhite}
            >
              <Ionicons name="folder-open" size={28} color="#2563eb" />
              <Text style={styles.serviceTitleDark}>{t("documentVault")}</Text>
              <Text style={styles.serviceDescDark}>
                {t("documentVaultDesc")}
              </Text>
            </TouchableOpacity>

            {/* Awareness */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Awareness")}
              style={styles.serviceCardWhite}
            >
              <Ionicons name="megaphone" size={28} color="#f97316" />
              <Text style={styles.serviceTitleDark}>{t("awareness")}</Text>
              <Text style={styles.serviceDescDark}>
                {t("awarenessDesc")}
              </Text>
            </TouchableOpacity>

            {/* Find Lawyers */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Lawyers")}
              style={[styles.serviceCard, { backgroundColor: "#d97706" }]}
            >
              <Ionicons name="briefcase" size={28} color="white" />
              <Text style={styles.serviceTitle}>{t("findLawyers") || "Find Lawyers"}</Text>
              <Text style={styles.serviceDescLight}>
                {t("findLawyersDesc") || "Connect with verified lawyers"}
              </Text>
            </TouchableOpacity>

            {/* My Appointments */}
            <TouchableOpacity
              onPress={() => navigation.navigate("UserAppointments")}
              style={[styles.serviceCard, { backgroundColor: "#0f766e" }]}
            >
              <Ionicons name="calendar" size={28} color="white" />
              <Text style={styles.serviceTitle}>My Appointments</Text>
              <Text style={styles.serviceDescLight}>
                View your booked appointments
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

  serviceCardWhite: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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

  serviceTitleDark: {
    color: "#0f172a",
    fontWeight: "bold",
    marginTop: 10,
  },

  serviceDescDark: {
    color: "#64748B",
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
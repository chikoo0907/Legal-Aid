import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

const translations = {
  en: {
    title: "Nyayasahayak",
    subtitle: "Your Legal Assistant",
    greeting: "How can we help you understand the law today?",
    ask: "Ask Legal Assistant",
    knowRights: "Know Your Rights",
    awareness: "Awareness",
    vault: "Document Vault",
    documentsNeeded: "Documents Needed",
    stepbystep: "Step By Step help"
  },
  hi: {
    title: "न्यायसहायक",
    subtitle: "आपका कानूनी सहायक",
    greeting: "आज हम आपको कानून समझने में कैसे मदद कर सकते हैं?",
    ask: "कानूनी सहायक से पूछें",
    knowRights: "अपने अधिकार जानें",
    awareness: "जागरूकता",
    vault: "दस्तावेज़ तिजोरी",
    documentsNeeded: "आवश्यक दस्तावेज़",
    stepbystep: "स्टेप बाय स्टेप मदद"
  },
};

export default function Home({ navigation, route }) {
  const { user } = useAuth();
  const language = route?.params?.language || "en";
  const t = translations[language];

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
          <Text style={styles.title}>{t.title}</Text>
        </View>

        <View style={styles.headerIcons}>
          <Ionicons name="notifications-outline" size={22} color="#0f172a" />
          <Ionicons name="settings-outline" size={22} color="#0f172a" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingTitle}>Namaste!!</Text>
          <Text style={styles.greetingText}>{t.greeting}</Text>
          {user && (
            <Text style={styles.email}>{user.email}</Text>
          )}
        </View>

        {/* AI Card */}
        <View style={styles.cardWrap}>
          <View style={styles.aiCard}>
            <Text style={styles.aiBadge}>AI POWERED</Text>

            <Text style={styles.aiTitle}>{t.ask}</Text>

            <Text style={styles.aiDesc}>
              Chat with our AI to get instant legal guidance in simple language.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Chat", { language })}
              style={styles.aiButton}
            >
              <Text style={styles.aiButtonText}>Start Chatting</Text>
              <Ionicons name="chatbubble-ellipses" size={18} color="#0f766e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Services */}
        <View style={styles.servicesWrap}>
          <Text style={styles.servicesTitle}>Explore Services</Text>

          <View style={styles.grid}>
            {/* Step By Step */}
            <TouchableOpacity
              onPress={() => navigation.navigate("StepByStep", { language })}
              style={[styles.serviceCard, { backgroundColor: "#4f46e5" }]}
            >
              <MaterialCommunityIcons name="help" size={28} color="white" />
              <Text style={styles.serviceTitle}>{t.stepbystep}</Text>
              <Text style={styles.serviceDescLight}>
                Simplified legal guides
              </Text>
            </TouchableOpacity>

            {/* Documents Needed */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("DocumentsNeeded", { language })
              }
              style={[styles.serviceCard, { backgroundColor: "#2563eb" }]}
            >
              <Ionicons name="document-text" size={28} color="white" />
              <Text style={styles.serviceTitle}>{t.documentsNeeded}</Text>
              <Text style={styles.serviceDescLight}>
                Required paperwork
              </Text>
            </TouchableOpacity>

            {/* Vault */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Vault", { language })}
              style={styles.serviceCardWhite}
            >
              <Ionicons name="folder-open" size={28} color="#2563eb" />
              <Text style={styles.serviceTitleDark}>{t.vault}</Text>
              <Text style={styles.serviceDescDark}>
                Secure document storage
              </Text>
            </TouchableOpacity>

            {/* Awareness */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Awareness", { language })}
              style={styles.serviceCardWhite}
            >
              <Ionicons name="megaphone" size={28} color="#f97316" />
              <Text style={styles.serviceTitleDark}>{t.awareness}</Text>
              <Text style={styles.serviceDescDark}>
                Legal updates & news
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
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
});
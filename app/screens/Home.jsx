import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

const translations = {
  en: {
    title: "Nyayasahayak",
    subtitle: "Your Legal Assistant",
    ask: "Ask",
    knowRights: "Know Your Rights",
    awareness: "Awareness",
    vault: "Vault",
  },
  hi: {
    title: "न्यायसहायक",
    subtitle: "आपका कानूनी सहायक",
    ask: "पूछें",
    knowRights: "अपने अधिकार जानें",
    awareness: "जागरूकता",
    vault: "तिजोरी",
  },
  mr: {
    title: "न्यायसहायक",
    subtitle: "तुमचा कायदेशीर सहाय्यक",
    ask: "विचारा",
    knowRights: "तुमचे हक्क जाणून घ्या",
    awareness: "जागरूकता",
    vault: "तिजोरी",
  },
  gu: {
    title: "ન્યાયસહાયક",
    subtitle: "તમારો કાનૂની સહાયક",
    ask: "પૂછો",
    knowRights: "તમારા અધિકારો જાણો",
    awareness: "જાગૃતિ",
    vault: "વૉલ્ટ",
  },
  pa: {
    title: "ਨਿਆਇਸਹਾਇਕ",
    subtitle: "ਤੁਹਾਡਾ ਕਾਨੂੰਨੀ ਸਹਾਇਕ",
    ask: "ਪੁੱਛੋ",
    knowRights: "ਆਪਣੇ ਅਧਿਕਾਰ ਜਾਣੋ",
    awareness: "ਜਾਗਰੂਕਤਾ",
    vault: "ਵੌਲਟ",
  },
  ta: {
    title: "நியாயஸஹாயக்",
    subtitle: "உங்கள் சட்ட உதவியாளர்",
    ask: "கேளுங்கள்",
    knowRights: "உங்கள் உரிமைகளை அறிந்து கொள்ளுங்கள்",
    awareness: "விழிப்புணர்வு",
    vault: "வால்ட்",
  },
  te: {
    title: "న్యాయసహాయక్",
    subtitle: "మీ చట్టపరమైన సహాయకుడు",
    ask: "అడగండి",
    knowRights: "మీ హక్కులను తెలుసుకోండి",
    awareness: "అవగాహన",
    vault: "వాల్ట్",
  },
};

export default function Home({ navigation, route }) {
  const { user } = useAuth();
  const language = route?.params?.language || "en";
  const t = translations[language] || translations.en;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
        {user && <Text style={styles.userText}>{user.email}</Text>}
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate("Chat", { language })}
        >
          <Text style={styles.primaryButtonText}>{t.ask}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("KnowRights", { language })}
        >
          <Text style={styles.buttonText}>{t.knowRights}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Awareness", { language })}
        >
          <Text style={styles.buttonText}>{t.awareness}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Vault", { language })}
        >
          <Text style={styles.buttonText}>{t.vault}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 8,
  },
  userText: {
    fontSize: 14,
    color: "#0EA5E9",
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

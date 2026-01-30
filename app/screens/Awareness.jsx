import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Awareness({ route }) {
  const language = route?.params?.language || "en";
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Legal Awareness</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.text}>
          {language === "en" 
            ? "Stay informed about important legal updates and awareness programs."
            : "महत्वपूर्ण कानूनी अपडेट और जागरूकता कार्यक्रमों के बारे में सूचित रहें।"}
        </Text>
      </ScrollView>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  text: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 24,
  },
});

import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { login as apiLogin } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";


export default function Login({ navigation }) {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const { login, isAuthenticated, loading } = useAuth();

// Redirect if already logged in
useEffect(() => {
  if (!loading && isAuthenticated) {
    navigation.replace("Home");
  }
}, [isAuthenticated, loading, navigation]);


async function handleLogin() {
try {
  const user = await apiLogin(email, password);
  await login(user);
  navigation.replace("Home", { user });
} catch (e) {
  Alert.alert("Login failed", "Invalid credentials or server not reachable.");
}
}


return (
  <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your legal assistant</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        style={styles.input}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.actions}>
        <Button title="Login" onPress={handleLogin} />
      </View>
      <Text style={styles.footerText}>
        New here?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
          Create an account
        </Text>
      </Text>
    </View>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  subtitle: { color: "#475569", marginTop: 4 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: { color: "#0F172A", fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  actions: { marginTop: 4 },
  footerText: { marginTop: 12, color: "#475569", textAlign: "center" },
  link: { color: "#2563EB", fontWeight: "600" },
});
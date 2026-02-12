import { useEffect, useState } from "react";
import { View, Text, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadVaultDocument, listVaultDocuments } from "../services/api";

const BASE_URL = "http://192.168.1.100:3000"; // SAME IP

export default function Vault({ route }) {
  const userId = route?.params?.userId;
  const [docs, setDocs] = useState([]);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!res.canceled) {
      const doc = await uploadVaultDocument({
        userId,
        uri: res.assets[0].uri,
      });

      setDocs(prev => [...prev, doc]);
    }
  }

  async function loadDocs() {
    if (!userId) return;
    const res = await listVaultDocuments(userId);
    setDocs(Array.isArray(res) ? res : []);
  }

  useEffect(() => {
    loadDocs();
  }, [userId]);

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", alignItems: "center" }}>
      <Button title="Upload Document" onPress={pickImage} />

      {docs.length === 0 && (
        <Text style={{ marginTop: 20, textAlign: "center" }}>
          No documents uploaded
        </Text>
      )}

      {docs.map(d => (
        <View key={d.id} style={{ marginTop: 20 }}>
          <Text>{d.name}</Text>
          <Image
            source={{ uri: `${BASE_URL}${d.uri}` }}
            style={{ width: 120, height: 120 }}
          />
        </View>
      ))}
    </View>
  );
}

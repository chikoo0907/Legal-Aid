import { useEffect, useState } from "react";
import { View, Text, Button, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { listVaultDocuments, uploadVaultDocument } from "../services/api";


export default function Vault({ route }) {
const userId = route?.params?.userId;
const [docs, setDocs] = useState([]);


async function pickImage() {
const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.Images });
if (!res.canceled) {
await uploadVaultDocument({
  userId,
  name: "Uploaded Document",
  type: "image",
  uri: res.assets[0].uri,
});
loadDocs();
}
}


async function loadDocs() {
if (!userId) return;
const res = await listVaultDocuments(userId);
setDocs(res);
}


useEffect(() => { loadDocs(); }, [userId]);


return (
<View>
<Button title="Upload Document" onPress={pickImage} />
{docs.map(d => (
<View key={d.id}>
<Text>{d.name}</Text>
<Image source={{ uri: d.uri }} style={{ width: 100, height: 100, resizeMode: "contain", marginTop: 100 }} />
</View>
))}
</View>
);
}
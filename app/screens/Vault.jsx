import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { useAuth } from "../context/AuthContext";
import {
  uploadVaultDocument,
  listVaultDocuments,
  deleteVaultDocument,
  renameVaultDocument,
} from "../services/api";
import { getApiBaseUrl } from "../services/api";

function categorizeDocument(name = "") {
  const lower = name.toLowerCase();
  if (/(aadhaar|aadhar|pan|voter|dl|license|passport|id)/.test(lower)) {
    return "Personal IDs";
  }
  if (/(house|deed|property|land|flat|rent|lease)/.test(lower)) {
    return "Property Docs";
  }
  if (/(court|summons|notice|fir|case|order|petition)/.test(lower)) {
    return "Court Papers";
  }
  return "Other";
}


export default function DocumentVault({ navigation }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All Files");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameCategory, setRenameCategory] = useState("Personal IDs");

  useEffect(() => {
    if (!user?.id) return;
    loadDocuments();
  }, [user?.id]);

  async function loadDocuments() {
    try {
      setLoading(true);
      const docs = await listVaultDocuments(user.id);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error("Failed to load vault documents", error);
      Alert.alert("Error", "Unable to load your documents.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDocument() {
    if (!user?.id) {
      Alert.alert("Login required", "Please login again to use the vault.");
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) return;

      setUploading(true);
      const uploaded = await uploadVaultDocument({
        userId: user.id,
        uri: file.uri,
        name: file.name || "document",
        type: file.mimeType || file.type || "application/octet-stream",
      });

      setDocuments((prev) => [uploaded, ...prev]);
    } catch (error) {
      console.error("Failed to upload vault document", error);
      Alert.alert("Upload failed", "Could not upload the selected document.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDocument(id) {
    Alert.alert("Delete document", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteVaultDocument(id);
            setDocuments((prev) => prev.filter((d) => d.id !== id));
          } catch (error) {
            console.error("Failed to delete vault document", error);
            Alert.alert("Error", "Unable to delete this document.");
          }
        },
      },
    ]);
  }

  async function handleOpenDocument(doc) {
    if (!doc?.url && !doc?.path) {
      Alert.alert("Unavailable", "This document does not have a file path.");
      return;
    }

    try {
      const baseUrl = getApiBaseUrl();
      let urlPath = doc.url || doc.path;

      // Handle old absolute paths like C:\...\uploads\file.jpg
      if (!urlPath.startsWith("/uploads") && urlPath.toLowerCase().includes("uploads")) {
        const parts = urlPath.split(/uploads/i);
        const after = parts[1] || "";
        const cleaned = after.replace(/^[/\\]+/, "");
        urlPath = `/uploads/${cleaned}`;
      }

      // If it is already an absolute http(s) URL, use as-is
      const fullUrl =
        urlPath.startsWith("http://") || urlPath.startsWith("https://")
          ? urlPath
          : `${baseUrl}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;

      navigation.navigate("DocumentViewer", {
        url: fullUrl,
        name: doc.name,
        mime: doc.type,
      });
    } catch (error) {
      console.error("Failed to open document", error);
      Alert.alert("Error", "Unable to open this document.");
    }
  }

  function showFileActions(doc) {
    Alert.alert(doc.name || "Document", "What would you like to do?", [
      {
        text: "View",
        onPress: () => handleOpenDocument(doc),
      },
      {
        text: "Rename / Categorize",
        onPress: () => {
          setRenameId(doc.id);
          setRenameValue(doc.name || "");
          const currentCategory = doc.category || categorizeDocument(doc.name);
          setRenameCategory(currentCategory);
        },
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteDocument(doc.id),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function submitRename() {
    if (!renameId) return;
    const newName = renameValue.trim();
    if (!newName) {
      Alert.alert("Invalid name", "Name cannot be empty.");
      return;
    }

    try {
      const updated = await renameVaultDocument(renameId, newName, renameCategory);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === renameId
            ? { ...d, name: updated.name, category: updated.category || renameCategory }
            : d
        )
      );
      setRenameId(null);
      setRenameValue("");
    } catch (error) {
      console.error("Failed to rename document", error);
      Alert.alert("Error", "Unable to rename this document.");
    }
  }

  const defaultCategories = useMemo(
    () => ["Personal IDs", "Property Docs", "Court Papers", "Other"],
    []
  );

  const normalizedDocuments = useMemo(() => {
    return documents.map((d) => {
      const serverCategory =
        typeof d.category === "string" && d.category.trim()
          ? d.category.trim()
          : null;
      const fallback = categorizeDocument(d.name);
      return {
        ...d,
        effectiveCategory: serverCategory || fallback,
      };
    });
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return normalizedDocuments.filter((doc) => {
      const matchesCategory =
        activeFilter === "All Files" || doc.effectiveCategory === activeFilter;

      const matchesQuery =
        !q ||
        (doc.name || "").toLowerCase().includes(q) ||
        (doc.effectiveCategory || "").toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [normalizedDocuments, activeFilter, searchQuery]);

  const customCategories = useMemo(() => {
    const set = new Set();
    filteredDocuments.forEach((d) => {
      const cat = d.effectiveCategory;
      if (cat && !defaultCategories.includes(cat)) set.add(cat);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filteredDocuments, defaultCategories]);

  const allCategories = useMemo(() => {
    // Default first, then user-created (alphabetical)
    return [...defaultCategories, ...customCategories];
  }, [defaultCategories, customCategories]);

  const categorized = useMemo(() => {
    const groups = new Map();

    filteredDocuments.forEach((doc) => {
      const category = doc.effectiveCategory || "Other";
      const fileMeta = {
        id: doc.id,
        title: doc.name,
        subtitle: `${new Date(doc.createdAt).toLocaleDateString()} • ${formatSize(
          doc.size
        )}`,
        icon: pickIconForDoc(doc),
        color: pickColorForCategory(category),
      };

      const existing = groups.get(category) || [];
      existing.push(fileMeta);
      groups.set(category, existing);
    });

    return groups;
  }, [filteredDocuments]);

  const recentFiles = useMemo(() => {
    return filteredDocuments.slice(0, 5).map((doc) => ({
      id: doc.id,
      title: doc.name,
      subtitle: `${new Date(doc.createdAt).toLocaleDateString()} • ${formatSize(
        doc.size
      )}`,
      icon: pickIconForDoc(doc),
      color: "blue",
      path: doc.path,
      raw: doc,
    }));
  }, [filteredDocuments]);

  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8]">
      {/* Header */}
      <View className="bg-[#f6f6f8]/90 backdrop-blur-md border-b border-slate-200">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-3 my-2 px-2">
            <View className="h-9 w-9 rounded-lg bg-[#1152d4]/10 items-center justify-center">
              <MaterialIcons name="lock" size={20} color="#1152d4" />
            </View>
            <View>
              <Text className="text-lg font-bold text-slate-900">
                Document Vault
              </Text>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="verified" size={12} color="#16a34a" />
                <Text className="text-[10px] font-bold uppercase text-slate-500">
                  Secure Storage
                </Text>
              </View>
            </View>
          </View>

          {searchOpen ? (
            <View className="flex-row items-center bg-white border border-slate-200 rounded-full px-3 py-2 w-44">
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search..."
                placeholderTextColor="#94a3b8"
                className="flex-1 text-slate-900 text-sm"
              />
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
              >
                <MaterialIcons name="close" size={18} color="#64748b" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="h-10 w-10 rounded-full bg-white border border-slate-200 items-center justify-center"
              onPress={() => setSearchOpen(true)}
            >
              <MaterialIcons name="search" size={20} color="#334155" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 pb-3"
        >
          <View className="flex-row gap-2">
            <FilterChip
              label="All Files"
              active={activeFilter === "All Files"}
              onPress={() => setActiveFilter("All Files")}
            />
            {allCategories.map((cat) => (
              <FilterChip
                key={cat}
                label={cat}
                active={activeFilter === cat}
                onPress={() => setActiveFilter(cat)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="px-4">
        {/* Recently Added */}
        <SectionHeader
          title={loading ? "Loading..." : "Recently Added"}
          action={filteredDocuments.length ? "View History" : undefined}
        />

        {!filteredDocuments.length && !loading && (
          <Text className="text-xs text-slate-500 mb-4">
            No documents found. Try changing filters or add a new document using the + button.
          </Text>
        )}

        {recentFiles.map((file) => (
          <FileItem
            key={file.id}
            icon={file.icon}
            color={file.color}
            title={file.title}
            subtitle={file.subtitle}
            // Tapping the row shows options: View / Rename / Delete
            onPress={() => showFileActions(file.raw)}
            onPressMore={() => showFileActions(file.raw)}
          />
        ))}

        {allCategories.map((cat) => {
          if (activeFilter !== "All Files" && activeFilter !== cat) return null;
          const files = categorized.get(cat) || [];
          if (!files.length) return null;
          const header = getCategoryHeader(cat);

          return (
            <CategorySection
              key={cat}
              icon={header.icon}
              color={header.color}
              title={cat}
              files={files}
              onFilePress={(id) => {
                const doc = filteredDocuments.find((d) => d.id === id);
                if (doc) showFileActions(doc);
              }}
              onFileMore={(id) => {
                const doc = filteredDocuments.find((d) => d.id === id);
                if (doc) showFileActions(doc);
              }}
            />
          );
        })}

        <View className="h-32" />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        className="absolute bottom-24 right-6 h-14 w-14 rounded-full bg-[#1152d4] items-center justify-center shadow-lg"
        onPress={handleAddDocument}
        disabled={uploading}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      {renameId && (
        <View className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <View className="w-full bg-white rounded-2xl p-4">
            <Text className="text-base font-bold text-slate-900 mb-2">
              Rename Document
            </Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Enter new name"
              className="border border-slate-300 rounded-lg px-3 py-2 mb-3"
            />
            <Text className="text-xs font-semibold text-slate-500 mb-1">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {["Personal IDs", "Property Docs", "Court Papers", "Other"].map(
                (cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setRenameCategory(cat)}
                  >
                    <View
                      className={`px-3 py-1 rounded-full border ${
                        renameCategory === cat
                          ? "bg-[#1152d4] border-[#1152d4]"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          renameCategory === cat
                            ? "text-white"
                            : "text-slate-700"
                        }`}
                      >
                        {cat}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              )}
            </View>
            <TextInput
              value={renameCategory}
              onChangeText={setRenameCategory}
              placeholder="Or type your own category (e.g. Land Case, School Docs)"
              className="border border-slate-300 rounded-lg px-3 py-2 mb-3 text-xs"
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => {
                  setRenameId(null);
                  setRenameValue("");
                }}
                className="px-4 py-2 rounded-lg border border-slate-300"
              >
                <Text className="text-slate-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const id = renameId;
                  setRenameId(null);
                  setRenameValue("");
                  handleDeleteDocument(id);
                }}
                className="px-4 py-2 rounded-lg bg-red-500"
              >
                <Text className="text-white font-semibold">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitRename}
                className="px-4 py-2 rounded-lg bg-[#1152d4]"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        className={`px-4 py-1.5 rounded-full ${
          active
            ? "bg-[#1152d4]"
            : "bg-white border border-slate-200"
        }`}
      >
        <Text
          className={`text-sm font-semibold ${
            active ? "text-white" : "text-slate-600"
          }`}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title, action }) {
  return (
    <View className="flex-row items-center justify-between mt-6 mb-3">
      <Text className="text-sm font-bold uppercase tracking-wider text-slate-900">
        {title}
      </Text>
      {action && (
        <Text className="text-xs font-semibold text-[#1152d4]">
          {action}
        </Text>
      )}
    </View>
  );
}

function FileItem({ icon, color, title, subtitle, onPress, onPressMore }) {
  const colorMap = {
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between p-3 bg-white border border-slate-200 rounded-xl mb-2"
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-10 w-10 rounded-lg items-center justify-center ${colorMap[color]}`}
        >
          <MaterialIcons name={icon} size={20} />
        </View>
        <View>
          <Text className="text-sm font-bold text-slate-900">
            {title}
          </Text>
          <Text className="text-[11px] text-slate-500">
            {subtitle}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={onPressMore}>
        <MaterialIcons name="more-vert" size={20} color="#64748b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function CategorySection({ icon, color, title, files, onFilePress, onFileMore }) {
  return (
    <View className="mt-6">
      <View className="flex-row items-center gap-2 mb-3">
        <MaterialIcons name={icon} size={18} color={color} />
        <Text className="text-base font-bold text-slate-900">
          {title}
        </Text>
      </View>

      {files.map((file, index) => (
        <FileItem
          key={file.id || index}
          {...file}
          onPress={file.id ? () => onFilePress?.(file.id) : undefined}
          onPressMore={file.id ? () => onFileMore?.(file.id) : undefined}
        />
      ))}
    </View>
  );
}

function pickIconForDoc(doc) {
  const name = (doc?.name || "").toLowerCase();
  const mime = (doc?.type || "").toLowerCase();

  if (mime.includes("pdf") || name.endsWith(".pdf")) return "picture-as-pdf";
  if (mime.includes("image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(name)) {
    return "image";
  }
  if (mime.includes("word") || /\.(doc|docx)$/i.test(name)) return "description";
  if (mime.includes("sheet") || /\.(xls|xlsx|csv)$/i.test(name)) return "table-chart";

  return "insert-drive-file";
}

function pickColorForCategory(category) {
  switch (category) {
    case "Personal IDs":
      return "blue";
    case "Property Docs":
      return "orange";
    case "Court Papers":
      return "purple";
    default:
      return "blue";
  }
}

function getCategoryHeader(category) {
  switch (category) {
    case "Personal IDs":
      return { icon: "badge", color: "#3b82f6" };
    case "Property Docs":
      return { icon: "holiday-village", color: "#f97316" };
    case "Court Papers":
      return { icon: "gavel", color: "#9333ea" };
    case "Other":
      return { icon: "folder", color: "#64748b" };
    default:
      return { icon: "folder", color: "#0f172a" };
  }
}

function formatSize(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return "—";
  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}
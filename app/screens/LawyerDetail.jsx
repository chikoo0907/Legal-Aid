import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { getApiBaseUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LawyerDetail({ navigation, route }) {
  const { lawyer } = route.params || {};
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();

  if (!lawyer) {
    navigation.goBack();
    return null;
  }

  const handleBookAppointment = () => {
    if (!currentUser) {
      Alert.alert("Login Required", "Please login to book an appointment");
      navigation.navigate("Login");
      return;
    }
    navigation.navigate("BookAppointment", { lawyer });
  };

  const handleChat = () => {
    if (!currentUser) {
      Alert.alert("Login Required", "Please login to chat with the lawyer");
      navigation.navigate("Login");
      return;
    }
    navigation.navigate("UserChatWithLawyer", { lawyer });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lawyer Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {lawyer.photoUrl ? (
              <Image
                source={{ uri: `${getApiBaseUrl()}${lawyer.photoUrl}` }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#2563eb" />
              </View>
            )}
          </View>
          <Text style={styles.lawyerName}>{lawyer.user?.name || "Lawyer"}</Text>
          {lawyer.specialization && (
            <Text style={styles.specialization}>{lawyer.specialization}</Text>
          )}
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.verifiedText}>Verified Lawyer</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.bookButton]}
            onPress={handleBookAppointment}
          >
            <Ionicons name="calendar" size={24} color="#FFF" />
            <Text style={styles.bookButtonText}>Book Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.chatButton]}
            onPress={handleChat}
          >
            <Ionicons name="chatbubble" size={24} color="#FFF" />
            <Text style={styles.chatButtonText}>Chat with Lawyer</Text>
          </TouchableOpacity>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          {lawyer.experience && (
            <View style={styles.detailRow}>
              <Ionicons name="briefcase" size={20} color="#2563eb" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Experience</Text>
                <Text style={styles.detailValue}>
                  {lawyer.experience} {lawyer.experience === 1 ? "year" : "years"}
                </Text>
              </View>
            </View>
          )}

          {lawyer.city && lawyer.state && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color="#2563eb" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {lawyer.city}, {lawyer.state}
                  {lawyer.pincode && ` - ${lawyer.pincode}`}
                </Text>
              </View>
            </View>
          )}

          {lawyer.barCouncilNumber && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text" size={20} color="#2563eb" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Bar Council Number</Text>
                <Text style={styles.detailValue}>{lawyer.barCouncilNumber}</Text>
              </View>
            </View>
          )}

          {lawyer.user?.phone && (
            <View style={styles.detailRow}>
              <Ionicons name="call" size={20} color="#2563eb" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{lawyer.user.phone}</Text>
              </View>
            </View>
          )}

          {lawyer.user?.email && (
            <View style={styles.detailRow}>
              <Ionicons name="mail" size={20} color="#2563eb" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{lawyer.user.email}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bio Section */}
        {lawyer.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bioText}>{lawyer.bio}</Text>
          </View>
        )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#FFF",
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  lawyerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  specialization: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 12,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 14,
    color: "#065f46",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: "#FFF",
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  bookButton: {
    backgroundColor: "#2563eb",
  },
  chatButton: {
    backgroundColor: "#0f766e",
  },
  bookButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  chatButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  detailsSection: {
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
  bioSection: {
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 12,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
});

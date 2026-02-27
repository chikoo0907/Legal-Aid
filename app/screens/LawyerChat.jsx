import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getLawyerAppointments } from "../services/api";

export default function LawyerChat({ navigation }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    if (!user?.id || user?.role !== "lawyer" || !user?.lawyer?.id) {
      setLoading(false);
      console.warn("LawyerChat opened for non-lawyer user or missing lawyer profile");
      return;
    }

    try {
      setLoading(true);

      const lawyerId = user.lawyer.id;

      // Get all appointments to show users the lawyer can chat with
      const [pending, completed] = await Promise.all([
        getLawyerAppointments(lawyerId, "pending"),
        getLawyerAppointments(lawyerId, "completed"),
      ]);
      
      const allAppointments = [...(pending || []), ...(completed || [])];
      
      // Get unique users
      const uniqueUsers = [];
      const userIds = new Set();
      
      allAppointments.forEach((appt) => {
        if (appt.user && !userIds.has(appt.user.id)) {
          userIds.add(appt.user.id);
          uniqueUsers.push({
            userId: appt.user.id,
            userName: appt.user.name || "User",
            userEmail: appt.user.email,
            userPhone: appt.user.phone,
            appointmentId: appt.id,
            status: appt.status,
          });
        }
      });

      setAppointments(uniqueUsers);
    } catch (error) {
      console.error("Error loading appointments:", error);
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithUser = (userData) => {
    // Navigate to dedicated lawyer-user conversation screen (no AI)
    navigation.navigate("LawyerConversation", {
      user: userData,
      lawyerId: user?.lawyer?.id,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat with Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Users List */}
      <ScrollView style={styles.scrollView}>
        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No users to chat with</Text>
            <Text style={styles.emptySubtext}>
              Users who have appointments with you will appear here
            </Text>
          </View>
        ) : (
          appointments.map((userData, index) => (
            <TouchableOpacity
              key={userData.userId}
              style={styles.userCard}
              onPress={() => handleChatWithUser(userData)}
            >
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={24} color="#2563eb" />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{userData.userName}</Text>
                  <Text style={styles.userEmail}>{userData.userEmail}</Text>
                  {userData.userPhone && (
                    <Text style={styles.userPhone}>{userData.userPhone}</Text>
                  )}
                </View>
              </View>
              <View style={styles.chatButton}>
                <Ionicons name="chatbubble" size={20} color="#0f766e" />
              </View>
            </TouchableOpacity>
          ))
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
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#CBD5E1",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  userCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  userEmail: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
});

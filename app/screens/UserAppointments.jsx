import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getUserAppointments } from "../services/api";

export default function UserAppointments({ navigation }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all"); // "all", "pending", "completed"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [filter, user]);

  const loadAppointments = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let data = [];
      
      if (filter === "all") {
        const [pending, completed] = await Promise.all([
          getUserAppointments(user.id, "pending"),
          getUserAppointments(user.id, "completed"),
        ]);
        data = [...(pending || []), ...(completed || [])];
      } else {
        data = await getUserAppointments(user.id, filter);
      }

      // Sort by appointment date
      data.sort((a, b) => {
        if (a.appointmentDate && b.appointmentDate) {
          return new Date(a.appointmentDate) - new Date(b.appointmentDate);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setAppointments(data || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      Alert.alert("Error", "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2563eb" />
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
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "pending" && styles.filterTabActive]}
          onPress={() => setFilter("pending")}
        >
          <Text style={[styles.filterText, filter === "pending" && styles.filterTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "completed" && styles.filterTabActive]}
          onPress={() => setFilter("completed")}
        >
          <Text style={[styles.filterText, filter === "completed" && styles.filterTextActive]}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <ScrollView style={styles.scrollView}>
        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No appointments found</Text>
            <TouchableOpacity
              style={styles.findLawyerButton}
              onPress={() => navigation.navigate("Lawyers")}
            >
              <Text style={styles.findLawyerButtonText}>Find a Lawyer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.lawyerInfo}>
                  <View style={styles.avatar}>
                    <Ionicons name="briefcase" size={20} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.lawyerName}>
                      {appointment.lawyer?.user?.name || "Lawyer"}
                    </Text>
                    {appointment.lawyer?.specialization && (
                      <Text style={styles.specialization}>
                        {appointment.lawyer.specialization}
                      </Text>
                    )}
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    appointment.status === "pending" && styles.statusBadgePending,
                    appointment.status === "completed" && styles.statusBadgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      appointment.status === "pending" && styles.statusTextPending,
                      appointment.status === "completed" && styles.statusTextCompleted,
                    ]}
                  >
                    {appointment.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#64748B" />
                  <Text style={styles.detailText}>
                    {formatDate(appointment.appointmentDate)}
                  </Text>
                </View>
                {appointment.reason && (
                  <View style={styles.detailRow}>
                    <Ionicons name="document-text" size={16} color="#64748B" />
                    <Text style={styles.detailText}>{appointment.reason}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => {
                  if (appointment.lawyer) {
                    navigation.navigate("UserChatWithLawyer", {
                      lawyer: appointment.lawyer,
                    });
                  }
                }}
              >
                <Ionicons name="chatbubble" size={16} color="#2563eb" />
                <Text style={styles.chatButtonText}>Chat with Lawyer</Text>
              </TouchableOpacity>
            </View>
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  filterTabActive: {
    backgroundColor: "#2563eb",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  filterTextActive: {
    color: "#FFF",
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
    marginBottom: 24,
  },
  findLawyerButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findLawyerButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  appointmentCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  lawyerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  specialization: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  statusBadgePending: {
    backgroundColor: "#FEF3C7",
  },
  statusBadgeCompleted: {
    backgroundColor: "#D1FAE5",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  statusTextPending: {
    color: "#D97706",
  },
  statusTextCompleted: {
    color: "#059669",
  },
  appointmentDetails: {
    marginTop: 8,
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#475569",
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    gap: 6,
    marginTop: 8,
  },
  chatButtonText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
});

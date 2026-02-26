import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Platform, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { createAppointment, checkAppointmentSlot } from "../services/api";

export default function BookAppointment({ navigation, route }) {
  const { lawyer } = route.params || {};
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!lawyer) {
    navigation.goBack();
    return null;
  }

  const handleDateChange = (days) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    newDate.setHours(12, 0, 0, 0); // Default to 12 PM
    setAppointmentDate(newDate);
  };

  const handleTimeChange = (hours, minutes) => {
    const newDate = new Date(appointmentDate);
    newDate.setHours(hours, minutes, 0, 0);
    setAppointmentDate(newDate);
    setShowTimePicker(false);
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const handleBookAppointment = async () => {
    if (!reason.trim()) {
      Alert.alert("Required", "Please provide a reason for the appointment");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to book an appointment");
      navigation.navigate("Login");
      return;
    }

    try {
      setLoading(true);

      // Check if slot is available before booking
      const slotCheck = await checkAppointmentSlot(
        lawyer.id,
        appointmentDate.toISOString()
      );
      if (!slotCheck.available) {
        Alert.alert(
          "Slot Not Available",
          slotCheck.message ||
            "This time slot is already booked. Please select another date or time."
        );
        setLoading(false);
        return;
      }

      await createAppointment({
        lawyerId: lawyer.id,
        userId: user.id,
        appointmentDate: appointmentDate.toISOString(),
        reason: reason.trim(),
      });

      Alert.alert(
        "Success",
        "Your appointment has been booked successfully! The lawyer will be notified.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Error booking appointment:", error);
      const errMsg =
        error.response?.data?.error ||
        "Failed to book appointment. Please try again.";
      Alert.alert(
        "Error",
        errMsg.includes("already booked")
          ? "This time slot is already booked. Please select another date or time."
          : errMsg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Lawyer Info */}
        <View style={styles.lawyerInfoCard}>
          <Text style={styles.lawyerName}>{lawyer.user?.name || "Lawyer"}</Text>
          {lawyer.specialization && (
            <Text style={styles.specialization}>{lawyer.specialization}</Text>
          )}
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <View style={styles.dateOptions}>
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateChange(0)}
            >
              <Text style={styles.dateOptionText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateChange(1)}
            >
              <Text style={styles.dateOptionText}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateOption}
              onPress={() => handleDateChange(2)}
            >
              <Text style={styles.dateOptionText}>Day After</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.selectedDate}>
            Selected: {appointmentDate.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={20} color="#2563eb" />
            <Text style={styles.dateText}>
              {appointmentDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Ionicons name="close" size={24} color="#0f172a" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.timeSlotsContainer}>
                {getTimeSlots().map((slot) => {
                  const [hours, minutes] = slot.split(":").map(Number);
                  const isSelected =
                    appointmentDate.getHours() === hours &&
                    appointmentDate.getMinutes() === minutes;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.timeSlot,
                        isSelected && styles.timeSlotSelected,
                      ]}
                      onPress={() => handleTimeChange(hours, minutes)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          isSelected && styles.timeSlotTextSelected,
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Reason Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Appointment *</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Describe the reason for your appointment..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleBookAppointment}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Booking..." : "Book Appointment"}
          </Text>
        </TouchableOpacity>
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
  lawyerInfoCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  lawyerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
  reasonInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#0f172a",
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  dateOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  dateOption: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  dateOptionText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
  },
  selectedDate: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  timeSlotsContainer: {
    padding: 16,
  },
  timeSlot: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  timeSlotSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  timeSlotText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
  timeSlotTextSelected: {
    color: "#FFF",
  },
});

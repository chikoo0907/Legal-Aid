import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getLawyerByUserId } from "../services/api";

export default function LawyerPendingVerification({ navigation }) {
  const { user, setUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  // Check verification status periodically
  useEffect(() => {
    const checkVerification = async () => {
      if (!user?.id || user?.role !== "lawyer") return;

      try {
        setChecking(true);
        const lawyer = await getLawyerByUserId(user.id);
        
        if (lawyer?.isVerified) {
          // Update user object with verified status
          setUser({
            ...user,
            lawyer: {
              id: lawyer.id,
              isVerified: true,
            },
          });
          // Navigate to LawyerHome
          navigation.replace("LawyerHome");
        } else {
          setLastChecked(new Date());
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      } finally {
        setChecking(false);
      }
    };

    // Check immediately
    checkVerification();

    // Check every 30 seconds
    const interval = setInterval(checkVerification, 30000);

    return () => clearInterval(interval);
  }, [user, navigation, setUser]);

  const handleManualCheck = async () => {
    if (!user?.id) return;

    try {
      setChecking(true);
      const lawyer = await getLawyerByUserId(user.id);
      
      if (lawyer?.isVerified) {
        setUser({
          ...user,
          lawyer: {
            id: lawyer.id,
            isVerified: true,
          },
        });
        navigation.replace("LawyerHome");
      } else {
        setLastChecked(new Date());
        alert("Your account is still pending verification. Please wait for admin approval.");
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      alert("Error checking verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="hourglass-outline" size={80} color="#F59E0B" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verification Pending</Text>

        {/* Message */}
        <Text style={styles.message}>
          Your lawyer account is currently under review by our admin team.
        </Text>

        <Text style={styles.subMessage}>
          We are verifying your Bar Council registration and documents. This process usually takes 24-48 hours.
        </Text>

        {/* Status Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#2563eb" />
          <Text style={styles.infoText}>
            You will be automatically redirected to your lawyer dashboard once your account is verified.
          </Text>
        </View>

        {/* Last Checked */}
        <Text style={styles.lastChecked}>
          Last checked: {lastChecked.toLocaleTimeString()}
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.checkButton]}
            onPress={handleManualCheck}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Check Status</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#64748B" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Auto-check indicator */}
      {checking && (
        <View style={styles.checkingIndicator}>
          <ActivityIndicator size="small" color="#2563eb" />
          <Text style={styles.checkingText}>Checking verification status...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 50,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#475569",
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  subMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    marginLeft: 8,
    lineHeight: 18,
  },
  lastChecked: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  checkButton: {
    backgroundColor: "#2563eb",
  },
  logoutButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButtonText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  checkingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#EFF6FF",
    gap: 8,
  },
  checkingText: {
    fontSize: 12,
    color: "#2563eb",
  },
});

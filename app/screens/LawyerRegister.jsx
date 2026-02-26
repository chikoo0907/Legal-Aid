import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { registerLawyer } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function LawyerRegister({ navigation, route }) {
  const { email, password, name, phone } = route.params || {};
  
  const [barCouncilNumber, setBarCouncilNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  
  const [barCouncilCert, setBarCouncilCert] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [photo, setPhoto] = useState(null);
  
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { t } = useTranslation();

  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("permissionDenied") || "Permission Denied", t("needPhotoPermission") || "We need camera roll permissions to upload documents");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (type === "barCouncil") {
        setBarCouncilCert(asset);
      } else if (type === "idProof") {
        setIdProof(asset);
      } else if (type === "photo") {
        setPhoto(asset);
      }
    }
  };

  async function handleRegister() {
    if (!barCouncilNumber.trim()) {
      Alert.alert(t("error") || "Error", t("barCouncilRequired") || "Bar Council Number is required");
      return;
    }

    if (!barCouncilCert || !idProof || !photo) {
      Alert.alert(t("error") || "Error", t("allDocumentsRequired") || "Please upload all required documents");
      return;
    }

    setLoading(true);
    try {
      const lawyerData = {
        email,
        password,
        name,
        phone,
        barCouncilNumber,
        specialization: specialization || null,
        experience: experience ? parseInt(experience) : null,
        bio: bio || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        barCouncilCertificate: barCouncilCert,
        idProof: idProof,
        photo: photo,
      };

      const user = await registerLawyer(lawyerData);
      await login(user);

      Alert.alert(
        t("registrationSubmitted") || "Registration Submitted",
        t("lawyerVerificationPending") ||
          "Your registration has been submitted. Your account will be activated after verification.",
        [
          {
            text: t("ok") || "OK",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: "LawyerPendingVerification" }],
              }),
          },
        ]
      );
    } catch (e) {
      console.error("Registration error:", e);
      const errorMessage = e.message || e.response?.data?.error || t("unableToCreateAccount") || "Unable to create account";
      Alert.alert(
        t("registrationFailed") || "Registration Failed", 
        errorMessage,
        [{ text: t("ok") || "OK" }]
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="px-6 pt-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-amber-600 rounded-2xl items-center justify-center mb-6">
              <Ionicons name="briefcase" size={36} color="white" />
            </View>
            <Text className="text-3xl font-bold text-slate-900 text-center">
              {t("lawyerRegistration") || "Lawyer Registration"}
            </Text>
            <Text className="text-slate-500 mt-2 text-center">
              {t("completeVerification") || "Complete your profile and upload verification documents"}
            </Text>
          </View>

          {/* Bar Council Number */}
          <View className="mt-4">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("barCouncilNumber") || "BAR COUNCIL NUMBER"} *
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
              <Ionicons name="document-text-outline" size={18} color="#94a3b8" />
              <TextInput
                value={barCouncilNumber}
                onChangeText={setBarCouncilNumber}
                placeholder={t("enterBarCouncilNumber") || "Enter Bar Council Registration Number"}
                className="flex-1 ml-3 text-slate-900"
              />
            </View>
          </View>

          {/* Specialization */}
          <View className="mt-4">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("specialization") || "SPECIALIZATION"}
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
              <Ionicons name="school-outline" size={18} color="#94a3b8" />
              <TextInput
                value={specialization}
                onChangeText={setSpecialization}
                placeholder={t("enterSpecialization") || "e.g., Criminal Law, Corporate Law"}
                className="flex-1 ml-3 text-slate-900"
              />
            </View>
          </View>

          {/* Experience */}
          <View className="mt-4">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("yearsOfExperience") || "YEARS OF EXPERIENCE"}
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
              <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
              <TextInput
                value={experience}
                onChangeText={setExperience}
                keyboardType="numeric"
                placeholder={t("enterExperience") || "Enter years of experience"}
                className="flex-1 ml-3 text-slate-900"
              />
            </View>
          </View>

          {/* Bio */}
          <View className="mt-4">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("bio") || "BIO"}
            </Text>
            <View className="bg-white border border-slate-200 rounded-xl px-4 py-4">
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder={t("enterBio") || "Tell us about yourself"}
                multiline
                numberOfLines={4}
                className="text-slate-900"
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Address */}
          <View className="mt-4">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("address") || "ADDRESS"}
            </Text>
            <View className="bg-white border border-slate-200 rounded-xl px-4 py-4">
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder={t("enterAddress") || "Enter your address"}
                multiline
                numberOfLines={2}
                className="text-slate-900"
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* City, State, Pincode */}
          <View className="flex-row mt-4 gap-3">
            <View className="flex-1">
              <Text className="text-xs font-semibold text-slate-500 mb-2">
                {t("city") || "CITY"}
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder={t("city") || "City"}
                  className="flex-1 text-slate-900"
                />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-slate-500 mb-2">
                {t("state") || "STATE"}
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
                <TextInput
                  value={state}
                  onChangeText={setState}
                  placeholder={t("state") || "State"}
                  className="flex-1 text-slate-900"
                />
              </View>
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-xs font-semibold text-slate-500 mb-2">
              {t("pincode") || "PINCODE"}
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-4">
              <TextInput
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
                placeholder={t("enterPincode") || "Enter pincode"}
                className="flex-1 text-slate-900"
              />
            </View>
          </View>

          {/* Document Uploads */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-slate-900 mb-4">
              {t("verificationDocuments") || "Verification Documents"} *
            </Text>

            {/* Bar Council Certificate */}
            <View className="mt-4">
              <Text className="text-xs font-semibold text-slate-500 mb-2">
                {t("barCouncilCertificate") || "BAR COUNCIL CERTIFICATE"} *
              </Text>
              <TouchableOpacity
                onPress={() => pickImage("barCouncil")}
                className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 items-center"
              >
                {barCouncilCert ? (
                  <>
                    <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                    <Text className="text-green-600 font-semibold mt-2">
                      {t("documentUploaded") || "Document Uploaded"}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="document-attach-outline" size={48} color="#94a3b8" />
                    <Text className="text-slate-600 font-semibold mt-2">
                      {t("uploadBarCouncilCert") || "Upload Bar Council Certificate"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ID Proof */}
            <View className="mt-4">
              <Text className="text-xs font-semibold text-slate-500 mb-2">
                {t("idProof") || "ID PROOF (Aadhar/PAN)"} *
              </Text>
              <TouchableOpacity
                onPress={() => pickImage("idProof")}
                className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 items-center"
              >
                {idProof ? (
                  <>
                    <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                    <Text className="text-green-600 font-semibold mt-2">
                      {t("documentUploaded") || "Document Uploaded"}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="id-card-outline" size={48} color="#94a3b8" />
                    <Text className="text-slate-600 font-semibold mt-2">
                      {t("uploadIdProof") || "Upload ID Proof"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Photo */}
            <View className="mt-4">
              <Text className="text-xs font-semibold text-slate-500 mb-2">
                {t("profilePhoto") || "PROFILE PHOTO"} *
              </Text>
              <TouchableOpacity
                onPress={() => pickImage("photo")}
                className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-6 items-center"
              >
                {photo ? (
                  <>
                    <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                    <Text className="text-green-600 font-semibold mt-2">
                      {t("photoUploaded") || "Photo Uploaded"}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={48} color="#94a3b8" />
                    <Text className="text-slate-600 font-semibold mt-2">
                      {t("uploadPhoto") || "Upload Profile Photo"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className="bg-amber-600 rounded-xl py-4 mt-8 items-center"
          >
            <Text className="text-white font-bold text-base">
              {loading ? (t("submitting") || "Submitting...") : (t("submitForVerification") || "Submit for Verification")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

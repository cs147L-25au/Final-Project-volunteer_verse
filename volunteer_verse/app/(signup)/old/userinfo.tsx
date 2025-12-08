// STEP 4 (Volunteer): Personal Details
// Navigates to: Volunteer Dashboard (/homepage)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

export default function UserInfo() {
  const router = useRouter();
  const { interests: interestsParam } = useLocalSearchParams<{
    interests?: string;
  }>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");

  const canContinue = Boolean(
    firstName.trim() && lastName.trim() && location.trim()
  );

  const handleNext = () => {
    if (!canContinue) return;
    router.push({
      pathname: "/accountinfo",
      params: {
        role: "volunteer",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        location: location.trim(),
        interests: interestsParam || "",
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Tell us a bit about yourself</Text>
        <View style={styles.fieldGroup}>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="City / Region"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
        </View>

        {!canContinue && (
          <Text style={styles.hint}>
            Please fill out your first name, last name, and location to proceed
          </Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {canContinue && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleNext}
          style={styles.nextButton}
          activeOpacity={0.9}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    marginTop: "30%",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  fieldGroup: {
    gap: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: TEXT_PRIMARY,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  labelRow: {
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "600",
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 10,
    paddingHorizontal: 2,
  },
  nextButton: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 16,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

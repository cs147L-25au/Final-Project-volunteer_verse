// STEP 2: Email & Password
// Navigates to: New Volunteer OR New Organization (based on role param)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

export default function AccountInfo() {
  const router = useRouter();
  // Get the role passed from usertype.tsx
  const { role } = useLocalSearchParams<{ role: string }>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const showConfirm = password.length > 0;
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const canContinue = Boolean(email.trim() && password && passwordsMatch);

  const handleNext = () => {
    if (!canContinue) return;

    // Route based on role passed from previous screen
    if (role === "volunteer") {
      router.push("/newvolunteer");
    } else {
      router.push("/neworganization");
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          accessibilityRole="button"
          onPress={goBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create your account</Text>
        <View style={styles.fieldGroup}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            secureTextEntry
            style={styles.input}
          />

          {showConfirm && (
            <>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm password"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                secureTextEntry
                style={styles.input}
              />
              {confirm.length > 0 && password !== confirm && (
                <Text style={styles.hint}>
                  Passwords must match to continue
                </Text>
              )}
            </>
          )}
        </View>

        {!canContinue && (
          <Text style={styles.hint}>
            Please fill out all of the information to proceed
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
    paddingTop: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginTop: "10%",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: "700",
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
  hint: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 8,
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

// STEP 2: Email & Password
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

export default function AccountInfo() {
  const router = useRouter();
  // Params from usertype.tsx (role + optional next)
  const {
    role,
    next,
    firstName: firstNameParam,
    lastName: lastNameParam,
    location: locationParam,
    interests: interestsParam,
  } = useLocalSearchParams<{
    role?: string;
    next?: string;
    firstName?: string;
    lastName?: string;
    location?: string;
    interests?: string;
  }>();
  const isOrg = next === "neworganization" || role === "organization";
  const destination = isOrg ? "/neworganization" : "/(user-flow)";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showConfirm = password.length > 0;
  const emailValid = email.trim().length >= 6;
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const canContinue = Boolean(emailValid && password && passwordsMatch);

  const handleNext = async () => {
    if (!canContinue || submitting) return;
    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      const userId = data?.user?.id;
      if (!userId) {
        throw new Error("Account created, but no user ID was returned.");
      }

      // Update user_info_ with the chosen role
      const { data: existingUserInfo, error: fetchUserInfoError } =
        await supabase
          .from("user_info_")
          .select("id")
          .eq("user_auth_id", userId)
          .limit(1);

      if (fetchUserInfoError) {
        throw fetchUserInfoError;
      }

      if (existingUserInfo && existingUserInfo.length > 0) {
        const { error: updateUserInfoError } = await supabase
          .from("user_info_")
          .update({ org_bool: isOrg })
          .eq("id", existingUserInfo[0].id);

        if (updateUserInfoError) {
          throw updateUserInfoError;
        }
      } else {
        const { error: insertUserInfoError } = await supabase
          .from("user_info_")
          .insert([{ user_auth_id: userId, org_bool: isOrg }]);

        if (insertUserInfoError) {
          throw insertUserInfoError;
        }
      }

      // If organization, ensure Org_info exists for this user
      if (isOrg) {
        const { data: existingOrg, error: fetchOrgError } = await supabase
          .from("Org_info")
          .select("id")
          .eq("User_id", userId)
          .limit(1);

        if (fetchOrgError) {
          throw fetchOrgError;
        }

        if (existingOrg && existingOrg.length > 0) {
          const { error: updateOrgError } = await supabase
            .from("Org_info")
            .update({ org_name: "Organization" })
            .eq("id", existingOrg[0].id);

          if (updateOrgError) {
            throw updateOrgError;
          }
        } else {
          const { error: insertOrgError } = await supabase
            .from("Org_info")
            .insert([{ User_id: userId, org_name: "Organization" }]);

          if (insertOrgError) {
            throw insertOrgError;
          }
        }
      } else {
        // Volunteer: upsert val_info_ with name fields
        const { data: existingVal, error: fetchValError } = await supabase
          .from("val_info_")
          .select("id")
          .eq("User_id", userId)
          .limit(1);
        if (fetchValError) throw fetchValError;

        const selectedAreas = (interestsParam as string | undefined)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean);

        const valPayload = {
          User_id: userId,
          "First Name": (firstNameParam as string | undefined)?.trim() || null,
          "Last Name": (lastNameParam as string | undefined)?.trim() || null,
          location: (locationParam as string | undefined)?.trim() || null,
          Environment: selectedAreas?.includes("environment") ?? false,
          Health: selectedAreas?.includes("health") ?? false,
          Education: selectedAreas?.includes("education") ?? false,
          Animals: selectedAreas?.includes("animals") ?? false,
          Outreach: selectedAreas?.includes("community") ?? false,
          Marginalized_group: selectedAreas?.includes("marginalized") ?? false,
        };

        if (existingVal && existingVal.length > 0) {
          const { error: updateValError } = await supabase
            .from("val_info_")
            .update(valPayload)
            .eq("id", existingVal[0].id);
          if (updateValError) throw updateValError;
        } else {
          const { error: insertValError } = await supabase
            .from("val_info_")
            .insert([valPayload]);
          if (insertValError) throw insertValError;
        }
      }

      Alert.alert(
        "Account created",
        "Check your email for a confirmation link, then continue."
      );
      router.replace(destination);
    } catch (err) {
      console.error("Signup failed", err);
      Alert.alert(
        "Signup failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setSubmitting(false);
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
            Please fill out all of the information (email must be at least 6
            characters)
          </Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {canContinue && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleNext}
          style={[styles.nextButton, submitting && { opacity: 0.7 }]}
          activeOpacity={0.9}
        >
          <Text style={styles.nextText}>
            {submitting ? "Creating account..." : "Create account"}
          </Text>
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

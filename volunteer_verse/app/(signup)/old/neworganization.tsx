// STEP 3 (Organization): Org Details
// Navigates to: Org Dashboard (/orgdashboard)
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
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

export default function NewOrganization() {
  const router = useRouter();

  const [orgName, setOrgName] = useState("");
  const [city, setCity] = useState("");
  const [mission, setMission] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canContinue = Boolean(orgName.trim() && city.trim() && mission.trim());

  const handleNext = async () => {
    if (!canContinue || submitting) return;

    setSubmitting(true);
    const payload = {
      org_name: orgName.trim(),
      mission_statement: mission.trim(),
      location: city.trim(),
    };

    try {
      // Require an active session (avoids AuthSessionMissingError)
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const userId = sessionData.session?.user?.id;
      if (!userId) {
        Alert.alert(
          "Please log in",
          "We need you to be signed in before saving your organization. After logging in, we'll bring you back here."
        );
        router.replace({
          pathname: "/(user-flow)",
          params: { next: "neworganization" },
        });
        return;
      }

      // Ensure the user_info_ table marks this account as an organization
      const { data: userInfo, error: fetchUserInfoError } = await supabase
        .from("user_info_")
        .select("id")
        .eq("user_auth_id", userId)
        .limit(1);

      if (fetchUserInfoError) {
        throw fetchUserInfoError;
      }

      if (userInfo && userInfo.length > 0) {
        const { error: updateUserInfoError } = await supabase
          .from("user_info_")
          .update({ org_bool: true })
          .eq("id", userInfo[0].id);

        if (updateUserInfoError) {
          throw updateUserInfoError;
        }
      } else {
        const { error: insertUserInfoError } = await supabase
          .from("user_info_")
          .insert([{ user_auth_id: userId, org_bool: true }]);

        if (insertUserInfoError) {
          throw insertUserInfoError;
        }
      }

      const { data: existing, error: fetchError } = await supabase
        .from("Org_info")
        .select("id")
        .eq("User_id", userId)
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      if (existing && existing.length > 0) {
        const { error: updateError } = await supabase
          .from("Org_info")
          .update(payload)
          .eq("id", existing[0].id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("Org_info")
          .insert([{ ...payload, User_id: userId }]);

        if (insertError) {
          throw insertError;
        }
      }

      Alert.alert(
        "Organization saved",
        "Your organization info has been saved. Opening dashboard..."
      );
      router.replace("/orgdashboard");
    } catch (err) {
      console.error("Failed to save organization info", err);
      Alert.alert(
        "Unable to save",
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
        <TouchableOpacity
          accessibilityRole="button"
          onPress={goBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Tell us about your organization</Text>
        <View style={styles.fieldGroup}>
          <TextInput
            value={orgName}
            onChangeText={setOrgName}
            placeholder="Organization name"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
          <TextInput
            value={mission}
            onChangeText={setMission}
            placeholder="Mission statement"
            placeholderTextColor="#9CA3AF"
            multiline
            style={[styles.input, styles.multiline]}
          />
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
          style={[styles.nextButton, submitting && { opacity: 0.7 }]}
          activeOpacity={0.9}
        >
          <Text style={styles.nextText}>
            {submitting ? "Saving..." : "Next"}
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
    paddingTop: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    paddingTop: 20,
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
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
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

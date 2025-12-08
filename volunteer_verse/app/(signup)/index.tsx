import React, { useMemo, useState } from "react";
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
import { useHeaderHeight } from "@react-navigation/elements";
import { supabase } from "@/utils/supabase";

type Role = "volunteer" | "organization" | null;
type AreaKey =
  | "environment"
  | "education"
  | "health"
  | "animals"
  | "community"
  | "marginalized";

const AREAS: { key: AreaKey; label: string; color: string }[] = [
  { key: "environment", label: "Environment", color: "#22C55E" },
  { key: "education", label: "Education", color: "#F59E0B" },
  { key: "health", label: "Health", color: "#EF4444" },
  { key: "animals", label: "Animals", color: "#0D9488" },
  { key: "community", label: "Community Outreach", color: "#8B5CF6" },
  { key: "marginalized", label: "Marginalized Groups", color: "#F472B6" },
];

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

// helpers
const hexToRgba = (hex: string, alpha = 0.16) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function Signup() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  // role
  const [role, setRole] = useState<Role>(null);

  // shared account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // areas
  const [selectedAreas, setSelectedAreas] = useState<AreaKey[]>([]);
  const allKeys = useMemo(() => AREAS.map((a) => a.key), []);

  // volunteer fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vLocation, setVLocation] = useState("");

  // organization fields
  const [orgName, setOrgName] = useState("");
  const [orgLocation, setOrgLocation] = useState("");
  const [mission, setMission] = useState("");
  const [orgSize, setOrgSize] = useState(""); // text like "10–30", "100+"
  const [website, setWebsite] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // validation
  const showConfirm = password.length > 0;
  const emailValid = email.trim().length >= 6 && email.includes("@");
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const hasAreas = selectedAreas.length > 0;

  const volunteerValid = Boolean(
    firstName.trim() && lastName.trim() && vLocation.trim()
  );

  const orgValid = Boolean(
    orgName.trim() &&
      orgLocation.trim() &&
      mission.trim() &&
      orgSize.trim() &&
      website.trim()
  );

  const canSubmit =
    !!role &&
    emailValid &&
    !!password &&
    passwordsMatch &&
    hasAreas &&
    (role === "volunteer" ? volunteerValid : orgValid);

  // area toggles
  const toggleArea = (key: AreaKey) => {
    setSelectedAreas((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };
  const selectAll = () => setSelectedAreas(allKeys);
  const selectNone = () => setSelectedAreas([]);

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      const userId = data?.user?.id;
      if (!userId)
        throw new Error("Account created, but no user ID was returned.");

      const isOrg = role === "organization";

      // Upsert role in user_info_
      {
        const { data: existingUserInfo, error: fetchUserInfoError } =
          await supabase
            .from("user_info_")
            .select("id")
            .eq("user_auth_id", userId)
            .limit(1);
        if (fetchUserInfoError) throw fetchUserInfoError;

        if (existingUserInfo && existingUserInfo.length > 0) {
          const { error: updateUserInfoError } = await supabase
            .from("user_info_")
            .update({ org_bool: isOrg })
            .eq("id", existingUserInfo[0].id);
          if (updateUserInfoError) throw updateUserInfoError;
        } else {
          const { error: insertUserInfoError } = await supabase
            .from("user_info_")
            .insert([{ user_auth_id: userId, org_bool: isOrg }]);
          if (insertUserInfoError) throw insertUserInfoError;
        }
      }

      // Map areas -> boolean columns used by both tables
      const areaFlags = {
        Environment: selectedAreas.includes("environment"),
        Health: selectedAreas.includes("health"),
        Education: selectedAreas.includes("education"),
        Animals: selectedAreas.includes("animals"),
        Outreach: selectedAreas.includes("community"),
        Marginalized_group: selectedAreas.includes("marginalized"),
      };

      if (isOrg) {
        // Upsert into Org_info
        const payload = {
          User_id: userId,
          org_name: orgName.trim(),
          mission_statement: mission.trim(),
          location: orgLocation.trim(),
          org_size: orgSize.trim(),
          website_url: website.trim(),
          ...areaFlags,
        };

        const { data: existing, error: fetchError } = await supabase
          .from("Org_info")
          .select("id")
          .eq("User_id", userId)
          .limit(1);
        if (fetchError) throw fetchError;

        if (existing && existing.length > 0) {
          const { error: updateError } = await supabase
            .from("Org_info")
            .update(payload)
            .eq("id", existing[0].id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("Org_info")
            .insert([payload]);
          if (insertError) throw insertError;
        }

        Alert.alert(
          "Account created",
          "Check your email to confirm your account."
        );
        router.replace("/(organization)/orgdashboard");
      } else {
        // Upsert into val_info_
        const payload = {
          User_id: userId,
          "First Name": firstName.trim(),
          "Last Name": lastName.trim(),
          location: vLocation.trim(),
          image_url: null,
          ...areaFlags,
        };

        const { data: existingVal, error: fetchValError } = await supabase
          .from("val_info_")
          .select("id")
          .eq("User_id", userId)
          .limit(1);
        if (fetchValError) throw fetchValError;

        if (existingVal && existingVal.length > 0) {
          const { error: updateValError } = await supabase
            .from("val_info_")
            .update(payload)
            .eq("id", existingVal[0].id);
          if (updateValError) throw updateValError;
        } else {
          const { error: insertValError } = await supabase
            .from("val_info_")
            .insert([payload]);
          if (insertValError) throw insertValError;
        }

        Alert.alert(
          "Account created",
          "Check your email to confirm your account."
        );
        router.replace("/(volunteer)/homepage");
      }
    } catch (err: any) {
      Alert.alert("Signup failed", err.message ?? "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Sign up</Text>
        {/* Step 1: role */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>I am a...</Text>
          <View style={{ gap: 10 }}>
            <RadioOption
              label="Volunteer"
              selected={role === "volunteer"}
              onPress={() => setRole("volunteer")}
            />
            <RadioOption
              label="Organization"
              selected={role === "organization"}
              onPress={() => setRole("organization")}
            />
          </View>
        </View>

        {/* Step 2: account */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Account</Text>
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

        {/* Step 3: areas */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            {role === "organization" ? "Organization areas" : "Interests"}
          </Text>

          {!hasAreas && (
            <Text style={[styles.hint, { marginBottom: 6 }]}>
              Select at least one area to continue
            </Text>
          )}

          <View style={styles.grid}>
            {AREAS.map((area) => {
              const isSelected = selectedAreas.includes(area.key);
              return (
                <TouchableOpacity
                  key={area.key}
                  activeOpacity={0.9}
                  onPress={() => toggleArea(area.key)}
                  style={[
                    styles.chip,
                    isSelected && {
                      backgroundColor: hexToRgba(area.color),
                      borderColor: area.color,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: area.color },
                      !isSelected && { opacity: 0.35 },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      isSelected && { color: TEXT_PRIMARY },
                    ]}
                  >
                    {area.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={selectAll} activeOpacity={0.7}>
              <Text style={styles.actionText}>Select all</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>•</Text>
            <TouchableOpacity onPress={selectNone} activeOpacity={0.7}>
              <Text style={styles.actionText}>Select none</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 4: details */}
        {role === "volunteer" && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Your details</Text>
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
              value={vLocation}
              onChangeText={setVLocation}
              placeholder="City / Region"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>
        )}

        {role === "organization" && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Organization details</Text>
            <TextInput
              value={orgName}
              onChangeText={setOrgName}
              placeholder="Organization name"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TextInput
              value={orgLocation}
              onChangeText={setOrgLocation}
              placeholder="City / Region"
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
            <TextInput
              value={orgSize}
              onChangeText={setOrgSize}
              placeholder="Number of members (e.g. 10+, 10–30, 100+)"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
            <TextInput
              value={website}
              onChangeText={setWebsite}
              placeholder="Website URL"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
        )}

        {!canSubmit && (
          <Text style={[styles.hint, { marginTop: 8 }]}>
            Fill out all required fields to continue
          </Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {canSubmit && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={handleSubmit}
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

function RadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
      activeOpacity={0.9}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text
        style={[styles.optionLabel, selected && styles.optionLabelSelected]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "700",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
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
    marginBottom: 10,
  },
  multiline: { minHeight: 110, textAlignVertical: "top" },

  hint: { fontSize: 12, color: "#DC2626" },

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

  // radio options
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
  },
  optionSelected: {
    borderColor: ACCENT + "55",
    backgroundColor: ACCENT + "10",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: { borderColor: ACCENT },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  optionLabel: { fontSize: 16, color: TEXT_SECONDARY, fontWeight: "600" },
  optionLabelSelected: { color: TEXT_PRIMARY },

  // areas
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginTop: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 6,
    marginVertical: 6,
    minWidth: "44%",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  chipLabel: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    fontWeight: "600",
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  actionText: { color: ACCENT, fontSize: 14, fontWeight: "600" },
  separator: { color: "#9CA3AF", fontSize: 14 },
});

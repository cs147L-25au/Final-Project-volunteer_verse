import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../utils/supabase";

// Reusing app theme constants
const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";
const DANGER = "#EF4444";

// Interests Data
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
type OrgRow = {
  id: number;
  org_name: string | null;
  mission_statement: string | null;
  location: string | null;
  image_url: string | null;
  Environment?: boolean | null;
  Health?: boolean | null;
  Education?: boolean | null;
  Animals?: boolean | null;
  Outreach?: boolean | null;
  Marginalized_group?: boolean | null;
};
const AREA_COLUMN_MAP: Record<AreaKey, keyof OrgRow> = {
  environment: "Environment",
  education: "Education",
  health: "Health",
  animals: "Animals",
  community: "Outreach",
  marginalized: "Marginalized_group",
};

function hexToRgba(hex: string, alpha = 0.14) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isOrg = params.type === "org";

  // --- STATE: Volunteer ---
  const [vPhoto, setVPhoto] = useState<string | null>(
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"
  );
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Rivera");
  const [vLocation, setVLocation] = useState("");
  const [valId, setValId] = useState<number | null>(null);
  const [interests, setInterests] = useState<AreaKey[]>([
    "environment",
    "animals",
  ]);

  // --- STATE: Organization ---
  const [oLogo, setOLogo] = useState<string | null>(
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&q=80"
  );
  const [orgName, setOrgName] = useState("Green Horizons");
  const [location, setLocation] = useState("San Jose, CA");
  const [mission, setMission] = useState(
    "Restoring local habitats and promoting sustainable living for a greener future."
  );
  const [orgId, setOrgId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // --- Handlers ---

  const pickImage = async (setter: (uri: string) => void) => {
    Alert.alert("Change Photo", "Choose a source", [
      {
        text: "Take Photo",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return;
          const res = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!res.canceled && res.assets[0].uri) setter(res.assets[0].uri);
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return;
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });
          if (!res.canceled && res.assets[0].uri) setter(res.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const toggleInterest = (key: AreaKey) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    if (!isOrg) return;
    let active = true;

    const loadOrg = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const userId = sessionData.session?.user?.id;
        if (!userId) {
          Alert.alert(
            "Please log in",
            "Sign in to view your organization profile."
          );
          router.replace("/(user-flow)");
          return;
        }

        const { data: org, error: orgError } = await supabase
          .from("Org_info")
          .select(
            "id, org_name, mission_statement, location, image_url, Environment, Health, Education, Animals, Outreach, Marginalized_group"
          )
          .eq("User_id", userId)
          .maybeSingle();

        if (orgError) throw orgError;
        if (!active || !org) return;

        setOrgId(org.id ?? null);
        setOrgName(org.org_name ?? "");
        setLocation(org.location ?? "");
        setMission(org.mission_statement ?? "");
        setOLogo(org.image_url ?? null);

        const mappedInterests = Object.entries(AREA_COLUMN_MAP)
          .filter(([_, col]) => Boolean((org as any)[col]))
          .map(([k]) => k as AreaKey);
        setInterests(mappedInterests);
      } catch (err) {
        console.error("Failed to load organization profile", err);
        Alert.alert(
          "Unable to load profile",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    };

    loadOrg();
    return () => {
      active = false;
    };
  }, [isOrg, router]);

  useEffect(() => {
    if (isOrg) return;
    let active = true;
    const loadVolunteer = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const userId = sessionData.session?.user?.id;
        if (!userId) {
          Alert.alert("Please log in", "Sign in to view your profile.");
          router.replace("/(user-flow)");
          return;
        }

        const { data: vol, error: volError } = await supabase
          .from("val_info_")
          .select(
            'id, "First Name", "Last Name", location, image_url, Environment, Health, Education, Animals, Outreach, Marginalized_group'
          )
          .eq("User_id", userId)
          .maybeSingle();

        if (volError) throw volError;
        if (!active || !vol) return;

        setValId(vol.id ?? null);
        setFirstName((vol["First Name"] as string | null) ?? "");
        setLastName((vol["Last Name"] as string | null) ?? "");
        setVLocation(vol.location ?? "");
        setVPhoto(vol.image_url ?? vPhoto);

        const mappedInterests = Object.entries(AREA_COLUMN_MAP)
          .filter(([_, col]) => Boolean((vol as any)[col]))
          .map(([k]) => k as AreaKey);
        setInterests(mappedInterests);
      } catch (err) {
        console.error("Failed to load volunteer profile", err);
        Alert.alert(
          "Unable to load profile",
          err instanceof Error ? err.message : "Please try again."
        );
      }
    };
    loadVolunteer();
    return () => {
      active = false;
    };
  }, [isOrg, router, vPhoto]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (isOrg) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const userId = sessionData.session?.user?.id;
        if (!userId) {
          throw new Error("No authenticated user. Please log in again.");
        }

        // Update user_info_ org flag
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
            .update({ org_bool: true })
            .eq("id", existingUserInfo[0].id);
          if (updateUserInfoError) throw updateUserInfoError;
        } else {
          const { error: insertUserInfoError } = await supabase
            .from("user_info_")
            .insert([{ user_auth_id: userId, org_bool: true }]);
          if (insertUserInfoError) throw insertUserInfoError;
        }

        // Prepare interests payload
        const interestPayload = Object.fromEntries(
          Object.entries(AREA_COLUMN_MAP).map(([k, col]) => [
            col,
            interests.includes(k as AreaKey),
          ])
        );

        const orgPayload = {
          org_name: orgName.trim() || null,
          mission_statement: mission.trim() || null,
          location: location.trim() || null,
          image_url: oLogo,
          User_id: userId,
          ...interestPayload,
        };

        if (orgId) {
          const { error: updateOrgError } = await supabase
            .from("Org_info")
            .update(orgPayload)
            .eq("id", orgId);
          if (updateOrgError) throw updateOrgError;
        } else {
          const { data: inserted, error: insertOrgError } = await supabase
            .from("Org_info")
            .insert([orgPayload])
            .select("id")
            .maybeSingle();
          if (insertOrgError) throw insertOrgError;
          if (inserted?.id) setOrgId(inserted.id);
        }
      } else {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const userId = sessionData.session?.user?.id;
        if (userId) {
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
              .update({ org_bool: false })
              .eq("id", existingUserInfo[0].id);
            if (updateUserInfoError) throw updateUserInfoError;
          } else {
            await supabase
              .from("user_info_")
              .insert([{ user_auth_id: userId, org_bool: false }]);
          }

          const interestPayload = Object.fromEntries(
            Object.entries(AREA_COLUMN_MAP).map(([k, col]) => [
              col,
              interests.includes(k as AreaKey),
            ])
          );

          const volPayload = {
            User_id: userId,
            "First Name": firstName.trim() || null,
            "Last Name": lastName.trim() || null,
            location: vLocation.trim() || null,
            image_url: vPhoto,
            ...interestPayload,
          };

          if (valId) {
            const { error: updateVolError } = await supabase
              .from("val_info_")
              .update(volPayload)
              .eq("id", valId);
            if (updateVolError) throw updateVolError;
          } else {
            const { data: inserted, error: insertVolError } = await supabase
              .from("val_info_")
              .insert([volPayload])
              .select("id")
              .maybeSingle();
            if (insertVolError) throw insertVolError;
            if (inserted?.id) setValId(inserted.id);
          }
        }
      }

      Alert.alert("Success", "Your profile has been updated.");
    } catch (err) {
      console.error("Failed to save profile", err);
      Alert.alert(
        "Unable to save",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.replace("/(user-flow)");
    } catch (err) {
      Alert.alert(
        "Error signing out",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setSigningOut(false);
    }
  };

  const onDateChange = (_: any, selected?: Date) => {
    // no-op; DOB removed for volunteer view
  };

  // --- Render Sections ---

  const renderVolunteerProfile = () => (
    <View style={styles.formSection}>
      <View style={styles.avatarRow}>
        <TouchableOpacity
          onPress={() => pickImage(setVPhoto)}
          style={styles.avatarContainer}
        >
          {vPhoto ? (
            <Image source={{ uri: vPhoto }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>
                {firstName[0]}
                {lastName[0]}
              </Text>
            </View>
          )}
          <View style={styles.editIconBadge}>
            <Text style={styles.editIconText}>✎</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>City / Region</Text>
        <TextInput
          value={vLocation}
          onChangeText={setVLocation}
          placeholder="e.g. San Francisco, CA"
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Interests</Text>
        <View style={styles.chipGrid}>
          {AREAS.map((area) => {
            const isSelected = interests.includes(area.key);
            return (
              <TouchableOpacity
                key={area.key}
                onPress={() => toggleInterest(area.key)}
                style={[
                  styles.chip,
                  isSelected && {
                    backgroundColor: hexToRgba(area.color, 0.16),
                    borderColor: area.color,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: area.color },
                    !isSelected && { opacity: 0.3 },
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
      </View>
    </View>
  );

  const renderOrgProfile = () => (
    <View style={styles.formSection}>
      <View style={styles.avatarRow}>
        <TouchableOpacity
          onPress={() => pickImage(setOLogo)}
          style={styles.avatarContainer}
        >
          {oLogo ? (
            <Image source={{ uri: oLogo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarPlaceholderText}>ORG</Text>
            </View>
          )}
          <View style={styles.editIconBadge}>
            <Text style={styles.editIconText}>✎</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Organization Name</Text>
        <TextInput
          value={orgName}
          onChangeText={setOrgName}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>City / Region</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. San Francisco, CA"
          style={styles.input}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Mission Statement</Text>
        <TextInput
          value={mission}
          onChangeText={setMission}
          multiline
          style={[styles.input, styles.textArea]}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Interests / Focus Areas</Text>
        <View style={styles.chipGrid}>
          {AREAS.map((area) => {
            const isSelected = interests.includes(area.key);
            return (
              <TouchableOpacity
                key={area.key}
                onPress={() => toggleInterest(area.key)}
                style={[
                  styles.chip,
                  isSelected && {
                    backgroundColor: hexToRgba(area.color, 0.16),
                    borderColor: area.color,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: area.color },
                    !isSelected && { opacity: 0.3 },
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
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>
          {isOrg ? "Organization Profile" : "Your Profile"}
        </Text>

        {isOrg ? renderOrgProfile() : renderVolunteerProfile()}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSave}
          style={styles.saveBtn}
          disabled={saving}
        >
          <Text style={styles.saveText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          style={styles.signOutBtn}
          disabled={signingOut}
        >
          <Text style={styles.signOutText}>
            {signingOut ? "Signing out..." : "Sign Out"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: "12%",
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    paddingVertical: 6,
  },
  backText: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 24,
  },
  formSection: {
    gap: 20,
  },
  avatarRow: {
    alignItems: "center",
    marginBottom: 10,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: BORDER,
  },
  avatarPlaceholder: {
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#94A3B8",
  },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: ACCENT,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BG,
  },
  editIconText: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 2,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SECONDARY,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  inputPressable: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: "#FFF",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },
  saveBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  signOutBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DANGER,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  signOutText: {
    color: DANGER,
    fontSize: 16,
    fontWeight: "700",
  },
});

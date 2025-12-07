import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

// Reusing app theme constants
const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

// Interests Data (from newvolunteer.tsx)
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

function hexToRgba(hex: string, alpha = 0.14) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ProfilePage() {
  const router = useRouter();

  // --- STATE: Role Toggle (For Demo Purposes) ---
  const [isOrg, setIsOrg] = useState(false);

  // --- STATE: Volunteer ---
  const [vPhoto, setVPhoto] = useState<string | null>(
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"
  );
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Rivera");
  const [dob, setDob] = useState<Date>(new Date(1998, 5, 15));
  const [interests, setInterests] = useState<AreaKey[]>([
    "environment",
    "animals",
  ]);

  // --- STATE: Organization ---
  const [oLogo, setOLogo] = useState<string | null>(
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&q=80"
  );
  // Banner state removed as per previous request
  const [orgName, setOrgName] = useState("Green Horizons");
  const [location, setLocation] = useState("San Jose, CA");
  const [mission, setMission] = useState(
    "Restoring local habitats and promoting sustainable living for a greener future."
  );

  // --- Date Picker State ---
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(dob);

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
            aspect: [1, 1], // Square aspect for avatars
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
            aspect: [4, 3], // Generic aspect
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

  const handleSave = () => {
    Alert.alert("Success", "Your profile has been updated.");
    // In a real app, you would sync with Supabase here
  };

  const onDateChange = (_: any, selected?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selected) {
      setDob(selected);
      setTempDate(selected); // sync temp
    }
  };

  // --- Render Sections ---

  const renderVolunteerProfile = () => (
    <View style={styles.formSection}>
      {/* Avatar */}
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

      {/* Name Fields */}
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

      {/* Birthday */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.inputPressable}
          onPress={() => {
            setTempDate(dob);
            setShowDatePicker(true);
          }}
        >
          <Text style={styles.inputText}>
            {dob.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Interests */}
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
      {/* Logo */}
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

      {/* Org Name (Removed Verification Checkmark) */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Organization Name</Text>
        <TextInput
          value={orgName}
          onChangeText={setOrgName}
          style={styles.input}
        />
      </View>

      {/* Location */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>City / Region</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. San Francisco, CA"
          style={styles.input}
        />
      </View>

      {/* Mission */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Mission Statement</Text>
        <TextInput
          value={mission}
          onChangeText={setMission}
          multiline
          style={[styles.input, styles.textArea]}
        />
      </View>

      {/* Org Interests (Added) */}
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsOrg(!isOrg)}>
          <Text style={styles.devToggle}>
            Switch to {isOrg ? "Volunteer" : "Org"} (Dev)
          </Text>
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
        >
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Padding for bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker Modal (iOS) or Component (Android) */}
      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Modal
        visible={showDatePicker && Platform.OS === "ios"}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalToolbar}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.toolbarBtn}
              >
                <Text style={styles.toolbarText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setDob(tempDate);
                  setShowDatePicker(false);
                }}
                style={styles.toolbarBtn}
              >
                <Text style={styles.toolbarTextAccent}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_, d) => d && setTempDate(d)}
              themeVariant="light"
              textColor={TEXT_PRIMARY}
              accentColor={ACCENT}
            />
          </View>
        </View>
      </Modal>
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
  devToggle: {
    color: "#9CA3AF",
    fontSize: 12,
    textDecorationLine: "underline",
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  toolbarBtn: {
    padding: 4,
  },
  toolbarText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
  },
  toolbarTextAccent: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: "700",
  },
});

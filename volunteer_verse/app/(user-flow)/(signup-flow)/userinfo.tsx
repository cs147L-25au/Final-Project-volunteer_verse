// STEP 4 (Volunteer): Personal Details & Photo
// Navigates to: Volunteer Dashboard (/homepage)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import type { MediaType } from "expo-image-picker";
const IMAGE_ONLY: MediaType[] = ["images"];

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

export default function UserInfo() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date(2000, 0, 1));

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const canContinue = Boolean(
    firstName.trim() && lastName.trim() && dob && photoUri
  );

  const openDatePicker = () => {
    setTempDate(dob || new Date(2000, 0, 1));
    setShowPicker(true);
  };

  const onAndroidDateChange = (event: any, selectedDate?: Date) => {
    if (event?.type === "set" && selectedDate) {
      setDob(selectedDate);
    }
    setShowPicker(false);
  };

  const pickPhoto = async () => {
    Alert.alert("Add a photo", "Choose a source", [
      {
        text: "Take Photo",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return;
          const res = await ImagePicker.launchCameraAsync({
            mediaTypes: IMAGE_ONLY,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.9,
          });
          if (!res.canceled && res.assets?.[0]?.uri)
            setPhotoUri(res.assets[0].uri);
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return;
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: IMAGE_ONLY,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.9,
          });
          if (!res.canceled && res.assets?.[0]?.uri)
            setPhotoUri(res.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleNext = () => {
    if (!canContinue) return;
    // FINISH: Go to Volunteer Dashboard
    // In a real app, you would create the user in Supabase here.
    router.replace("/homepage");
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

          <View style={styles.labelRow}>
            <Text style={styles.label}>Date of birth</Text>
          </View>
          <TouchableOpacity
            onPress={openDatePicker}
            activeOpacity={0.8}
            style={styles.inputPressable}
          >
            <Text style={[styles.inputText, !dob && styles.placeholderText]}>
              {dob ? dob.toLocaleDateString() : "MM/DD/YYYY"}
            </Text>
          </TouchableOpacity>

          {/* Android picker */}
          {showPicker && Platform.OS === "android" && (
            <DateTimePicker
              value={dob || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onAndroidDateChange}
            />
          )}

          {/* iOS picker */}
          <Modal
            visible={showPicker && Platform.OS === "ios"}
            transparent
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalToolbar}>
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={styles.toolbarBtn}
                  >
                    <Text style={styles.toolbarText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setDob(tempDate);
                      setShowPicker(false);
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
                  maximumDate={new Date()}
                  onChange={(_, selectedDate?: Date) => {
                    if (selectedDate) setTempDate(selectedDate);
                  }}
                  style={styles.iosPicker}
                />
              </View>
            </View>
          </Modal>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Upload a photo of yourself</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={pickPhoto}
            style={styles.uploadBox}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.uploadInner}>
                <View style={styles.uploadIcon} />
                <Text style={styles.uploadText}>Add a photo</Text>
                <Text style={styles.uploadSub}>
                  Take one or choose from library
                </Text>
              </View>
            )}
          </TouchableOpacity>
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
  labelRow: {
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputPressable: {
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  inputText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  uploadInner: {
    alignItems: "center",
    gap: 8,
  },
  uploadIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT + "22",
    borderWidth: 2,
    borderColor: ACCENT,
    marginBottom: 6,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  uploadSub: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },
  modalToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  toolbarBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  toolbarText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontWeight: "600",
  },
  toolbarTextAccent: {
    fontSize: 16,
    color: ACCENT,
    fontWeight: "700",
  },
  iosPicker: {
    backgroundColor: "#FFF",
  },
});

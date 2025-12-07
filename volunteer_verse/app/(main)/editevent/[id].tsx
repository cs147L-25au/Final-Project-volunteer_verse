import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

// Duplicate mock data for lookup
const MOCK_EVENTS: Record<
  string,
  {
    id: string;
    name: string;
    description: string;
    location: string;
    startISO: string;
    endISO: string;
  }
> = {
  "e-101": {
    id: "e-101",
    name: "Community Health Screening",
    description:
      "Provide basic health screenings and wellness guidance to local residents.",
    location: "Downtown Community Clinic",
    startISO: "2025-01-25T09:00:00",
    endISO: "2025-01-25T12:00:00",
  },
  "e-102": {
    id: "e-102",
    name: "Fundraising Gala",
    description: "Annual gala to raise funds for our outreach programs.",
    location: "City Hall Ballroom",
    startISO: "2025-02-10T18:00:00",
    endISO: "2025-02-10T21:00:00",
  },
  "e-103": {
    id: "e-103",
    name: "Park Cleanup",
    description: "Join us to keep our parks clean and welcoming.",
    location: "Liberty Park",
    startISO: "2025-02-18T10:00:00",
    endISO: "2025-02-18T13:00:00",
  },
};

export default function EditEvent() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const event = MOCK_EVENTS[id!];

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [description, setDescription] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (event) {
      const s = new Date(event.startISO);
      const e = new Date(event.endISO);
      setName(event.name);
      setLocation(event.location);
      setDescription(event.description);
      setDate(s);
      setStartTime(s);
      setEndTime(e);
      setIsLoaded(true);
    }
  }, [event]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [tempStart, setTempStart] = useState<Date>(new Date());
  const [tempEnd, setTempEnd] = useState<Date>(new Date());

  const endAfterStart = useMemo(
    () => endTime > startTime,
    [startTime, endTime]
  );
  const allFilled = name.trim() && location.trim() && description.trim();
  const canSave = Boolean(allFilled && endAfterStart);

  // helpers
  const withDate = (baseTime: Date, newDate: Date) => {
    const d = new Date(baseTime);
    d.setFullYear(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    return d;
  };
  const fmtDate = (d: Date) =>
    d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const openDatePicker = () => {
    setTempDate(date);
    setShowDatePicker(true);
  };
  const openStartPicker = () => {
    setTempStart(startTime);
    setShowStartPicker(true);
  };
  const openEndPicker = () => {
    setTempEnd(endTime);
    setShowEndPicker(true);
  };

  const handleSave = () => {
    if (!canSave) return;
    Alert.alert("Success", "Event updated successfully", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  if (!id || !event) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isLoaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonHeader}
        >
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit Event</Text>
        <View style={styles.group}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Event name"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Event location"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>Date</Text>
          </View>
          <TouchableOpacity
            style={styles.inputPressable}
            activeOpacity={0.8}
            onPress={openDatePicker}
          >
            <Text style={styles.inputText}>{fmtDate(date)}</Text>
          </TouchableOpacity>

          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(_e, selected) => {
                setShowDatePicker(false);
                if (selected) {
                  setDate(selected);
                  setStartTime((prev) => withDate(prev, selected));
                  setEndTime((prev) => withDate(prev, selected));
                }
              }}
            />
          )}

          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start time</Text>
              <TouchableOpacity
                style={styles.inputPressable}
                activeOpacity={0.8}
                onPress={openStartPicker}
              >
                <Text style={styles.inputText}>{fmtTime(startTime)}</Text>
              </TouchableOpacity>
              {showStartPicker && Platform.OS === "android" && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onChange={(_e, selected) => {
                    setShowStartPicker(false);
                    if (selected) setStartTime(withDate(selected, date));
                  }}
                />
              )}
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End time</Text>
              <TouchableOpacity
                style={styles.inputPressable}
                activeOpacity={0.8}
                onPress={openEndPicker}
              >
                <Text style={styles.inputText}>{fmtTime(endTime)}</Text>
              </TouchableOpacity>
              {showEndPicker && Platform.OS === "android" && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="default"
                  onChange={(_e, selected) => {
                    setShowEndPicker(false);
                    if (selected) setEndTime(withDate(selected, date));
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
          </View>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Briefly describe the event"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.textarea]}
            multiline
          />

          {!endAfterStart && (
            <Text style={styles.error}>End time must be after start time</Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {canSave && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSave}
          style={styles.saveBtn}
        >
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      {/* iOS Pickers */}
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
                <Text style={styles.toolbarText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setDate(tempDate);
                  setStartTime((prev) => withDate(prev, tempDate));
                  setEndTime((prev) => withDate(prev, tempDate));
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
              onChange={(_, selected) => selected && setTempDate(selected)}
              themeVariant="light"
              textColor={TEXT_PRIMARY}
              accentColor={ACCENT}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showStartPicker && Platform.OS === "ios"}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalToolbar}>
              <TouchableOpacity
                onPress={() => setShowStartPicker(false)}
                style={styles.toolbarBtn}
              >
                <Text style={styles.toolbarText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setStartTime(withDate(tempStart, date));
                  setShowStartPicker(false);
                }}
                style={styles.toolbarBtn}
              >
                <Text style={styles.toolbarTextAccent}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempStart}
              mode="time"
              display="spinner"
              onChange={(_, selected) => selected && setTempStart(selected)}
              themeVariant="light"
              textColor={TEXT_PRIMARY}
              accentColor={ACCENT}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEndPicker && Platform.OS === "ios"}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalToolbar}>
              <TouchableOpacity
                onPress={() => setShowEndPicker(false)}
                style={styles.toolbarBtn}
              >
                <Text style={styles.toolbarText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEndTime(withDate(tempEnd, date));
                  setShowEndPicker(false);
                }}
                style={styles.toolbarBtn}
              >
                <Text style={styles.toolbarTextAccent}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempEnd}
              mode="time"
              display="spinner"
              onChange={(_, selected) => selected && setTempEnd(selected)}
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
  container: { flex: 1, backgroundColor: BG },
  center: { alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  backButtonHeader: { alignSelf: "flex-start", marginBottom: 12 },
  backText: { color: ACCENT, fontSize: 16, fontWeight: "600" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  group: { gap: 12 },
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
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  labelRow: { marginTop: 6 },
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
  inputText: { fontSize: 16, color: TEXT_PRIMARY },
  timeRow: { flexDirection: "row", alignItems: "flex-start" },
  error: { fontSize: 12, color: "#DC2626", marginTop: 6 },
  saveBtn: {
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
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  errorText: { fontSize: 18, color: TEXT_SECONDARY, marginBottom: 12 },
  backBtn: { padding: 10 },
  backBtnText: { color: ACCENT, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.25)",
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
  toolbarBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  toolbarText: { fontSize: 16, color: TEXT_SECONDARY, fontWeight: "600" },
  toolbarTextAccent: { fontSize: 16, color: ACCENT, fontWeight: "700" },
});

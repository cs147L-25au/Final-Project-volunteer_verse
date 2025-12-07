import React, { useMemo, useState } from "react";
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
import { useRouter } from "expo-router";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

export default function NewEvent() {
  const router = useRouter();

  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setMinutes(0, 0, 0);
  defaultStart.setHours(now.getHours() + 1);
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(defaultStart);
  const [endTime, setEndTime] = useState<Date>(defaultEnd);
  const [description, setDescription] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [tempDate, setTempDate] = useState<Date>(date);
  const [tempStart, setTempStart] = useState<Date>(startTime);
  const [tempEnd, setTempEnd] = useState<Date>(endTime);

  const endAfterStart = useMemo(
    () => endTime > startTime,
    [startTime, endTime]
  );
  const allFilled = name.trim() && location.trim() && description.trim();
  const canCreate = Boolean(allFilled && endAfterStart);

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

  // Android handlers (system dialog)
  const onAndroidDateChange = (_e: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setDate(selected);
      setStartTime((prev) => withDate(prev, selected));
      setEndTime((prev) => withDate(prev, selected));
    }
  };
  const onAndroidStartChange = (_e: any, selected?: Date) => {
    setShowStartPicker(false);
    if (selected) {
      const merged = withDate(selected, date);
      setStartTime(merged);
    }
  };
  const onAndroidEndChange = (_e: any, selected?: Date) => {
    setShowEndPicker(false);
    if (selected) {
      const merged = withDate(selected, date);
      setEndTime(merged);
    }
  };

  const handleCreate = () => {
    if (!canCreate) return;
    // TODO: Persist event to backend (e.g., Supabase)
    Alert.alert(
      "Event created",
      `“${name}” on ${fmtDate(date)} from ${fmtTime(startTime)} to ${fmtTime(
        endTime
      )} has been created.`
    );
    router.replace("/orgdashboard");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create a new event</Text>
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

          {/* Android date picker */}
          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onAndroidDateChange}
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
                  onChange={onAndroidStartChange}
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
                  onChange={onAndroidEndChange}
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
          {!canCreate && (
            <Text style={styles.hint}>
              Please complete all fields to create the event
            </Text>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {canCreate && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCreate}
          style={styles.createBtn}
        >
          <Text style={styles.createText}>Create Event</Text>
        </TouchableOpacity>
      )}

      {/* iOS bottom-sheet pickers */}
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
              minimumDate={new Date()}
              onChange={(_, selected?: Date) =>
                selected && setTempDate(selected)
              }
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
              onChange={(_, selected?: Date) =>
                selected && setTempStart(selected)
              }
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
              onChange={(_, selected?: Date) =>
                selected && setTempEnd(selected)
              }
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
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
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
  hint: { fontSize: 12, color: "#6B7280", marginTop: 6 },
  error: { fontSize: 12, color: "#DC2626", marginTop: 6 },
  createBtn: {
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
  createText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
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

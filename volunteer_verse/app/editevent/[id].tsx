import React, { useEffect, useMemo, useState } from "react";
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
import { useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "utils/supabase";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

type EventRow = {
  id: string;
  name: string | null;
  description: string | null;
  location: string | null;
  start_at: string; // ISO
  end_at: string; // ISO
};

export default function EditEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  // iOS modal pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [tempStart, setTempStart] = useState<Date>(new Date());
  const [tempEnd, setTempEnd] = useState<Date>(new Date());

  const endAfterStart = useMemo(() => {
    const s = withDate(startTime, date);
    const e = withDate(endTime, date);
    return e > s;
  }, [startTime, endTime, date]);

  const canSave = Boolean(name.trim() && location.trim() && endAfterStart);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("events")
          .select("id,name,description,location,start_at,end_at")
          .eq("id", String(id))
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          Alert.alert("Not found", "Event could not be found.");
          return;
        }
        if (!active) return;
        const start = new Date(data.start_at);
        const end = new Date(data.end_at);

        setName(data.name ?? "");
        setLocation(data.location ?? "");
        setDescription(data.description ?? "");
        setDate(new Date(start));
        setStartTime(new Date(start));
        setEndTime(new Date(end));

        setTempDate(new Date(start));
        setTempStart(new Date(start));
        setTempEnd(new Date(end));
      } catch (e: any) {
        Alert.alert("Error", e.message ?? "Failed to load event");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const start_at = withDate(startTime, date).toISOString();
      const end_at = withDate(endTime, date).toISOString();
      const { error } = await supabase
        .from("events")
        .update({
          name: name.trim(),
          description: description.trim() || null,
          location: location.trim(),
          start_at,
          end_at,
        })
        .eq("id", String(id));

      if (error) throw error;

      Alert.alert("Saved", "Your event has been updated.");
    } catch (e: any) {
      Alert.alert("Save failed", e.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Android picker handlers
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
    if (selected) setStartTime(withDate(selected, date));
  };
  const onAndroidEndChange = (_e: any, selected?: Date) => {
    setShowEndPicker(false);
    if (selected) setEndTime(withDate(selected, date));
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={{ color: TEXT_SECONDARY }}>Loading event…</Text>
      </View>
    );
  }

  const dateLabel = fmtDate(date);
  const startLabel = fmtTime(startTime);
  const endLabel = fmtTime(endTime);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Edit event</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Event name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Event name"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Event location"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
          />

          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.inputPressable}
            activeOpacity={0.8}
            onPress={() => {
              setTempDate(date);
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.inputText}>{dateLabel}</Text>
          </TouchableOpacity>
          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onAndroidDateChange}
            />
          )}

          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start time</Text>
              <TouchableOpacity
                style={styles.inputPressable}
                activeOpacity={0.8}
                onPress={() => {
                  setTempStart(startTime);
                  setShowStartPicker(true);
                }}
              >
                <Text style={styles.inputText}>{startLabel}</Text>
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
                onPress={() => {
                  setTempEnd(endTime);
                  setShowEndPicker(true);
                }}
              >
                <Text style={styles.inputText}>{endLabel}</Text>
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

          {!endAfterStart && (
            <Text style={styles.hint}>End time must be after start time</Text>
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add a brief description"
            placeholderTextColor="#9CA3AF"
            multiline
            style={[styles.input, styles.textarea]}
          />
        </View>

        {!canSave && (
          <Text style={[styles.hint, { marginTop: 8 }]}>
            Fill name, location, and ensure end time is after start time
          </Text>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleSave}
        disabled={!canSave || saving}
        style={[styles.saveBtn, (!canSave || saving) && { opacity: 0.7 }]}
      >
        <Text style={styles.saveText}>
          {saving ? "Saving..." : "Save changes"}
        </Text>
      </TouchableOpacity>

      {/* iOS modal pickers */}
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
              onChange={(_, selected?: Date) =>
                selected && setTempDate(selected)
              }
              themeVariant="light"
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
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// helpers
function withDate(time: Date, date: Date) {
  const d = new Date(time);
  d.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
  return d;
}
function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  label: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 10,
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
  },
  inputPressable: {
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  inputText: { fontSize: 16, color: TEXT_PRIMARY },

  timeRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 10 },

  textarea: { minHeight: 110, textAlignVertical: "top", marginTop: 6 },

  hint: { fontSize: 12, color: "#DC2626", marginTop: 8 },

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

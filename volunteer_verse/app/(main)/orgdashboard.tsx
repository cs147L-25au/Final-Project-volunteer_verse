import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../utils/supabase";

type EventItem = {
  id: string;
  name: string;
  description: string;
  location: string; // specific event location
  startISO: string; // start datetime ISO
  endISO: string; // end datetime ISO
};

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";
const DANGER = "#EF4444";

const EVENTS: EventItem[] = [
  {
    id: "e-101",
    name: "Community Health Screening",
    description:
      "Provide basic health screenings and wellness guidance to local residents.",
    location: "Downtown Community Clinic",
    startISO: "2025-01-25T09:00:00",
    endISO: "2025-01-25T12:00:00",
  },
  {
    id: "e-102",
    name: "Fundraising Gala",
    description: "Annual gala to raise funds for our outreach programs.",
    location: "City Hall Ballroom",
    startISO: "2025-02-10T18:00:00",
    endISO: "2025-02-10T21:00:00",
  },
  {
    id: "e-103",
    name: "Park Cleanup",
    description: "Join us to keep our parks clean and welcoming.",
    location: "Liberty Park",
    startISO: "2025-02-18T10:00:00",
    endISO: "2025-02-18T13:00:00",
  },
];

export default function OrgDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error signing out", error.message);
    } else {
      router.replace("/"); // Go back to login
    }
  };

  const renderItem = ({ item }: { item: EventItem }) => (
    <EventCard
      event={item}
      onEdit={() => router.push(`/editevent/${item.id}`)}
      onDelete={() => confirmDelete(item)}
    />
  );

  const confirmDelete = (event: EventItem) => {
    Alert.alert(
      "Delete Event",
      `Are you sure you wish to delete ${event.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: remove from backend; then update local state
            Alert.alert("Deleted", `${event.name} has been deleted.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Title and Actions */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Your Events</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/profilepage?type=org")}
            activeOpacity={0.8}
          >
            <Text style={styles.iconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={EVENTS}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push("/newevent")}
        style={styles.fab}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

function EventCard({
  event,
  onEdit,
  onDelete,
}: {
  event: EventItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const start = useMemo(() => new Date(event.startISO), [event.startISO]);
  const end = useMemo(() => new Date(event.endISO), [event.endISO]);

  const dateLabel = useMemo(
    () =>
      start.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [start]
  );
  const timeLabel = useMemo(
    () => `${fmtTime(start)} - ${fmtTime(end)}`,
    [start, end]
  );

  return (
    <View style={styles.eventCard}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setExpanded((e) => !e)}
        style={styles.eventHeader}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventMeta}>
            {dateLabel} • {timeLabel}
          </Text>
          <Text style={styles.eventLocation}>{event.location}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? "▾" : "▸"}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.eventBody}>
          <Text style={styles.eventDesc}>{event.description}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onEdit}
              style={styles.editBtn}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onDelete}
              style={styles.trashBtn}
            >
              <Text style={styles.trashIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: BG,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  iconText: {
    fontSize: 18,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  separator: {
    height: 12,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  eventName: {
    fontSize: 16.5,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  eventMeta: {
    fontSize: 13.5,
    color: "#6B7280",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13.5,
    color: TEXT_SECONDARY,
  },
  chevron: {
    fontSize: 18,
    color: "#9CA3AF",
    marginTop: 2,
  },
  eventBody: {
    marginTop: 12,
  },
  eventDesc: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  editBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  editText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  trashBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  trashIcon: {
    fontSize: 18,
    color: "#DC2626",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  fabIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 30,
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
    marginTop: 24,
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

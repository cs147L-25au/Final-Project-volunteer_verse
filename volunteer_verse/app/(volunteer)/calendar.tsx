import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";
const DANGER = "#EF4444";

type RegisteredEvent = {
  id: string;
  orgName: string;
  eventName: string;
  location: string;
  startISO: string;
  endISO: string;
};

const INITIAL_EVENTS: RegisteredEvent[] = [
  {
    id: "r-1",
    orgName: "Green Horizons",
    eventName: "Creek Cleanup",
    location: "Guadalupe River Park, San Jose",
    startISO: "2025-01-20T09:00:00",
    endISO: "2025-01-20T12:00:00",
  },
  {
    id: "r-2",
    orgName: "Bright Minds",
    eventName: "STEM Workshop",
    location: "Sunnyvale Community Center",
    startISO: "2025-01-28T13:00:00",
    endISO: "2025-01-28T16:00:00",
  },
];

export default function Calendar() {
  const router = useRouter();
  const [events, setEvents] = useState<RegisteredEvent[]>(INITIAL_EVENTS);
  const headerHeight = useHeaderHeight();

  const handleCancel = (eventId: string, eventName: string) => {
    Alert.alert(
      "Cancel Registration",
      `Are you sure you want to cancel your spot for "${eventName}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: RegisteredEvent }) => {
    const start = new Date(item.startISO);
    const end = new Date(item.endISO);
    const dateLabel = start.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const timeLabel = `${fmtTime(start)} - ${fmtTime(end)}`;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateBadge}>{dateLabel}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.eventName}>{item.eventName}</Text>
            <Text style={styles.orgName}>by {item.orgName}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>🕒</Text>
            <Text style={styles.infoText}>{timeLabel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.infoText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(item.id, item.eventName)}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>Cancel Registration</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no upcoming events.</Text>
            <TouchableOpacity
              onPress={() => router.push("/(volunteer)/homepage")}
              style={styles.browseBtn}
              activeOpacity={0.9}
            >
              <Text style={styles.browseText}>Browse Opportunities</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  dateBadge: {
    backgroundColor: ACCENT + "15",
    color: ACCENT,
    fontWeight: "700",
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 50,
    textAlign: "center",
  },
  eventName: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  orgName: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SECONDARY,
  },
  cardBody: {
    gap: 6,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 14,
    width: 20,
    textAlign: "center",
  },
  infoText: {
    fontSize: 14.5,
    color: TEXT_PRIMARY,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 12,
    alignItems: "flex-end",
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: DANGER,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    marginBottom: 16,
  },
  browseBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  browseText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
});

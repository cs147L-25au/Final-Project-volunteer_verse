import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

type AreaKey =
  | "environment"
  | "education"
  | "health"
  | "animals"
  | "community"
  | "marginalized";

type EventItem = {
  id: string;
  name: string;
  description: string;
  location: string; // specific event location
  startISO: string; // start datetime ISO
  endISO: string; // end datetime ISO
};

type Org = {
  id: string;
  name: string;
  mission: string;
  location: string;
  website: string;
  areas: AreaKey[];
  image: string;
  events: EventItem[];
};

// Example data; replace with real fetch
const ORGS: Record<string, Org> = {
  "org-1": {
    id: "org-1",
    name: "Green Horizons",
    mission: "Restoring local habitats and promoting sustainable living.",
    location: "San Jose",
    website: "https://greenhorizons.example.org",
    areas: ["environment", "community"],
    image:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=60",
    events: [
      {
        id: "e-1",
        name: "Creek Cleanup",
        description:
          "Help us remove trash and invasive plants from the local creek. Gloves and tools provided.",
        location: "Guadalupe River Park, San Jose",
        startISO: "2025-01-20T09:00:00",
        endISO: "2025-01-20T12:00:00",
      },
      {
        id: "e-2",
        name: "Tree Planting Day",
        description:
          "Join us to plant native trees and learn about habitat restoration.",
        location: "Almaden Quicksilver Park",
        startISO: "2025-02-05T10:00:00",
        endISO: "2025-02-05T14:00:00",
      },
    ],
  },
  "org-2": {
    id: "org-2",
    name: "Bright Minds",
    mission: "Tutoring and after-school programs for underserved youth.",
    location: "Sunnyvale",
    website: "https://brightminds.example.org",
    areas: ["education", "marginalized"],
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60",
    events: [
      {
        id: "e-3",
        name: "STEM Workshop",
        description:
          "Hands-on science and coding activities for middle schoolers.",
        location: "Sunnyvale Community Center",
        startISO: "2025-01-28T13:00:00",
        endISO: "2025-01-28T16:00:00",
      },
    ],
  },
};

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

export default function OrgDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const org = ORGS[String(id)];

  if (!org) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={styles.empty}>Organization not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{org.name}</Text>
        <Image source={{ uri: org.image }} style={styles.hero} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mission</Text>
          <Text style={styles.mission}>{org.mission}</Text>
        </View>

        <View style={styles.rowInfo}>
          <InfoItem label="Location" value={org.location} />
          <InfoItem
            label="Website"
            value={org.website}
            onPress={() => Linking.openURL(org.website)}
            pressable
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Events</Text>
          {org.events.length === 0 ? (
            <Text style={styles.empty}>No upcoming events.</Text>
          ) : (
            org.events.map((ev) => <EventCard key={ev.id} event={ev} />)
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

function InfoItem({
  label,
  value,
  onPress,
  pressable,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  pressable?: boolean;
}) {
  const content = (
    <>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, pressable && styles.link]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </>
  );
  if (pressable && onPress) {
    return (
      <TouchableOpacity
        style={styles.infoItem}
        activeOpacity={0.8}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={styles.infoItem}>{content}</View>;
}

function EventCard({ event }: { event: EventItem }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]); // slot keys: startISO

  const start = new Date(event.startISO);
  const end = new Date(event.endISO);

  const dateLabel = useMemo(
    () =>
      start.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [event.startISO]
  );

  const timeLabel = useMemo(
    () => `${fmtTime(start)} - ${fmtTime(end)}`,
    [event.startISO, event.endISO]
  );

  const slots = useMemo(
    () => buildSlots(start, end),
    [event.startISO, event.endISO]
  );

  const toggleSlot = (key: string) => {
    setSelectedSlots((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleRegister = () => {
    if (selectedSlots.length === 0) return;
    const dayLabel = new Date(event.startISO).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      //year: "numeric",
    });
    Alert.alert(
      "Registration",
      `You have requested to volunteer at ${event.name} on ${dayLabel}`
    );
  };

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

          <Text style={styles.slotsLabel}>Available time slots</Text>
          <View style={styles.slotsWrap}>
            {slots.map((s) => {
              const key = s.start.toISOString();
              const selected = selectedSlots.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.85}
                  onPress={() => toggleSlot(key)}
                  style={[
                    styles.slot,
                    selected && {
                      backgroundColor: ACCENT + "1A",
                      borderColor: ACCENT,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selected && { color: TEXT_PRIMARY },
                    ]}
                  >
                    {fmtTime(s.start)} - {fmtTime(s.end)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedSlots.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleRegister}
              style={styles.registerBtn}
            >
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function buildSlots(start: Date, end: Date) {
  const slots: { start: Date; end: Date }[] = [];
  const stepMs = 30 * 60 * 1000; // 30 min
  let cur = new Date(start);
  while (cur < end) {
    const next = new Date(cur.getTime() + stepMs);
    if (next > end) break;
    slots.push({ start: new Date(cur), end: next });
    cur = next;
  }
  return slots;
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  hero: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    backgroundColor: "#FFF",
    marginBottom: 16,
  },
  section: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  mission: {
    fontSize: 14.5,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  rowInfo: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    flexWrap: "wrap",
  },
  infoItem: {
    flexGrow: 1,
    minWidth: "44%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14.5,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  link: {
    color: ACCENT,
  },
  empty: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
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
  slotsLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  slotsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slot: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  slotText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: "600",
  },
  registerBtn: {
    marginTop: 12,
    backgroundColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  registerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

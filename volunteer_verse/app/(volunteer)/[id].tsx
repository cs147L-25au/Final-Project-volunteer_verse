import React, { useEffect, useMemo, useState } from "react";
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
import { Stack, useLocalSearchParams } from "expo-router";
import { supabase } from "utils/supabase";

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
  location: string;
  startISO: string;
  endISO: string;
};

type Org = {
  id: string;
  name: string;
  mission: string;
  location: string;
  website?: string;
  areas: AreaKey[];
  image: string;
};

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

export default function OrgDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = Number(id);

  const [org, setOrg] = useState<Org | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!numericId || Number.isNaN(numericId)) {
      setLoading(false);
      setOrg(null);
      return;
    }
    (async () => {
      try {
        const { data: orgRow, error: orgErr } = await supabase
          .from("Org_info")
          .select(
            "id, org_name, mission_statement, location, website_url, image_url, Environment, Health, Education, Animals, Outreach, Marginalized_group"
          )
          .eq("id", numericId)
          .maybeSingle();
        if (orgErr) throw orgErr;
        if (!orgRow) {
          if (active) {
            setOrg(null);
            setEvents([]);
          }
          return;
        }
        const areas: AreaKey[] = [];
        if (orgRow.Environment) areas.push("environment");
        if (orgRow.Education) areas.push("education");
        if (orgRow.Health) areas.push("health");
        if (orgRow.Animals) areas.push("animals");
        if (orgRow.Outreach) areas.push("community");
        if (orgRow.Marginalized_group) areas.push("marginalized");
        const mappedOrg: Org = {
          id: String(orgRow.id),
          name: orgRow.org_name ?? "Unnamed",
          mission: orgRow.mission_statement ?? "",
          location: orgRow.location ?? "",
          website: orgRow.website_url?.startsWith("http")
            ? orgRow.website_url
            : undefined,
          image:
            orgRow.image_url ||
            "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg",
          areas,
        };
        if (active) setOrg(mappedOrg);

        const { data: evRows, error: evErr } = await supabase
          .from("events")
          .select("id,name,description,location,start_at,end_at")
          .eq("org_id", numericId)
          .order("start_at", { ascending: true });
        if (evErr) throw evErr;

        const mappedEvents: EventItem[] = (evRows ?? []).map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description ?? "",
          location: row.location ?? "",
          startISO: row.start_at,
          endISO: row.end_at,
        }));
        if (active) setEvents(mappedEvents);
      } catch (e: any) {
        Alert.alert("Error", e.message ?? "Failed to load organization");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [numericId]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={{ color: TEXT_SECONDARY }}>Loading…</Text>
      </View>
    );
  }

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
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: "",
          headerTintColor: TEXT_PRIMARY,
          headerShadowVisible: false,
          headerBackTitle: "Back",
        }}
      />
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
            value={org.website || "No URL provided"}
            onPress={
              org.website ? () => Linking.openURL(org.website!) : undefined
            }
            pressable={Boolean(org.website)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Events</Text>
          {events.length === 0 ? (
            <Text style={styles.empty}>No upcoming events.</Text>
          ) : (
            events.map((ev) => <EventCard key={ev.id} event={ev} />)
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
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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
  const slotMap = useMemo(() => {
    const m = new Map<string, { start: Date; end: Date }>();
    slots.forEach((s) => m.set(s.start.toISOString(), s));
    return m;
  }, [slots]);

  const toggleSlot = (key: string) => {
    setSelectedSlots((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleRegister = async () => {
    if (selectedSlots.length === 0 || saving) return;
    try {
      setSaving(true);
      const { data: auth, error: authErr } = await supabase.auth.getUser();
      if (authErr || !auth.user) throw authErr || new Error("Not signed in");
      const userId = auth.user.id;

      // Clean existing registrations for these slots (if any), then insert
      const { error: delErr } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", userId)
        .in("slot_start", selectedSlots);
      if (delErr && delErr.code !== "PGRST116") {
        // PGRST116 = no rows found; ignore
        throw delErr;
      }

      const rows = selectedSlots.map((key) => {
        const s = slotMap.get(key)!;
        return {
          event_id: event.id,
          user_id: userId,
          slot_start: s.start.toISOString(),
          slot_end: s.end.toISOString(),
        };
      });

      const { error: insErr } = await supabase
        .from("event_registrations")
        .insert(rows);
      if (insErr) throw insErr;

      const dayLabel = new Date(event.startISO).toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      Alert.alert(
        "Registration",
        `You have requested to volunteer at ${event.name} on ${dayLabel}`
      );
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to register");
    } finally {
      setSaving(false);
    }
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
              style={[styles.registerBtn, saving && { opacity: 0.7 }]}
            >
              <Text style={styles.registerText}>
                {saving ? "Registering..." : "Register"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function buildSlots(start: Date, end: Date) {
  const slots: { start: Date; end: Date }[] = [];
  const stepMs = 30 * 60 * 1000;
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
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { padding: "3%" },
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
    marginBottom: 12,
  },
  section: { marginTop: 8 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  mission: { fontSize: 14.5, color: TEXT_SECONDARY, lineHeight: 20 },
  rowInfo: { flexDirection: "row", gap: 12, marginTop: 14, flexWrap: "wrap" },
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
  infoValue: { fontSize: 14.5, color: TEXT_PRIMARY, fontWeight: "600" },
  link: { color: ACCENT },
  empty: { fontSize: 14, color: "#6B7280", textAlign: "center" },
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
  eventHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  eventName: {
    fontSize: 16.5,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  eventMeta: { fontSize: 13.5, color: "#6B7280", marginBottom: 4 },
  eventLocation: { fontSize: 13.5, color: TEXT_SECONDARY },
  chevron: { fontSize: 18, color: "#9CA3AF", marginTop: 2 },
  eventBody: { marginTop: 12 },
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
  slotsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slot: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  slotText: { fontSize: 13, color: TEXT_SECONDARY, fontWeight: "600" },
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

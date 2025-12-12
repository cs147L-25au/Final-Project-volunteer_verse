import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { supabase } from "../../utils/supabase";

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

export default function Calendar() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();

  const [events, setEvents] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getUserId = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    const userId = data.user?.id;
    if (!userId) throw new Error("Not signed in");
    return userId;
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      // 1) get user's registrations
      const { data: regs, error: erErr } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", userId);
      if (erErr) throw erErr;

      const eventIds = (regs ?? []).map((r: any) => r.event_id);
      if (eventIds.length === 0) {
        setEvents([]);
        return;
      }

      // 2) fetch events
      const { data: evRows, error: evErr } = await supabase
        .from("events")
        .select("id,name,location,start_at,end_at,org_id")
        .in("id", eventIds)
        .order("start_at", { ascending: true });
      if (evErr) throw evErr;

      // 3) fetch org names for these events
      const orgIds = Array.from(
        new Set((evRows ?? []).map((e: any) => e.org_id).filter(Boolean))
      );
      let orgMap: Record<string, string> = {};
      if (orgIds.length > 0) {
        const { data: orgRows, error: orgErr } = await supabase
          .from("Org_info")
          .select("id, org_name")
          .in("id", orgIds);
        if (orgErr) throw orgErr;
        orgMap = (orgRows ?? []).reduce(
          (acc: Record<string, string>, r: any) => {
            acc[String(r.id)] = r.org_name ?? "Organization";
            return acc;
          },
          {}
        );
      }

      const mapped: RegisteredEvent[] = (evRows ?? []).map((e: any) => ({
        id: e.id,
        orgName: orgMap[String(e.org_id)] ?? "Organization",
        eventName: e.name ?? "Untitled event",
        location: e.location ?? "",
        startISO: e.start_at,
        endISO: e.end_at,
      }));

      setEvents(mapped);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to load calendar");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getUserId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleCancel = async (eventId: string, eventName: string) => {
    try {
      const userId = await getUserId();
      Alert.alert(
        "Cancel Registration",
        `Are you sure you want to cancel your spot for "${eventName}"?`,
        [
          { text: "No", style: "cancel" },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              const { error } = await supabase
                .from("event_registrations")
                .delete()
                .eq("event_id", eventId)
                .eq("user_id", userId);
              if (error) {
                Alert.alert("Error", error.message ?? "Failed to cancel");
                return;
              }
              setEvents((prev) => prev.filter((e) => e.id !== eventId));
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Not signed in");
    }
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

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator color={ACCENT} />
        <Text style={{ marginTop: 8, color: TEXT_SECONDARY }}>
          Loading your events…
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
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

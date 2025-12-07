import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";

type AreaKey =
  | "environment"
  | "education"
  | "health"
  | "animals"
  | "community"
  | "marginalized";

type Org = {
  id: string;
  name: string;
  mission: string;
  sizeLabel: string;
  location: string;
  areas: AreaKey[];
  image: string;
};

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";
const HEART = "#EF4444";

const AREA_COLORS: Record<AreaKey, string> = {
  environment: "#22C55E",
  education: "#F59E0B",
  health: "#EF4444",
  animals: "#0D9488",
  community: "#8B5CF6",
  marginalized: "#F472B6",
};

function chipBg(hex: string, alpha = 0.16) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Example data; replace with fetch from your backend
const ORGANIZATIONS: Org[] = [
  {
    id: "org-1",
    name: "Green Horizons",
    mission: "Restoring local habitats and promoting sustainable living.",
    sizeLabel: "30–100 members",
    location: "San Jose",
    areas: ["environment", "community"],
    image:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=200&q=60",
  },
  {
    id: "org-2",
    name: "Bright Minds",
    mission: "Tutoring and after-school programs for underserved youth.",
    sizeLabel: "10–30 members",
    location: "Sunnyvale",
    areas: ["education", "marginalized"],
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&q=60",
  },
  {
    id: "org-3",
    name: "Health for All",
    mission: "Community health screenings and wellness workshops.",
    sizeLabel: "100+ members",
    location: "Mountain View",
    areas: ["health", "community"],
    image:
      "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=200&q=60",
  },
  {
    id: "org-4",
    name: "Wildlife Watch",
    mission: "Protecting local fauna and rescuing endangered species.",
    sizeLabel: "10+ members",
    location: "Palo Alto",
    areas: ["animals", "environment"],
    image:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200&q=60",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [search, setSearch] = useState("");
  const filteredData = useMemo(() => {
    const base = showLikedOnly
      ? ORGANIZATIONS.filter((o) => liked.has(o.id))
      : ORGANIZATIONS;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((o) => matchesOrg(o, q));
  }, [showLikedOnly, liked, search]);

  const data = useMemo(
    () =>
      showLikedOnly
        ? ORGANIZATIONS.filter((o) => liked.has(o.id))
        : ORGANIZATIONS,
    [showLikedOnly, liked]
  );

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderItem = ({ item }: { item: Org }) => {
    const isLiked = liked.has(item.id);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/${item.id}`)}
        style={styles.row}
      >
        <Image source={{ uri: item.image }} style={styles.logo} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.mission} numberOfLines={2}>
            {item.mission}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {item.sizeLabel} • {item.location}
            </Text>
          </View>
          <View style={styles.chips}>
            {item.areas.map((a) => (
              <View
                key={a}
                style={[
                  styles.chip,
                  {
                    backgroundColor: chipBg(AREA_COLORS[a]),
                    borderColor: AREA_COLORS[a],
                  },
                ]}
              >
                <View
                  style={[styles.dot, { backgroundColor: AREA_COLORS[a] }]}
                />
                <Text style={styles.chipLabel}>{labelForArea(a)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Card heart button */}
        <CardHeart liked={isLiked} onToggle={() => toggleLike(item.id)} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Non-routing header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Volunteer Verse</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>

          {/* NEW: Calendar Button */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/calendar")}
          >
            <Text style={styles.iconText}>📅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, showLikedOnly && { borderColor: HEART }]}
            onPress={() => setShowLikedOnly((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={[styles.iconText, showLikedOnly && { color: HEART }]}>
              {showLikedOnly ? "♥" : "♡"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, mission, domain, or location"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function CardHeart({
  liked,
  onToggle,
}: {
  liked: boolean;
  onToggle: () => void;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  const press = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.15,
        useNativeDriver: true,
        friction: 3,
        tension: 200,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        tension: 220,
      }),
    ]).start();
    onToggle();
  };

  return (
    <TouchableOpacity
      style={styles.cardHeartWrap}
      onPress={press}
      activeOpacity={0.85}
    >
      <Animated.View
        style={[
          styles.cardHeart,
          { transform: [{ scale }] },
          liked && { borderColor: HEART, shadowOpacity: 0.12 },
        ]}
      >
        <Text
          style={[
            styles.iconText,
            liked ? { color: HEART } : { color: "#9CA3AF" },
          ]}
        >
          {liked ? "♥" : "♡"}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function labelForArea(a: AreaKey) {
  switch (a) {
    case "environment":
      return "Environment";
    case "education":
      return "Education";
    case "health":
      return "Health";
    case "animals":
      return "Animals";
    case "community":
      return "Community Outreach";
    case "marginalized":
      return "Marginalized Groups";
  }
}

function matchesOrg(org: Org, q: string) {
  const fields = [
    org.name,
    org.mission,
    org.location,
    ...org.areas.map(labelForArea),
  ];
  return fields.some((t) => t.toLowerCase().includes(q));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: "10%",
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BG,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
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
  row: {
    position: "relative",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  info: {
    flex: 1,
    paddingRight: 48, // leave space so heart doesn’t overlap text
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  mission: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  metaRow: {
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipLabel: {
    fontSize: 12.5,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  separator: {
    height: 12,
  },
  cardHeartWrap: {
    position: "absolute",
    right: 12,
    bottom: 12,
  },
  cardHeart: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: TEXT_PRIMARY,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
});

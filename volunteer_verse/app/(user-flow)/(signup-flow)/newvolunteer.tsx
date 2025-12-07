// SECOND PAGE OF SIGNUP, user selects the areas they are interested in impacting.
import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

type AreaKey =
  | "environment"
  | "education"
  | "health"
  | "animals"
  | "community"
  | "marginalized";

const AREAS: { key: AreaKey; label: string; color: string }[] = [
  { key: "environment", label: "Environment", color: "#22C55E" }, // eco-green
  { key: "education", label: "Education", color: "#F59E0B" }, // pencil-yellow
  { key: "health", label: "Health", color: "#EF4444" }, // red
  { key: "animals", label: "Animals", color: "#0D9488" }, // jungle green
  { key: "community", label: "Community Outreach", color: "#8B5CF6" }, // purple
  { key: "marginalized", label: "Marginalized Groups", color: "#F472B6" }, // pink
];

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

// helper: convert hex to rgba with alpha
function hexToRgba(hex: string, alpha = 0.14) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return "rgba(${r}, ${g}, ${b}, ${alpha})";
}

export default function NewVolunteer() {
  const [selected, setSelected] = useState<AreaKey[]>([]);
  const router = useRouter();

  const allKeys = useMemo(() => AREAS.map((a) => a.key), []);

  const toggle = (key: AreaKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => setSelected(allKeys);
  const selectNone = () => setSelected([]);

  const canContinue = selected.length > 0;

  const handleNext = () => {
    if (!canContinue) return;
    router.push("/userinfo");
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/signup");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={goBack}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>
          What areas are you most interested in impacting?
        </Text>
        {!canContinue && (
          <Text style={styles.hint}>Select at least one area to continue</Text>
        )}

        <View style={styles.grid}>
          {AREAS.map((area) => {
            const isSelected = selected.includes(area.key);
            return (
              <TouchableOpacity
                key={area.key}
                activeOpacity={0.9}
                onPress={() => toggle(area.key)}
                style={[
                  styles.chip,
                  isSelected && {
                    backgroundColor: hexToRgba(area.color, 0.16),
                    borderColor: area.color,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: area.color },
                    !isSelected && { opacity: 0.35 },
                  ]}
                />
                <Text
                  style={[
                    styles.chipLabel,
                    isSelected && { color: TEXT_PRIMARY },
                  ]}
                >
                  {area.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={selectAll} activeOpacity={0.7}>
            <Text style={styles.actionText}>Select all</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>•</Text>
          <TouchableOpacity onPress={selectNone} activeOpacity={0.7}>
            <Text style={styles.actionText}>Select none</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    paddingHorizontal: 20,
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
  content: {
    flex: 1,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: "#DC2626",
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginTop: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 6,
    marginVertical: 6,
    minWidth: "44%",
    gap: 8,
    // shadow for iOS
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    // elevation for Android
    elevation: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chipLabel: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    fontWeight: "600",
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  actionText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

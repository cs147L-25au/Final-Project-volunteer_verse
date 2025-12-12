// STEP 1: Select Role (Volunteer/Org)
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

type Role = "volunteer" | "organization" | null;

export default function Usertype() {
  const [role, setRole] = useState<Role>(null);
  const router = useRouter();

  const handleNext = () => {
    if (!role) return;
    if (role === "volunteer") {
      router.push("/newvolunteer");
    } else {
      // Org signups: create account first, then continue to org details
      router.push({
        pathname: "/accountinfo",
        params: { role: "organization", next: "neworganization" },
      });
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
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
        <Text style={styles.title}>I am a...</Text>
        <View style={styles.card}>
          <RadioOption
            label="Volunteer"
            selected={role === "volunteer"}
            onPress={() => setRole("volunteer")}
          />
          <RadioOption
            label="Organization"
            selected={role === "organization"}
            onPress={() => setRole("organization")}
          />
        </View>
      </View>

      {role && (
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

function RadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
      activeOpacity={0.9}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text
        style={[styles.optionLabel, selected && styles.optionLabelSelected]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    paddingTop: 24,
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  optionSelected: {
    borderColor: ACCENT + "55",
    backgroundColor: ACCENT + "10",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: ACCENT,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
  },
  optionLabel: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontWeight: "600",
  },
  optionLabelSelected: {
    color: TEXT_PRIMARY,
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

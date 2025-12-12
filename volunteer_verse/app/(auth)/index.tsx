import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/utils/supabase";

const COLORS = {
  cream: "#F2F0E9",
  lightBlue: "#97B1D6",
  mediumBlue: "#567FB1",
  darkBlue: "#324A76",
  white: "#FFFFFF",
};

type Role = "volunteer" | "organization";

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isDisabled = loading || !role || !email || !password;

  const signInWithEmail = async () => {
    if (!role)
      return Alert.alert("Choose a role", "Select volunteer or organization.");
    if (!email || !password)
      return Alert.alert("Missing info", "Enter your email and password.");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) throw error || new Error("No user returned.");
      const userId = data.user.id;
      const orgBool = role === "organization";

      const { data: existing, error: fetchErr } = await supabase
        .from("user_info_")
        .select("id")
        .eq("user_auth_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (fetchErr) throw new Error(fetchErr.message);

      const id = existing?.[0]?.id as number | undefined;
      if (id) {
        const { error: updErr } = await supabase
          .from("user_info_")
          .update({ org_bool: orgBool })
          .eq("id", id);
        if (updErr) throw new Error(updErr.message);
      } else {
        const { error: insErr } = await supabase
          .from("user_info_")
          .insert({ user_auth_id: userId, org_bool: orgBool });
        if (insErr) throw new Error(insErr.message);
      }

      router.replace(orgBool ? "/orgdashboard" : "/homepage");
    } catch (e: any) {
      Alert.alert("Login failed", e.message ?? "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      {/* Fixed header (doesn't move with keyboard) */}
      <View style={styles.header}>
        <Text style={styles.title}>VolunteerVerse</Text>
        <Text style={styles.subhead}>Log in to start helping out</Text>
      </View>

      {/* Form: ScrollView adjusts insets for keyboard; no KAV to avoid layout jumps */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <Image
            source={require("../../assets/VV_Logo.jpg")}
            style={styles.logo}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Log in as</Text>
          <View style={styles.row}>
            <RoleButton
              text="Volunteer"
              selected={role === "volunteer"}
              onPress={() => setRole("volunteer")}
            />
            <RoleButton
              text="Organization"
              selected={role === "organization"}
              onPress={() => setRole("organization")}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@address.com"
            placeholderTextColor="#7A93B8"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#7A93B8"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          onPress={signInWithEmail}
          disabled={isDisabled}
          style={[styles.primaryBtn, isDisabled && styles.primaryBtnDisabled]}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryText}>
            {loading
              ? "Signing you in..."
              : role
              ? `Sign in as ${
                  role === "volunteer" ? "Volunteer" : "Organization"
                }`
              : "Choose a role to continue"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(signup)")}
          activeOpacity={0.8}
          style={{ alignItems: "center", marginTop: 14 }}
        >
          <Text style={styles.link}>New user? Sign up here</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function RoleButton({
  text,
  selected,
  onPress,
}: {
  text: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.roleBtn, selected && styles.roleBtnSelected]}
    >
      <Text style={[styles.roleText, selected && styles.roleTextSelected]}>
        {text}
      </Text>
      <Text style={[styles.roleSub, selected && styles.roleSubSelected]}>
        {text === "Volunteer" ? "Find opportunities." : "Manage events."}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: { alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 40, fontWeight: "800", color: COLORS.darkBlue },
  subhead: { marginTop: 6, color: "#7A93B8", fontSize: 16, fontWeight: "600" },

  content: { paddingHorizontal: 24 },

  logoWrap: { alignItems: "center", marginTop: 10, marginBottom: 20 },
  logo: { width: 132, height: 132, borderRadius: 66, resizeMode: "contain" },

  card: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    color: COLORS.darkBlue,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  row: { flexDirection: "row", gap: 10 },

  roleBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  roleBtnSelected: { borderColor: COLORS.darkBlue, backgroundColor: "#E3EBF5" },
  roleText: {
    color: "#7A93B8",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleTextSelected: { color: COLORS.darkBlue },
  roleSub: { color: "#6B7280", fontSize: 12, textAlign: "center" },
  roleSubSelected: { color: COLORS.darkBlue },

  input: {
    backgroundColor: COLORS.white,
    color: COLORS.darkBlue,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
  },

  primaryBtn: {
    backgroundColor: COLORS.mediumBlue,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnDisabled: { backgroundColor: "#CBD5E1" },
  primaryText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },

  link: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

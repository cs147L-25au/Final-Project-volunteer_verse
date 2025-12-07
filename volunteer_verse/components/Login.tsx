import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../utils/supabase";

// New Color Palette
const COLORS = {
  cream: "#F2F0E9",
  lightBlue: "#97B1D6",
  mediumBlue: "#567FB1",
  darkBlue: "#324A76",
  black: "#000000",
  white: "#FFFFFF",
};

type Role = "volunteer" | "organization";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  const signInWithEmail = async () => {
    if (!role) {
      Alert.alert(
        "Choose a role",
        "Select volunteer or organization to continue."
      );
      return;
    }
    if (!email || !password) {
      Alert.alert("Missing info", "Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError || !authData.user) {
        throw authError || new Error("No user returned from Supabase.");
      }

      const userId = authData.user.id;
      const orgBool = role === "organization";

      const { data: existingInfo, error: fetchInfoError } = await supabase
        .from("user_info_")
        .select("id")
        .eq("user_auth_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchInfoError) {
        throw new Error(fetchInfoError.message);
      }

      const existingId = existingInfo?.[0]?.id as number | undefined;

      if (existingId) {
        const { error: updateError } = await supabase
          .from("user_info_")
          .update({ org_bool: orgBool })
          .eq("id", existingId);

        if (updateError) {
          throw new Error(updateError.message);
        }
      } else {
        const { error: insertError } = await supabase
          .from("user_info_")
          .insert({
            user_auth_id: userId,
            org_bool: orgBool,
          });

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      const destination = orgBool ? "/orgdashboard" : "/homepage";
      router.replace(destination);
    } catch (err) {
      console.error("Supabase sign-in failed:", err);
      Alert.alert(
        "Login failed",
        err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isSignInDisabled =
    loading || !role || email.length === 0 || password.length === 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />

      {/* Top Section: Title */}
      <View style={styles.topSection}>
        <Text style={styles.splashText}>VolunteerVerse</Text>
        <Text style={styles.subhead}>Log in to start helping out</Text>
      </View>

      {/* Middle Section: Form (Centered) */}
      <ScrollView
        contentContainerStyle={styles.middleSection}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Log in as</Text>
          <View style={styles.rolesRow}>
            <RoleCard
              label="Volunteer"
              description="Find opportunities."
              selected={role === "volunteer"}
              onPress={() => setRole("volunteer")}
            />
            <RoleCard
              label="Organization"
              description="Manage events."
              selected={role === "organization"}
              onPress={() => setRole("organization")}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Email</Text>
          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            placeholderTextColor={COLORS.mediumBlue}
            autoCapitalize={"none"}
            style={styles.input}
          />
          <Text style={[styles.sectionLabel, styles.labelSpacing]}>
            Password
          </Text>
          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            placeholder="Password"
            placeholderTextColor={COLORS.mediumBlue}
            secureTextEntry={true}
            autoCapitalize={"none"}
            style={styles.input}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={signInWithEmail}
            disabled={isSignInDisabled}
            style={[
              styles.signInButton,
              isSignInDisabled && styles.signInButtonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Signing you in..."
                : role
                ? `Sign in as ${
                    role === "volunteer" ? "Volunteer" : "Organization"
                  }`
                : "Choose a role to continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Section: Sign Up Link */}
      <View style={styles.bottomSection}>
        <TouchableOpacity onPress={() => router.navigate("/usertype")}>
          <Text style={styles.secondaryText}>New user? Sign up here</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function RoleCard({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.roleCard, selected && styles.roleCardSelected]}
    >
      <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>
        {label}
      </Text>
      <Text
        style={[
          styles.roleDescription,
          selected && styles.roleDescriptionSelected,
        ]}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  topSection: {
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  middleSection: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  bottomSection: {
    paddingBottom: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  splashText: {
    fontWeight: "800",
    color: COLORS.darkBlue,
    fontSize: 42,
    textAlign: "center",
  },
  subhead: {
    marginTop: 8,
    color: COLORS.mediumBlue,
    fontSize: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionLabel: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  rolesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 12,
    alignItems: "center",
  },
  roleCardSelected: {
    borderColor: COLORS.darkBlue,
    backgroundColor: "#E3EBF5",
  },
  roleLabel: {
    color: COLORS.mediumBlue,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleLabelSelected: {
    color: COLORS.darkBlue,
  },
  roleDescription: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
  },
  roleDescriptionSelected: {
    color: COLORS.darkBlue,
  },
  labelSpacing: {
    marginTop: 16,
  },
  input: {
    color: COLORS.darkBlue,
    backgroundColor: COLORS.white,
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 10,
  },
  signInButton: {
    backgroundColor: COLORS.mediumBlue,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.mediumBlue,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  signInButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryText: {
    color: COLORS.darkBlue,
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

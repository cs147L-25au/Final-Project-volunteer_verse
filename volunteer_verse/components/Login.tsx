// FIRST PAGE OF THE APP.
// The user can login as a volunteer or organization,
// or choose to make a new account.
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Text,
  Alert,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Theme from "../assets/theme";
import { supabase } from "../utils/supabase";

type Role = "volunteer" | "organization";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  const signInWithEmail = async () => {
    if (!role) {
      Alert.alert("Choose a role", "Select volunteer or organization to continue.");
      return;
    }
    if (!email || !password) {
      Alert.alert("Missing info", "Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signInWithPassword({
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
        const { error: insertError } = await supabase.from("user_info_").insert({
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
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.splash}>
          <Text style={styles.splashText}>Volunteer Verse</Text>
          <Text style={styles.subhead}>Log in to start helping out</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Log in as</Text>
          <View style={styles.rolesRow}>
            <RoleCard
              label="Volunteer"
              description="Find opportunities and track your impact."
              selected={role === "volunteer"}
              onPress={() => setRole("volunteer")}
            />
            <RoleCard
              label="Organization"
              description="Share opportunities and manage volunteers."
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
            placeholderTextColor={Theme.colors.textSecondary}
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
            placeholderTextColor={Theme.colors.textSecondary}
            secureTextEntry={true}
            autoCapitalize={"none"}
            style={styles.input}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={signInWithEmail}
            disabled={isSignInDisabled}
          >
            <Text
              style={[
                styles.button,
                isSignInDisabled ? styles.buttonDisabled : undefined,
              ]}
            >
              {loading
                ? "Signing you in..."
                : role
                ? `Sign in as ${role === "volunteer" ? "Volunteer" : "Organization"}`
                : "Choose a role to continue"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryAction}>
          <TouchableOpacity onPress={() => router.navigate("/signup")}>
            <Text style={styles.secondaryText}>New user? Sign up here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: Theme.colors.backgroundPrimary,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  splash: {
    alignItems: "center",
    marginBottom: 4,
  },
  splashText: {
    fontWeight: "bold",
    color: Theme.colors.textPrimary,
    fontSize: 60,
  },
  subhead: {
    marginTop: 8,
    color: Theme.colors.textSecondary,
    fontSize: 16,
  },
  card: {
    backgroundColor: Theme.colors.backgroundSecondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.tabBarBorder,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  sectionLabel: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  rolesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleCard: {
    width: "48%",
    backgroundColor: Theme.colors.backgroundPrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.tabBarBorder,
    padding: 12,
  },
  roleCardSelected: {
    borderColor: Theme.colors.textHighlighted,
    backgroundColor: "#2e2e2e",
  },
  roleLabel: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  roleLabelSelected: {
    color: Theme.colors.textHighlighted,
  },
  roleDescription: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  roleDescriptionSelected: {
    color: Theme.colors.textPrimary,
  },
  labelSpacing: {
    marginTop: 12,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  verticallySpaced: {
    marginVertical: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    color: Theme.colors.textPrimary,
    backgroundColor: Theme.colors.backgroundSecondary,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderColor: Theme.colors.tabBarBorder,
    borderWidth: 1,
  },
  button: {
    color: Theme.colors.textHighlighted,
    fontSize: 18,
    fontWeight: "normal",
    padding: 8,
    textAlign: "center",
  },
  buttonDisabled: {
    color: Theme.colors.textSecondary,
  },
  secondaryAction: {
    alignItems: "center",
    marginTop: 12,
  },
  secondaryText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});

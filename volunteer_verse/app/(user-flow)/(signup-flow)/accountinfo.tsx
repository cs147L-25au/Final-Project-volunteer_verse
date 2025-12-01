import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";

export default function AccountInfo() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const showConfirm = password.length > 0;
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const canContinue = Boolean(username.trim() && password && passwordsMatch);

  const handleNext = () => {
    if (!canContinue) return;
    router.replace("/(user-flow)"); // login screen
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Let's create your account</Text>
        <View style={styles.fieldGroup}>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            secureTextEntry
            style={styles.input}
          />

          {showConfirm && (
            <>
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm password"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                secureTextEntry
                style={styles.input}
              />
              {confirm.length > 0 && password !== confirm && (
                <Text style={styles.hint}>
                  Passwords must match to continue
                </Text>
              )}
            </>
          )}
        </View>

        {!canContinue && (
          <Text style={styles.hint}>
            Please fill out all of the information to proceed
          </Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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

/* Supabase username check (commented until DB is set up)

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL!, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!);

const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);

useEffect(() => {
let active = true;
const check = async () => {
const u = username.trim();
if (!u) return setUsernameStatus(null);
setUsernameStatus('checking');
const { data, error } = await supabase
.from('profiles')           // adjust table and column
.select('username')
.eq('username', u)
.maybeSingle();
if (!active) return;
if (error) {
  setUsernameStatus(null); // optionally handle error
  return;
}
setUsernameStatus(data ? 'taken' : 'available');
};

const t = setTimeout(check, 350); // debounce
return () => {
active = false;
clearTimeout(t);
};
}, [username]);

// UI next to the username input:
// {usernameStatus === 'taken' && <Text style={styles.statusTaken}>This username is already taken, please try something else</Text>}
// {usernameStatus === 'available' && <Text style={styles.statusOk}>This username is available</Text>}

*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  fieldGroup: {
    gap: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: TEXT_PRIMARY,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  hint: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 8,
  },
  nextButton: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 16,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statusTaken: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 6,
  },
  statusOk: {
    fontSize: 12,
    color: "#16A34A",
    marginTop: 6,
  },
});

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase";

const ACCENT = "#5865F2";
const BG = "#F5F7FB";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#4B5563";
const BORDER = "#E5E7EB";
const DANGER = "#EF4444";
const API_KEY = "31527b89b5c5fa4b67a22629fabe2e1a";


type AreaKey =
  | "environment"
  | "education"
  | "health"
  | "animals"
  | "community"
  | "marginalized";
const AREAS = [
  { key: "environment", label: "Environment", color: "#22C55E" },
  { key: "education", label: "Education", color: "#F59E0B" },
  { key: "health", label: "Health", color: "#EF4444" },
  { key: "animals", label: "Animals", color: "#0D9488" },
  { key: "community", label: "Community Outreach", color: "#8B5CF6" },
  { key: "marginalized", label: "Marginalized Groups", color: "#F472B6" },
];

type OrgRow = {
  id: number;
  org_name: string | null;
  mission_statement: string | null;
  location: string | null;
  image_url: string | null;
  Environment?: boolean | null;
  Health?: boolean | null;
  Education?: boolean | null;
  Animals?: boolean | null;
  Outreach?: boolean | null;
  Marginalized_group?: boolean | null;
};
type VolRow = {
  id: number;
  "First Name": string | null;
  "Last Name": string | null;
  location: string | null;
  image_url: string | null;
  Environment?: boolean | null;
  Health?: boolean | null;
  Education?: boolean | null;
  Animals?: boolean | null;
  Outreach?: boolean | null;
  Marginalized_group?: boolean | null;
};
const AREA_COLUMN_MAP: Record<AreaKey, keyof OrgRow & keyof VolRow> = {
  environment: "Environment",
  education: "Education",
  health: "Health",
  animals: "Animals",
  community: "Outreach",
  marginalized: "Marginalized_group",
};
const rgba = (hex: string, a = 0.16) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};
function extFromUriOrMime(uri: string, mime?: string) {
  const fromMime = mime?.includes("png")
    ? "png"
    : mime?.includes("webp")
    ? "webp"
    : mime?.includes("jpeg") || mime?.includes("jpg")
    ? "jpg"
    : undefined;
  const fromUri = uri
    .split("?")[0]
    .split("#")[0]
    .split(".")
    .pop()
    ?.toLowerCase();
  return (
    fromMime ||
    (fromUri === "jpeg" || fromUri === "jpg"
      ? "jpg"
      : fromUri === "png" || fromUri === "webp"
      ? fromUri!
      : "jpg")
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const topPadding = Math.max(16, headerHeight * 0.25);
  const { type } = useLocalSearchParams<{ type?: string }>();
  const isOrg = type === "org";

  // Volunteer
  const [vPhoto, setVPhoto] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [vLocation, setVLocation] = useState("");
  const [valId, setValId] = useState<number | null>(null);

  // Organization
  const [oLogo, setOLogo] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [location, setLocation] = useState("");
  const [mission, setMission] = useState("");
  const [orgId, setOrgId] = useState<number | null>(null);

  const [interests, setInterests] = useState<AreaKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [weather, setWeather] = useState<any | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const profileLocation = (isOrg ? location : vLocation)?.trim() ?? "";

  const getUserId = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const userId = data.session?.user?.id;
    if (!userId) throw new Error("Not authenticated");
    return userId;
  }, []);

  const changeAvatar = async () => {
    try {
      const userId = await getUserId();
      const choice = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (choice.canceled || !choice.assets?.[0]?.uri) return;
      await uploadAvatar(choice.assets[0].uri, userId, isOrg);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Unable to change photo.");
    }
  };

  // FIX: use arrayBuffer rather than blob for React Native
  const uploadAvatar = async (
    uri: string,
    userId: string,
    isOrgMode: boolean
  ) => {
    try {
      setUploadingAvatar(true);
      const res = await fetch(uri);
      const arrayBuffer = await res.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);
      const mime = (res.headers.get("Content-Type") as string) || "image/jpeg";
      const ext = extFromUriOrMime(uri, mime);
      const path = `profiles/${userId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, fileBytes, { contentType: mime, upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      if (isOrgMode) {
        const { error } = await supabase
          .from("Org_info")
          .update({ image_url: publicUrl })
          .eq("User_id", userId);
        if (error) throw error;
        setOLogo(publicUrl);
      } else {
        const { error } = await supabase
          .from("val_info_")
          .update({ image_url: publicUrl })
          .eq("User_id", userId);
        if (error) throw error;
        setVPhoto(publicUrl);
      }

      Alert.alert("Photo updated", "Your profile photo was updated.");
    } catch (e: any) {
      Alert.alert("Upload failed", e.message ?? "Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const toggleInterest = (key: AreaKey) =>
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const userId = await getUserId();
        if (isOrg) {
          const { data: org, error } = await supabase
            .from("Org_info")
            .select(
              "id, org_name, mission_statement, location, image_url, Environment, Health, Education, Animals, Outreach, Marginalized_group"
            )
            .eq("User_id", userId)
            .maybeSingle();
          if (error) throw error;
          if (!org || !active) return;
          setOrgId(org.id ?? null);
          setOrgName(org.org_name ?? "");
          setLocation(org.location ?? "");
          setMission(org.mission_statement ?? "");
          setOLogo(org.image_url ?? null);
          setInterests(
            Object.entries(AREA_COLUMN_MAP)
              .filter(([, col]) => Boolean((org as OrgRow)[col]))
              .map(([k]) => k as AreaKey)
          );
        } else {
          const { data: vol, error } = await supabase
            .from("val_info_")
            .select(
              'id, "First Name", "Last Name", location, image_url, Environment, Health, Education, Animals, Outreach, "Marginalized_group"'
            )
            .eq("User_id", userId)
            .maybeSingle();
          if (error) throw error;
          if (!vol || !active) return;

          setValId(vol.id ?? null);
          setFirstName((vol["First Name"] as string | null) ?? "");
          setLastName((vol["Last Name"] as string | null) ?? "");
          setVLocation(vol.location ?? "");
          setVPhoto(vol.image_url ?? null);
          setInterests(
            Object.entries(AREA_COLUMN_MAP)
              .filter(([, col]) => Boolean((vol as VolRow)[col]))
              .map(([k]) => k as AreaKey)
          );
        }
      } catch (err: any) {
        Alert.alert(
          "Unable to load profile",
          err.message ?? "Please try again."
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [isOrg, getUserId]);

  useEffect(() => {
    if (!profileLocation) {
      setWeather(null);
      setWeatherError(null);
      return;
    }
    let active = true;
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            profileLocation
          )}&appid=${API_KEY}&units=imperial`
        );
        const data = await res.json();
        if (data.cod !== 200) throw new Error(data.message);
        if (active) {
          setWeather(data);
          setWeatherError(null);
        }
      } catch (err: any) {
        if (!active) return;
        setWeather(null);
        setWeatherError(err.message ?? "Unable to load weather");
      } finally {
        if (active) setWeatherLoading(false);
      }
    };
    fetchWeather();
    return () => {
      active = false;
    };
  }, [profileLocation]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const userId = await getUserId();
      const interestPayload = Object.fromEntries(
        Object.entries(AREA_COLUMN_MAP).map(([k, col]) => [
          col,
          interests.includes(k as AreaKey),
        ])
      );
      if (isOrg) {
        const payload = {
          User_id: userId,
          org_name: orgName.trim() || null,
          mission_statement: mission.trim() || null,
          location: location.trim() || null,
          image_url: oLogo,
          ...interestPayload,
        };

        if (orgId) {
          const { error } = await supabase
            .from("Org_info")
            .update(payload)
            .eq("id", orgId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("Org_info")
            .insert([payload])
            .select("id")
            .maybeSingle();
          if (error) throw error;
          if (data?.id) setOrgId(data.id);
        }

        const { data: existing } = await supabase
          .from("user_info_")
          .select("id")
          .eq("user_auth_id", userId)
          .limit(1);
        if (existing?.[0]?.id)
          await supabase
            .from("user_info_")
            .update({ org_bool: true })
            .eq("id", existing[0].id);
        else
          await supabase
            .from("user_info_")
            .insert({ user_auth_id: userId, org_bool: true });
      } else {
        const payload = {
          User_id: userId,
          "First Name": firstName.trim() || null,
          "Last Name": lastName.trim() || null,
          location: vLocation.trim() || null,
          image_url: vPhoto,
          ...interestPayload,
        };

        if (valId) {
          const { error } = await supabase
            .from("val_info_")
            .update(payload)
            .eq("id", valId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from("val_info_")
            .insert([payload])
            .select("id")
            .maybeSingle();
          if (error) throw error;
          if (data?.id) setValId(data.id);
        }

        const { data: existing } = await supabase
          .from("user_info_")
          .select("id")
          .eq("user_auth_id", userId)
          .limit(1);
        if (existing?.[0]?.id)
          await supabase
            .from("user_info_")
            .update({ org_bool: false })
            .eq("id", existing[0].id);
        else
          await supabase
            .from("user_info_")
            .insert({ user_auth_id: userId, org_bool: false });
      }

      Alert.alert("Success", "Your profile has been updated.");
    } catch (err: any) {
      Alert.alert("Unable to save", err.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/(auth)");
    } catch (err: any) {
      Alert.alert("Error signing out", err.message ?? "Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarRow}>
          <TouchableOpacity
            onPress={changeAvatar}
            style={styles.avatarContainer}
            activeOpacity={0.85}
          >
            {isOrg ? (
              oLogo ? (
                <Image source={{ uri: oLogo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarPlaceholderText}>ORG</Text>
                </View>
              )
            ) : vPhoto ? (
              <Image source={{ uri: vPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarPlaceholderText}>
                  {`${firstName[0] || ""}${lastName[0] || ""}` || "?"}
                </Text>
              </View>
            )}
            <View style={styles.editIconBadge}>
              <Text style={styles.editIconText}>
                {uploadingAvatar ? "…" : "✎"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.weatherWrapper}>
          {!profileLocation ? (
            <View style={[styles.weatherCard, styles.weatherErrorCard]}>
              <Text style={styles.weatherErrorText}>
                Add your city or region to see the current weather.
              </Text>
            </View>
          ) : weatherLoading ? (
            <View style={styles.weatherCard}>
              <ActivityIndicator color={ACCENT} />
              <Text style={styles.weatherLoadingText}>Fetching weather...</Text>
            </View>
          ) : weather ? (
            <View style={styles.weatherCard}>
              <View>
                <Text style={styles.weatherCity}>
                  {weather?.name || profileLocation}
                </Text>
                <Text style={styles.weatherDescription}>
                  {weather?.weather?.[0]?.description
                    ? weather.weather[0].description.replace(
                        /\b\w/g,
                        (c: string) => c.toUpperCase()
                      )
                    : "Current conditions"}
                </Text>
                {typeof weather?.main?.temp === "number" && (
                  <Text style={styles.weatherTemp}>
                    {Math.round(weather.main.temp)}
                    <Text style={styles.weatherUnit}>{`\u00B0F`}</Text>
                  </Text>
                )}
              </View>
              {weather?.weather?.[0]?.icon && (
                <Image
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                  }}
                  style={styles.weatherIcon}
                />
              )}
            </View>
          ) : (
            <View style={[styles.weatherCard, styles.weatherErrorCard]}>
              <Text style={styles.weatherErrorText}>
                {weatherError || "Unable to show the weather right now."}
              </Text>
            </View>
          )}
        </View>
        {isOrg ? (
          <View style={styles.formSection}>
            <Field label="Organization Name">
              <TextInput
                value={orgName}
                onChangeText={setOrgName}
                style={styles.input}
              />
            </Field>
            <Field label="City / Region">
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. San Jose, CA"
                style={styles.input}
              />
            </Field>
            <Field label="Mission Statement">
              <TextInput
                value={mission}
                onChangeText={setMission}
                multiline
                style={[styles.input, styles.textArea]}
              />
            </Field>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Field label="First Name">
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
              />
            </Field>
            <Field label="Last Name">
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
              />
            </Field>
            <Field label="City / Region">
              <TextInput
                value={vLocation}
                onChangeText={setVLocation}
                placeholder="e.g. San Jose, CA"
                style={styles.input}
              />
            </Field>
          </View>
        )}

        <Field label={isOrg ? "Interests / Focus Areas" : "Interests"}>
          <View style={styles.chipGrid}>
            {AREAS.map((area) => {
              const selected = interests.includes(area.key as AreaKey);
              return (
                <TouchableOpacity
                  key={area.key}
                  onPress={() =>
                    setInterests((prev) =>
                      selected
                        ? prev.filter((k) => k !== area.key)
                        : [...prev, area.key as AreaKey]
                    )
                  }
                  style={[
                    styles.chip,
                    selected && {
                      backgroundColor: rgba(area.color),
                      borderColor: area.color,
                    },
                  ]}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: area.color },
                      !selected && { opacity: 0.3 },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      selected && { color: TEXT_PRIMARY },
                    ]}
                  >
                    {area.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Field>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSave}
          style={styles.saveBtn}
          disabled={saving || uploadingAvatar}
        >
          <Text style={styles.saveText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          style={styles.signOutBtn}
          disabled={signingOut}
        >
          <Text style={styles.signOutText}>
            {signingOut ? "Signing out..." : "Sign Out"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24 },
  formSection: { gap: 16 },
  avatarRow: { alignItems: "center", marginBottom: 8 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: BORDER,
  },
  avatarPlaceholder: {
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: { fontSize: 32, fontWeight: "700", color: "#94A3B8" },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: ACCENT,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BG,
  },
  editIconText: { color: "#FFF", fontSize: 16, marginBottom: 2 },
  fieldGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: TEXT_SECONDARY },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  textArea: { minHeight: 100, textAlignVertical: "top", lineHeight: 22 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: "#FFF",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chipLabel: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: "500" },
  weatherWrapper: { marginBottom: 16 },
  weatherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  weatherCity: { fontSize: 16, color: TEXT_PRIMARY, fontWeight: "700" },
  weatherDescription: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 2 },
  weatherTemp: { fontSize: 32, fontWeight: "700", color: TEXT_PRIMARY, marginTop: 8 },
  weatherUnit: { fontSize: 16, fontWeight: "600", color: TEXT_SECONDARY },
  weatherIcon: { width: 72, height: 72, marginLeft: 12 },
  weatherLoadingText: { color: TEXT_SECONDARY, fontSize: 14 },
  weatherErrorCard: {
    backgroundColor: rgba("#94A3B8", 0.15),
    borderColor: "transparent",
  },
  weatherErrorText: { color: TEXT_SECONDARY, fontSize: 14, lineHeight: 20 },
  saveBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  signOutBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DANGER,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  signOutText: { color: DANGER, fontSize: 16, fontWeight: "700" },
});

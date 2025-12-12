import React from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerBackVisible: true,
        headerBackButtonDisplayMode: "default",
      }}
    >
      {/* Launch screen (usually redirect) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Auth group: root header shown */}
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: "#1F2937",
          headerShadowVisible: false,
          headerBlurEffect:
            Platform.OS === "ios" ? "systemMaterial" : undefined,
        }}
      />
      {/* Signup flow: root header shown */}
      <Stack.Screen
        name="(signup)"
        options={{
          headerShown: true,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: "#1F2937",
          headerShadowVisible: false,
          headerBlurEffect:
            Platform.OS === "ios" ? "systemMaterial" : undefined,
        }}
      />
      {/* Volunteer group: root header shown */}
      <Stack.Screen
        name="(volunteer)"
        options={{
          headerShown: false,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: "#1F2937",
          headerShadowVisible: false,
          headerBlurEffect:
            Platform.OS === "ios" ? "systemMaterial" : undefined,
        }}
      />
      {/* Organization group: root header shown */}
      <Stack.Screen
        name="(organization)"
        options={{
          headerShown: false,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: "#1F2937",
          headerShadowVisible: false,
          headerBlurEffect:
            Platform.OS === "ios" ? "systemMaterial" : undefined,
        }}
      />
      Edit event stack
      <Stack.Screen
        name="editevent"
        options={{
          headerShown: true,
          headerTitle: "Edit Event",
          headerTransparent: false,
          headerTintColor: "#1F2937",
        }}
      />
      {/* Profile stack */}
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          headerTitle: "Profile",
          headerTransparent: false,
          headerTintColor: "#5865F2",
          headerShadowVisible: false,
          headerBlurEffect:
            Platform.OS === "ios" ? "systemMaterial" : undefined,
        }}
      />
    </Stack>
  );
}

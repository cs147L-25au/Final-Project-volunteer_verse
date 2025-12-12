import React from "react";
import { Stack } from "expo-router";

export default function VolunteerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitle: "Back",
        headerBackVisible: true,
        headerBackButtonDisplayMode: "default",
      }}
    >
      {/* Launch screen (usually redirect) */}
      <Stack.Screen
        name="calendar"
        options={{ headerShown: true, headerTitle: "Calendar" }}
      />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: true, headerTitle: "Details" }}
      />
    </Stack>
  );
}

import React from "react";
import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitle: "Back",
        headerBackVisible: true,
        headerBackButtonDisplayMode: "default",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false, headerTitle: "Profile" }}
      />
    </Stack>
  );
}

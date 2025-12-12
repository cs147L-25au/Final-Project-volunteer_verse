import React from "react";
import { Stack } from "expo-router";

export default function OrgLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerBackVisible: true,
        headerBackButtonDisplayMode: "default",
      }}
    >
      <Stack.Screen
        name="orgdashboard"
        options={{ headerShown: false }}
      ></Stack.Screen>
      <Stack.Screen
        name="newevent"
        options={{ headerTitle: "Create a new event" }}
      />
    </Stack>
  );
}

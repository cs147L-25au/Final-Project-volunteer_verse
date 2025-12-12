import React from "react";
import { Stack } from "expo-router";

export default function EditEventLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerBackVisible: true,
        headerBackButtonDisplayMode: "default",
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{ headerShown: false, headerTitle: "Edit Event2" }}
      />
    </Stack>
  );
}

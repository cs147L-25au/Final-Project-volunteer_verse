import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      initialRouteName="(user-flow)"
      screenOptions={{ headerShown: false }}
    ></Stack>
  );
}

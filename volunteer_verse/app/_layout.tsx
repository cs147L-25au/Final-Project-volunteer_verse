import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="(user-flow)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(user-flow)" />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}

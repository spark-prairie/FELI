import { Stack } from 'expo-router';
import React from 'react';

export default function AnalyzeLayout() {
  return (
    <Stack>
      <Stack.Screen name="preview" options={{ title: 'Preview' }} />
      <Stack.Screen
        name="loading"
        options={{
          title: 'Analyzing',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: 'Results',
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}

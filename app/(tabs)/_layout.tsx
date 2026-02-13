import React from 'react';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="statistics" options={{ title: '统计' }} />
    </Tabs>
  );
}

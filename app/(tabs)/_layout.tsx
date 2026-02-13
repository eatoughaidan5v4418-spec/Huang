import React from 'react';
import { Box, Text, HStack, Pressable, useColorModeValue, Icon } from 'native-base';
import { Tabs } from 'expo-router';
import { Home, BarChart2 } from 'lucide-react-native';

function TabBarIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return (
    <Icon
      as={name === 'home' ? Home : BarChart2}
      size={6}
      color={focused ? '#1890FF' : color}
    />
  );
}

export default function TabLayout() {
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const activeColor = '#1890FF';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: '统计',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="chart" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

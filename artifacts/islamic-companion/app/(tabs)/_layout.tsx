import React from 'react';
import { Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 78,
          paddingTop: 8,
          paddingBottom: isWeb ? 30 : 15,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) =>
            <Feather name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen name="qibla" options={{ title: 'Qibla', tabBarIcon: ({ color }) => <Feather name="compass" size={20} color={color} /> }} />
      <Tabs.Screen name="alarm" options={{ title: 'Alarm', tabBarIcon: ({ color }) => <Feather name="bell" size={20} color={color} /> }} />
      <Tabs.Screen name="tracker" options={{ title: 'Tracker', tabBarIcon: ({ color }) => <Feather name="check-circle" size={20} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color }) => <Feather name="grid" size={20} color={color} /> }} />
    </Tabs>
  );
}

import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1D7A78',
        tabBarInactiveTintColor: '#7B9AA5',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#DCE8E5',
          borderTopWidth: 1,
          elevation: 4,
          shadowColor: 'rgba(18, 60, 74, 0.08)',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 6,
          height: Platform.OS === 'ios' ? 54 + insets.bottom : 58 + Math.max(insets.bottom, 6),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11.5,
          fontWeight: '700',
        },
        headerShown: true,
        headerLeft: () => (
          <DrawerToggleButton tintColor="#123C4A" />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={focused ? '#55C6A9' : '#7B9AA5'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="issues"
        options={{
          title: 'Issues',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'alert-circle' : 'alert-circle-outline'}
              size={24}
              color={focused ? '#55C6A9' : '#7B9AA5'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              size={24}
              color={focused ? '#55C6A9' : '#7B9AA5'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={focused ? '#55C6A9' : '#7B9AA5'}
            />
          ),
        }}
      />
    </Tabs>
  );
}

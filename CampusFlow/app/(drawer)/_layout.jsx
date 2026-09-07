import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

function CustomDrawerContent(props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, role, isAdmin, isSupport, logout } = useAuth();

  const getRoleBadge = () => {
    if (isAdmin) {
      return { label: 'Administrator', icon: 'shield-checkmark', color: '#D94848', bg: '#FDF0F0' };
    }
    if (isSupport) {
      return { label: 'Support Team', icon: 'construct', color: '#1D7A78', bg: '#E8F5F4' };
    }
    return { label: 'General User', icon: 'person', color: '#123C4A', bg: '#E8F8F4' };
  };

  const roleBadge = getRoleBadge();

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        {/* User Profile Header in Drawer */}
        <View style={styles.drawerHeader}>
          <View style={styles.avatarBox}>
            {user?.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarCircle, { backgroundColor: roleBadge.bg }]}>
                <Ionicons name={roleBadge.icon} size={24} color={roleBadge.color} />
              </View>
            )}
          </View>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.fullName || 'CampusFlow User'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email || 'user@campus.edu'}
          </Text>

          {/* Role Pill */}
          <View style={[styles.rolePill, { backgroundColor: roleBadge.bg }]}>
            <Ionicons name={roleBadge.icon} size={12} color={roleBadge.color} />
            <Text style={[styles.rolePillText, { color: roleBadge.color }]}>
              {roleBadge.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Navigation Items */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Drawer Footer with Logout */}
      <View style={[styles.drawerFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.drawerLogoutBtn}
          onPress={async () => {
            await logout();
            router.replace('/login');
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#D94848" />
          <Text style={styles.drawerLogoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { isAdmin, isSupport } = useAuth();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#1D7A78',
        drawerActiveBackgroundColor: '#E8F5F4',
        drawerInactiveTintColor: '#527986',
        drawerLabelStyle: {
          fontWeight: '700',
          fontSize: 14,
          marginLeft: -8,
        },
      }}
    >
      {/* 1. Home (Universal) */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'CampusFlow',
          headerShown: false,
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons name="home-outline" size={size} color={focused ? '#55C6A9' : color} />
          ),
        }}
      />

      {/* 2. Admin Console (Admin Only) */}
      <Drawer.Screen
        name="admin/index"
        options={{
          drawerLabel: 'Admin Console',
          title: 'Admin Console',
          headerShown: false,
          drawerItemStyle: isAdmin ? undefined : { display: 'none' },
          drawerIcon: ({ size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color="#D94848" />
          ),
        }}
      />

      {/* 3. Support Desk (Support Team & Admin) */}
      <Drawer.Screen
        name="support/index"
        options={{
          drawerLabel: 'Support Desk',
          title: 'Support Desk',
          headerShown: false,
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons
              name="construct-outline"
              size={size}
              color={focused ? '#55C6A9' : '#1D7A78'}
            />
          ),
        }}
      />

      {/* 4. All Issues (Universal) */}
      <Drawer.Screen
        name="allIssues"
        options={{
          drawerLabel: 'All Issues',
          title: 'All Issues',
          headerShown: false,
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons name="list-outline" size={size} color={focused ? '#55C6A9' : color} />
          ),
        }}
      />

      {/* 5. My Reports (Universal) */}
      <Drawer.Screen
        name="my-reports"
        options={{
          drawerLabel: 'My Reports',
          title: 'My Reports',
          headerShown: false,
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons name="document-text-outline" size={size} color={focused ? '#55C6A9' : color} />
          ),
        }}
      />

      {/* 6. Notifications (Universal) */}
      <Drawer.Screen
        name="notifications"
        options={{
          drawerLabel: 'Notifications',
          title: 'Notifications',
          headerShown: false,
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons name="notifications-outline" size={size} color={focused ? '#55C6A9' : color} />
          ),
        }}
      />

      {/* 7. Help & Support (Universal) */}
      <Drawer.Screen
        name="help-support"
        options={{
          drawerLabel: 'Help & Support',
          title: 'Help & Support',
          headerShown: false,
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons name="help-circle-outline" size={size} color={focused ? '#55C6A9' : color} />
          ),
        }}
      />

      {/* 8. Settings (Universal) */}
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
          headerShown: false,
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons name="settings-outline" size={size} color={focused ? '#55C6A9' : color} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  drawerScroll: { paddingTop: 0 },
  drawerHeader: {
    padding: 20,
    paddingTop: 45,
    backgroundColor: '#F4F8F7',
    borderBottomWidth: 1,
    borderBottomColor: '#DCE8E5',
  },
  avatarBox: { marginBottom: 10 },
  avatarImg: { width: 52, height: 52, borderRadius: 26 },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#102A35',
  },
  userEmail: {
    fontSize: 12,
    color: '#527986',
    marginTop: 2,
    marginBottom: 8,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#DCE8E5',
    marginVertical: 6,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#DCE8E5',
    backgroundColor: '#FFFFFF',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  drawerLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D94848',
  },
});

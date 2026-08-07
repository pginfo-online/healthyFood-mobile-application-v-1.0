import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, MapPin, Heart, HelpCircle, LogOut } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBg}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Healthy Food User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@healthyfood.in'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'CUSTOMER'}</Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <User color={Colors.neutral[600]} size={20} />
            <Text style={styles.menuLabel}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <MapPin color={Colors.neutral[600]} size={20} />
            <Text style={styles.menuLabel}>Saved Addresses</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Heart color={Colors.neutral[600]} size={20} />
            <Text style={styles.menuLabel}>My Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <HelpCircle color={Colors.neutral[600]} size={20} />
            <Text style={styles.menuLabel}>Support & FAQ</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            id="mobile-logout-btn"
            style={[styles.menuItem, styles.logoutItem]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut color={Colors.red[500]} size={20} />
            <Text style={styles.logoutLabel}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing[8],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  avatarBg: {
    width: 90, height: 90, borderRadius: BorderRadius.full,
    backgroundColor: Colors.brand[500], alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: Colors.white },
  userName: { fontSize: 20, fontWeight: '700', color: Colors.neutral[800] },
  userEmail: { fontSize: Typography.fontSize.sm, color: Colors.neutral[400], marginTop: 2 },
  roleBadge: {
    backgroundColor: Colors.brand[50],
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 8, marginTop: Spacing[3],
  },
  roleText: { fontSize: 10, fontWeight: '800', color: Colors.brand[700] },
  menuContainer: { paddingHorizontal: Spacing[4], paddingVertical: Spacing[4] },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[4],
    paddingVertical: Spacing[4], borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },
  menuLabel: { fontSize: Typography.fontSize.base, color: Colors.neutral[700], fontWeight: '500' },
  logoutItem: { borderBottomWidth: 0, marginTop: Spacing[4] },
  logoutLabel: { fontSize: Typography.fontSize.base, color: Colors.red[500], fontWeight: '600' },
});

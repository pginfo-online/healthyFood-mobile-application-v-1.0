import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  StatusBar, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Truck, Phone, Mail, Shield, ChevronRight, MapPin } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';

export default function DeliveryProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from delivery app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Partner Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.[0]?.toUpperCase() ?? 'P'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Delivery Partner'}</Text>
            <Text style={styles.userRole}>Verified Delivery Partner</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contact & Account</Text>
          
          <View style={styles.infoRow}>
            <Mail color={Colors.neutral[400]} size={18} />
            <Text style={styles.infoText}>{user?.email ?? '—'}</Text>
          </View>

          {user?.phone && (
            <View style={styles.infoRow}>
              <Phone color={Colors.neutral[400]} size={18} />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Shield color={Colors.brand[600]} size={18} />
            <Text style={[styles.infoText, { color: Colors.brand[700], fontWeight: '600' }]}>
              Account Active & Verified
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          id="delivery-logout-btn"
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <LogOut color={Colors.red[600]} size={20} />
          <Text style={styles.logoutText}>Log Out from Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  title: { fontSize: Typography.fontSize.xl, fontWeight: '700', color: Colors.neutral[900] },
  scrollContent: { padding: Spacing[4], gap: Spacing[4] },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[4],
    backgroundColor: Colors.brand[50],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.brand[200],
  },
  avatar: {
    width: 56, height: 56, borderRadius: BorderRadius.full,
    backgroundColor: Colors.brand[600],
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: Typography.fontSize['2xl'], fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: Typography.fontSize.lg, fontWeight: '700', color: Colors.neutral[900] },
  userRole: { fontSize: Typography.fontSize.xs, color: Colors.brand[700], fontWeight: '600', marginTop: 2 },
  sectionCard: {
    padding: Spacing[4],
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    gap: Spacing[3],
  },
  sectionTitle: { fontSize: Typography.fontSize.xs, fontWeight: '700', color: Colors.neutral[400], letterSpacing: 0.5, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  infoText: { fontSize: Typography.fontSize.sm, color: Colors.neutral[700], fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    padding: Spacing[4],
    backgroundColor: Colors.red[50],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.red[200],
    marginTop: Spacing[4],
  },
  logoutText: { color: Colors.red[600], fontSize: Typography.fontSize.base, fontWeight: '700' },
});

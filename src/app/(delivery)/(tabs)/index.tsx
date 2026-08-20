import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, ArrowRight, LogOut } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';
import api from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

export default function DeliveryDashboard() {
  const { logout } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from delivery partner app?',
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
  const [earnings, setEarnings] = useState<{ totalEarnings: number; totalDeliveries: number }>({
    totalEarnings: 0,
    totalDeliveries: 0,
  });
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryData = async () => {
    try {
      const [earnRes, assignRes] = await Promise.all([
        api.get('/delivery/earnings', { params: { period: 'today' } }).catch(() => ({ data: { totalEarnings: 0, totalDeliveries: 0 } })),
        api.get('/delivery/my-assignment').catch(() => ({ data: null })),
      ]);
      setEarnings(earnRes.data || { totalEarnings: 0, totalDeliveries: 0 });
      setActiveAssignment(assignRes.data);
    } catch (e) {
      console.error('Failed to fetch delivery data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const toggleOnline = async (val: boolean) => {
    setIsOnline(val);
    try {
      await api.patch('/delivery/online-status', { isOnline: val });
    } catch (e) {
      console.error('Failed to update online status:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Delivery Center</Text>
          <Text style={styles.subtitle}>Manage your delivery requests</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
          <View style={styles.statusToggle}>
            <Text style={[styles.statusText, isOnline ? styles.textOnline : styles.textOffline]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
            <Switch
              id="delivery-online-switch"
              value={isOnline}
              onValueChange={toggleOnline}
              trackColor={{ false: Colors.neutral[300], true: Colors.brand[200] }}
              thumbColor={isOnline ? Colors.brand[600] : Colors.neutral[400]}
            />
          </View>
          <TouchableOpacity
            style={{ padding: 6, borderRadius: 12, backgroundColor: Colors.red[50] }}
            onPress={handleLogout}
            title="Log Out"
          >
            <LogOut color={Colors.red[600]} size={18} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Earnings banner */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningLabel}>TODAY&apos;S EARNINGS</Text>
          <Text style={styles.earningVal}>₹{earnings.totalEarnings}</Text>
          <Text style={styles.earningSub}>{earnings.totalDeliveries} deliveries completed</Text>
        </View>

        <Text style={styles.sectionTitle}>Incoming Requests</Text>

        {!isOnline ? (
          <View style={styles.offlinePlaceholder}>
            <Text style={styles.placeholderEmoji}>😴</Text>
            <Text style={styles.placeholderTitle}>You are offline</Text>
            <Text style={styles.placeholderDesc}>Go online to start receiving delivery tasks.</Text>
          </View>
        ) : !activeAssignment ? (
          <View style={styles.emptyPlaceholder}>
            <Text style={styles.placeholderEmoji}>⏳</Text>
            <Text style={styles.placeholderTitle}>Looking for requests...</Text>
            <Text style={styles.placeholderDesc}>Incoming requests will appear here dynamically.</Text>
          </View>
        ) : (
          <View style={styles.requestsContainer}>
            <View key={activeAssignment._id} style={styles.requestCard}>
              <View style={styles.reqHeader}>
                <View>
                  <Text style={styles.reqId}>{activeAssignment.orderId?.orderId ?? 'Active Order'}</Text>
                  <Text style={styles.reqDistance}>{activeAssignment.distanceKm ? `${activeAssignment.distanceKm} km total` : 'Assigned'}</Text>
                </View>
                <Text style={styles.reqPayout}>₹{activeAssignment.payout ?? 50}</Text>
              </View>

              {/* Pickup details */}
              <View style={styles.routeContainer}>
                <View style={styles.dotContainer}>
                  <View style={[styles.dot, styles.dotGreen]} />
                  <View style={styles.dashLine} />
                  <View style={[styles.dot, styles.dotBlack]} />
                </View>
                
                <View style={styles.routeDetails}>
                  <View>
                    <Text style={styles.routeLabel}>PICKUP</Text>
                    <Text style={styles.storeName}>{activeAssignment.storeId?.name ?? 'Store'}</Text>
                    <Text style={styles.addressText}>{activeAssignment.storeId?.address ?? 'Store Location'}</Text>
                  </View>
                  <View style={{ marginTop: Spacing[4] }}>
                    <Text style={styles.routeLabel}>DELIVER TO</Text>
                    <Text style={styles.addressText}>{activeAssignment.orderId?.deliveryAddress?.address ?? 'Customer Address'}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                id="accept-request-btn"
                style={styles.acceptBtn}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: '/(delivery)/active-delivery/[id]' as any, params: { id: activeAssignment._id } })}
              >
                <Text style={styles.acceptText}>View Active Delivery</Text>
                <ArrowRight color={Colors.white} size={18} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.neutral[800] },
  subtitle: { fontSize: 11, color: Colors.neutral[400], marginTop: 2 },
  statusToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  textOnline: { color: Colors.brand[700] },
  textOffline: { color: Colors.neutral[400] },
  scrollContent: { padding: Spacing[4], gap: Spacing[5] },
  earningsCard: {
    backgroundColor: Colors.brand[950], borderRadius: BorderRadius.xl,
    padding: Spacing[5], alignItems: 'center',
  },
  earningLabel: { color: Colors.brand[300], fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  earningVal: { color: Colors.white, fontSize: 32, fontWeight: '800', marginTop: 4 },
  earningSub: { color: Colors.brand[200], fontSize: Typography.fontSize.xs, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[800] },
  offlinePlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  placeholderEmoji: { fontSize: 40, marginBottom: 8 },
  placeholderTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[600] },
  placeholderDesc: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], marginTop: 4 },
  emptyPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  requestsContainer: { gap: Spacing[4] },
  requestCard: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.neutral[100],
    borderRadius: BorderRadius.xl, padding: Spacing[4],
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  reqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.neutral[50], paddingBottom: Spacing[3] },
  reqId: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[800] },
  reqDistance: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], marginTop: 2 },
  reqPayout: { fontSize: 20, fontWeight: '800', color: Colors.brand[700] },
  routeContainer: { flexDirection: 'row', gap: Spacing[3], marginVertical: Spacing[4] },
  dotContainer: { alignItems: 'center', paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: BorderRadius.full },
  dotGreen: { backgroundColor: Colors.brand[600] },
  dotBlack: { backgroundColor: Colors.neutral[900] },
  dashLine: { width: 1.5, flex: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.neutral[300], marginVertical: 4 },
  routeDetails: { flex: 1 },
  routeLabel: { fontSize: 8, fontWeight: '700', color: Colors.neutral[400], letterSpacing: 0.5 },
  storeName: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[700], marginTop: 2 },
  addressText: { fontSize: Typography.fontSize.xs, color: Colors.neutral[500], marginTop: 2 },
  acceptBtn: {
    height: 48, backgroundColor: Colors.brand[600], borderRadius: BorderRadius.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  acceptText: { color: Colors.white, fontWeight: '700', fontSize: 14 },
});

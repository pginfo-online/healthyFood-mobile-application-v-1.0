import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';

const mockRequests = [
  {
    id: 'ord1',
    orderId: 'HF-20260807-000123',
    storeName: 'Pune Healthy Mart',
    storeAddress: 'Kalyani Nagar, Pune',
    customerAddress: 'Marvel Crest, Kalyani Nagar, Pune',
    payout: 65,
    distance: '2.4 km total',
  },
];

export default function DeliveryDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Delivery Center</Text>
          <Text style={styles.subtitle}>Manage your delivery requests</Text>
        </View>

        <View style={styles.statusToggle}>
          <Text style={[styles.statusText, isOnline ? styles.textOnline : styles.textOffline]}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            id="delivery-online-switch"
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: Colors.neutral[300], true: Colors.brand[200] }}
            thumbColor={isOnline ? Colors.brand[600] : Colors.neutral[400]}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Earnings banner */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningLabel}>TODAY&apos;S EARNINGS</Text>
          <Text style={styles.earningVal}>₹260</Text>
          <Text style={styles.earningSub}>4 deliveries completed</Text>
        </View>

        <Text style={styles.sectionTitle}>Incoming Requests</Text>

        {!isOnline ? (
          <View style={styles.offlinePlaceholder}>
            <Text style={styles.placeholderEmoji}>😴</Text>
            <Text style={styles.placeholderTitle}>You are offline</Text>
            <Text style={styles.placeholderDesc}>Go online to start receiving delivery tasks.</Text>
          </View>
        ) : mockRequests.length === 0 ? (
          <View style={styles.emptyPlaceholder}>
            <Text style={styles.placeholderEmoji}>⏳</Text>
            <Text style={styles.placeholderTitle}>Looking for requests...</Text>
            <Text style={styles.placeholderDesc}>Incoming requests will appear here dynamically.</Text>
          </View>
        ) : (
          <View style={styles.requestsContainer}>
            {mockRequests.map((req) => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.reqHeader}>
                  <View>
                    <Text style={styles.reqId}>{req.orderId}</Text>
                    <Text style={styles.reqDistance}>{req.distance}</Text>
                  </View>
                  <Text style={styles.reqPayout}>₹{req.payout}</Text>
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
                      <Text style={styles.storeName}>{req.storeName}</Text>
                      <Text style={styles.addressText}>{req.storeAddress}</Text>
                    </View>
                    <View style={{ marginTop: Spacing[4] }}>
                      <Text style={styles.routeLabel}>DELIVER TO</Text>
                      <Text style={styles.addressText}>{req.customerAddress}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  id="accept-request-btn"
                  style={styles.acceptBtn}
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/(delivery)/active-delivery/[id]', params: { id: req.id } })}
                >
                  <Text style={styles.acceptText}>Accept Delivery</Text>
                  <ArrowRight color={Colors.white} size={18} />
                </TouchableOpacity>
              </View>
            ))}
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

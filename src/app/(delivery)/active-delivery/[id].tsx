import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, MapPin, CheckCircle, Navigation } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';

import { socketService } from '@/services/socket';

export default function ActiveDeliveryScreen() {
  const { id } = useLocalSearchParams();
  const [step, setStep] = useState<'pickup' | 'dropoff' | 'delivered'>('pickup');
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (step !== 'dropoff') return;
    
    // Simulate driver moving towards customer
    let lat = 18.5362;
    let lng = 73.8940;
    
    const interval = setInterval(() => {
      lat += 0.0005;
      lng += 0.0005;
      const orderIdStr = Array.isArray(id) ? id[0] : id;
      if (orderIdStr) {
        socketService.updateDriverLocation(orderIdStr, lat, lng);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, id]);

  const mockOrder = {
    orderId: 'HF-20260807-000123',
    storeName: 'Pune Healthy Mart',
    storePhone: '+919876543210',
    storeAddress: 'Shop 12, Kalyani Nagar, Pune',
    customerName: 'Rahul Sharma',
    customerPhone: '+919988776655',
    customerAddress: 'Flat 402, Marvel Crest, Kalyani Nagar, Pune',
    paymentMethod: 'online',
    total: 480,
  };

  const handleNextStep = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      if (step === 'pickup') {
        setStep('dropoff');
      } else if (step === 'dropoff') {
        setStep('delivered');
      }
    }, 1500);
  };

  const callPhone = (num: string) => {
    Linking.openURL(`tel:${num}`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {step === 'delivered' ? (
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Delivery Completed!</Text>
          <Text style={styles.successDesc}>Great job! You have earned ₹65 for this delivery.</Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace('/(delivery)')}
            activeOpacity={0.8}
          >
            <Text style={styles.doneText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Delivery Status Banner */}
            <View style={styles.statusBanner}>
              <Text style={styles.orderId}>DELIVERY FOR {mockOrder.orderId}</Text>
              <Text style={styles.stepTitle}>
                {step === 'pickup' ? 'Heading to Store' : 'Out for Delivery'}
              </Text>
            </View>

            {/* Target Card */}
            <View style={styles.targetCard}>
              <Text style={styles.targetLabel}>{step === 'pickup' ? 'PICKUP FROM' : 'DELIVER TO'}</Text>
              <Text style={styles.targetName}>
                {step === 'pickup' ? mockOrder.storeName : mockOrder.customerName}
              </Text>
              <Text style={styles.targetAddress}>
                {step === 'pickup' ? mockOrder.storeAddress : mockOrder.customerAddress}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => callPhone(step === 'pickup' ? mockOrder.storePhone : mockOrder.customerPhone)}
                  activeOpacity={0.7}
                >
                  <Phone color={Colors.neutral[800]} size={18} />
                  <Text style={styles.actionText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                  <Navigation color={Colors.neutral[800]} size={18} />
                  <Text style={styles.actionText}>Navigate</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* COD Summary if applicable */}
            {step === 'dropoff' && mockOrder.paymentMethod === 'cod' && (
              <View style={styles.codCard}>
                <Text style={styles.codTitle}>💵 Collect Cash / UPI</Text>
                <Text style={styles.codValue}>₹{mockOrder.total}</Text>
                <Text style={styles.codSub}>Ask customer to pay before handing over the order</Text>
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Bar */}
          <View style={styles.footer}>
            <TouchableOpacity
              id="active-delivery-next-step"
              style={[styles.primaryBtn, isUpdating && styles.btnDisabled]}
              onPress={handleNextStep}
              disabled={isUpdating}
              activeOpacity={0.9}
            >
              {isUpdating ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <CheckCircle color={Colors.white} size={18} />
                  <Text style={styles.primaryText}>
                    {step === 'pickup' ? 'Confirm Pickup' : 'Confirm Delivery'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { padding: Spacing[4], gap: Spacing[4], paddingBottom: 100 },
  statusBanner: {
    backgroundColor: Colors.neutral[950], borderRadius: BorderRadius.xl,
    padding: Spacing[5], alignItems: 'center',
  },
  orderId: { color: Colors.brand[300], fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  stepTitle: { color: Colors.white, fontSize: 22, fontWeight: '800', marginTop: Spacing[2] },
  targetCard: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.neutral[100],
    borderRadius: BorderRadius.xl, padding: Spacing[4], gap: 8,
  },
  targetLabel: { fontSize: 8, fontWeight: '700', color: Colors.neutral[400], letterSpacing: 0.5 },
  targetName: { fontSize: 18, fontWeight: '700', color: Colors.neutral[800] },
  targetAddress: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500], lineHeight: 20, marginBottom: Spacing[2] },
  actionRow: { flexDirection: 'row', gap: Spacing[3], borderTopWidth: 1, borderTopColor: Colors.neutral[50], paddingTop: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.neutral[200], borderRadius: BorderRadius.lg,
    height: 40,
  },
  actionText: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral[700] },
  codCard: {
    backgroundColor: Colors.yellow[50], borderRadius: BorderRadius.xl,
    padding: Spacing[4], borderWidth: 1, borderColor: Colors.yellow[500] + '33',
    alignItems: 'center',
  },
  codTitle: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.yellow[600], marginBottom: 4 },
  codValue: { fontSize: 32, fontWeight: '800', color: Colors.yellow[600] },
  codSub: { fontSize: 10, color: Colors.neutral[500], marginTop: 4 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.neutral[100],
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
  },
  primaryBtn: {
    height: 52, backgroundColor: Colors.brand[600],
    borderRadius: BorderRadius.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  btnDisabled: { opacity: 0.7 },
  primaryText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[6] },
  successEmoji: { fontSize: 60, marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: '800', color: Colors.neutral[800] },
  successDesc: { fontSize: Typography.fontSize.base, color: Colors.neutral[500], textAlign: 'center', marginTop: 8, lineHeight: 22, paddingHorizontal: Spacing[4] },
  doneBtn: {
    marginTop: Spacing[8], backgroundColor: Colors.brand[600],
    paddingHorizontal: 24, height: 48, borderRadius: BorderRadius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  doneText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSize.sm },
});

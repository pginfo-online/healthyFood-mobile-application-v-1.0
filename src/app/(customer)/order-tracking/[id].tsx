import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ClipboardList, ChefHat, Bike, Award } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';

import { socketService } from '@/services/socket';

const { width } = Dimensions.get('window');

const statusOrder = ['pending', 'preparing', 'out_for_delivery', 'delivered'];

const stepConfig = [
  { status: 'pending', label: 'Ordered', desc: 'Order received by store', icon: ClipboardList },
  { status: 'preparing', label: 'Preparing', desc: 'Fresh ingredients being assembled', icon: ChefHat },
  { status: 'out_for_delivery', label: 'On the Way', desc: 'Rider en route to your place', icon: Bike },
  { status: 'delivered', label: 'Delivered', desc: 'Enjoy your healthy meal!', icon: Check },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const [showMacros, setShowMacros] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('pending');

  React.useEffect(() => {
    const orderIdStr = Array.isArray(id) ? id[0] : id;
    if (!orderIdStr) return;

    socketService.connect();
    socketService.joinOrderRoom(orderIdStr);

    socketService.onOrderStatusUpdate((data) => {
      if (data.status) {
        // Map order pipeline statuses to simple steps
        let simplified = 'pending';
        if (['accepted', 'preparing', 'ready_for_pickup'].includes(data.status)) {
          simplified = 'preparing';
        } else if (['assigned', 'picked_up', 'out_for_delivery'].includes(data.status)) {
          simplified = 'out_for_delivery';
        } else if (data.status === 'delivered') {
          simplified = 'delivered';
        }
        setCurrentStatus(simplified);
      }
    });

    return () => {
      socketService.leaveOrderRoom(orderIdStr);
      socketService.offOrderStatusUpdate();
    };
  }, [id]);

  const currentIdx = statusOrder.indexOf(currentStatus);

  const trackingSteps = stepConfig.map((step, idx) => ({
    ...step,
    active: idx <= currentIdx,
    done: idx < currentIdx,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status card */}
        <View style={styles.statusCard}>
          <Text style={styles.orderId}>ORDER HF-20260807-000123</Text>
          <Text style={styles.etaTitle}>Estimated Delivery Time</Text>
          <Text style={styles.etaTime}>8:55 PM (25 mins)</Text>
        </View>

        {/* Nutritional Summary Receipt (Core HealthyFood feature) */}
        {showMacros && (
          <View style={styles.macrosCard}>
            <View style={styles.macrosHeader}>
              <View style={styles.awardRow}>
                <Award color={Colors.brand[700]} size={20} />
                <Text style={styles.macrosTitle}>Nutritional Receipt</Text>
              </View>
              <TouchableOpacity onPress={() => setShowMacros(false)} activeOpacity={0.7}>
                <Text style={styles.dismissBtn}>Dismiss</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.macrosSubtitle}>Your macro metrics for this order:</Text>

            <View style={styles.macrosGrid}>
              <View style={styles.macroCol}>
                <Text style={styles.macroVal}>240</Text>
                <Text style={styles.macroLabel}>Energy (kcal)</Text>
              </View>
              <View style={styles.macroCol}>
                <Text style={styles.macroVal}>6g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroCol}>
                <Text style={styles.macroVal}>21g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroCol}>
                <Text style={styles.macroVal}>16g</Text>
                <Text style={styles.macroLabel}>Fats</Text>
              </View>
            </View>
          </View>
        )}

        {/* Pipeline steps */}
        <View style={styles.pipelineCard}>
          <Text style={styles.pipelineTitle}>Order Progress</Text>
          
          <View style={styles.stepsContainer}>
            {trackingSteps.map((step, idx) => {
              const isLast = idx === trackingSteps.length - 1;
              const StepIcon = step.icon;
              
              return (
                <View key={step.status} style={styles.stepRow}>
                  {/* Left Column: Icon + Line */}
                  <View style={styles.stepLeft}>
                    <View style={[
                      styles.iconCircle,
                      step.done && styles.circleDone,
                      step.active && !step.done && styles.circleActive,
                    ]}>
                      {step.done ? (
                        <Check color={Colors.white} size={14} />
                      ) : (
                        <StepIcon color={step.active ? Colors.brand[600] : Colors.neutral[400]} size={16} />
                      )}
                    </View>
                    {!isLast && (
                      <View style={[
                        styles.line,
                        step.done && styles.lineDone,
                      ]} />
                    )}
                  </View>

                  {/* Right Column: Texts */}
                  <View style={styles.stepRight}>
                    <Text style={[
                      styles.stepLabel,
                      step.active && styles.labelActive,
                    ]}>
                      {step.label}
                    </Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Home Action */}
        <TouchableOpacity
          id="tracking-back-home"
          style={styles.backHomeBtn}
          onPress={() => router.push('/(customer)/(tabs)')}
          activeOpacity={0.8}
        >
          <Text style={styles.backHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { padding: Spacing[4], gap: Spacing[4] },
  statusCard: {
    backgroundColor: Colors.neutral[950], borderRadius: BorderRadius.xl,
    padding: Spacing[5], alignItems: 'center',
  },
  orderId: { color: Colors.brand[300], fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  etaTitle: { color: Colors.neutral[400], fontSize: Typography.fontSize.xs, marginTop: Spacing[3] },
  etaTime: { color: Colors.white, fontSize: 24, fontWeight: '800', marginTop: 2 },
  macrosCard: {
    backgroundColor: Colors.brand[50], borderRadius: BorderRadius.xl,
    padding: Spacing[4], borderWidth: 1, borderColor: Colors.brand[100],
  },
  macrosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[2] },
  awardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  macrosTitle: { fontSize: 15, fontWeight: '700', color: Colors.brand[700] },
  dismissBtn: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], fontWeight: '600' },
  macrosSubtitle: { fontSize: Typography.fontSize.xs, color: Colors.brand[800], marginBottom: Spacing[3] },
  macrosGrid: { flexDirection: 'row', gap: 8 },
  macroCol: { flex: 1, alignItems: 'center', backgroundColor: Colors.white, paddingVertical: 8, borderRadius: 8 },
  macroVal: { fontSize: 15, fontWeight: '700', color: Colors.brand[600] },
  macroLabel: { fontSize: 9, color: Colors.neutral[400], marginTop: 2, fontWeight: '600' },
  pipelineCard: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.neutral[100],
    borderRadius: BorderRadius.xl, padding: Spacing[4],
  },
  pipelineTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[800], marginBottom: Spacing[4] },
  stepsContainer: { paddingLeft: 4 },
  stepRow: { flexDirection: 'row', gap: Spacing[4] },
  stepLeft: { alignItems: 'center', width: 24 },
  iconCircle: {
    width: 24, height: 24, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.neutral[300],
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  circleActive: { borderColor: Colors.brand[500], backgroundColor: Colors.brand[50] },
  circleDone: { borderColor: Colors.brand[600], backgroundColor: Colors.brand[600] },
  line: { width: 2, flex: 1, backgroundColor: Colors.neutral[200], marginTop: -4, marginBottom: -4 },
  lineDone: { backgroundColor: Colors.brand[600] },
  stepRight: { flex: 1, paddingBottom: Spacing[6] },
  stepLabel: { fontSize: Typography.fontSize.base, fontWeight: '600', color: Colors.neutral[400] },
  labelActive: { color: Colors.neutral[800], fontWeight: '700' },
  stepDesc: { fontSize: Typography.fontSize.xs, color: Colors.neutral[500], marginTop: 2 },
  backHomeBtn: {
    height: 50, borderWidth: 1.5, borderColor: Colors.brand[600],
    borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing[4],
  },
  backHomeText: { color: Colors.brand[600], fontWeight: '700', fontSize: 15 },
});

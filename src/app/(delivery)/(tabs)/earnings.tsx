import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Landmark, ArrowUpRight, TrendingUp } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

export default function EarningsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Earnings & Settlements</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Total Earnings Card */}
        <View style={styles.earningsCard}>
          <View style={styles.iconWrapper}>
            <Landmark color={Colors.white} size={24} />
          </View>
          <Text style={styles.earningsTitle}>Total Outstanding Balance</Text>
          <Text style={styles.earningsValue}>₹1,450</Text>
          <Text style={styles.earningsSub}>Next payout on Monday, 10 Aug</Text>
        </View>

        {/* Analytics Grid */}
        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <TrendingUp color={Colors.brand[600]} size={20} />
            <Text style={styles.gridCardLabel}>Weekly Target</Text>
            <Text style={styles.gridCardValue}>₹2,500</Text>
            <Text style={styles.gridCardSub}>58% completed</Text>
          </View>

          <View style={styles.gridCard}>
            <ArrowUpRight color={Colors.brand[600]} size={20} />
            <Text style={styles.gridCardLabel}>Incentives Earned</Text>
            <Text style={styles.gridCardValue}>₹150</Text>
            <Text style={styles.gridCardSub}>Active promo: Monsoon Boost</Text>
          </View>
        </View>

        {/* Premium Note */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Payment Cycle Info</Text>
          <Text style={styles.infoText}>
            Payouts are auto-processed every Monday morning directly to your registered bank account. Make sure bank details are up to date in settings.
          </Text>
        </View>
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
  title: { fontSize: 20, fontWeight: '700', color: Colors.neutral[800] },
  scrollContent: { padding: Spacing[4], gap: Spacing[5] },
  earningsCard: {
    backgroundColor: Colors.brand[950], borderRadius: BorderRadius.xl,
    padding: Spacing[5], alignItems: 'center',
  },
  iconWrapper: {
    width: 48, height: 48, borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  earningsTitle: { color: Colors.brand[300], fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  earningsValue: { color: Colors.white, fontSize: 32, fontWeight: '800', marginTop: 4 },
  earningsSub: { color: Colors.neutral[300], fontSize: Typography.fontSize.xs, marginTop: 4 },
  grid: { flexDirection: 'row', gap: Spacing[4] },
  gridCard: {
    flex: 1, backgroundColor: Colors.white, borderWidth: 1.5,
    borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl,
    padding: Spacing[4], gap: 4,
  },
  gridCardLabel: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], fontWeight: '600' },
  gridCardValue: { fontSize: 18, fontWeight: '800', color: Colors.neutral[800] },
  gridCardSub: { fontSize: 9, color: Colors.brand[700], fontWeight: '700' },
  infoCard: {
    backgroundColor: Colors.neutral[50], borderRadius: BorderRadius.xl,
    padding: Spacing[4], borderWidth: 1, borderColor: Colors.neutral[100],
  },
  infoTitle: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[800], marginBottom: 4 },
  infoText: { fontSize: Typography.fontSize.xs, color: Colors.neutral[500], lineHeight: 18 },
});

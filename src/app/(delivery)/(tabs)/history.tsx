import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

const mockHistory = [
  {
    id: 'ord2',
    orderId: 'HF-20260806-000089',
    storeName: 'Fresh Basket',
    payout: 55,
    distance: '1.8 km',
    completedAt: '6 Aug, 1:45 PM',
  },
  {
    id: 'ord3',
    orderId: 'HF-20260805-000045',
    storeName: 'Organic World',
    payout: 75,
    distance: '3.2 km',
    completedAt: '5 Aug, 7:12 PM',
  },
];

export default function DeliveryHistory() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Delivery History</Text>
      </View>

      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven&apos;t completed any deliveries yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.storeName}>{item.storeName}</Text>
                <Text style={styles.orderId}>{item.orderId}</Text>
              </View>
              <Text style={styles.payout}>+₹{item.payout}</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.metaText}>📏 {item.distance}</Text>
              <Text style={styles.metaText}>🕒 {item.completedAt}</Text>
            </View>
          </View>
        )}
      />
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
  listContainer: { padding: Spacing[4], gap: Spacing[4] },
  historyCard: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.neutral[100],
    borderRadius: BorderRadius.xl, padding: Spacing[4], gap: 12,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[800] },
  orderId: { fontSize: 11, color: Colors.neutral[400], marginTop: 2 },
  payout: { fontSize: 18, fontWeight: '800', color: Colors.brand[700] },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.neutral[50], paddingTop: 10,
  },
  metaText: { fontSize: Typography.fontSize.xs, color: Colors.neutral[500] },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: Colors.neutral[400], fontSize: Typography.fontSize.sm },
});

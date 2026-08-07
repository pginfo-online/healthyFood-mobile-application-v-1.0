import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';

const mockOrders = [
  {
    id: 'ord1',
    orderId: 'HF-20260807-000123',
    storeName: 'Pune Healthy Mart',
    storeLogo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80',
    total: 480,
    itemsCount: 3,
    status: 'preparing',
    createdAt: '7 Aug, 8:30 PM',
  },
  {
    id: 'ord2',
    orderId: 'HF-20260806-000089',
    storeName: 'Fresh Basket',
    storeLogo: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=200&q=80',
    total: 320,
    itemsCount: 2,
    status: 'delivered',
    createdAt: '6 Aug, 1:15 PM',
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: Colors.yellow[50], text: Colors.yellow[600] },
  confirmed: { bg: Colors.brand[50], text: Colors.brand[600] },
  accepted: { bg: Colors.brand[50], text: Colors.brand[600] },
  preparing: { bg: Colors.brand[50], text: Colors.brand[700] },
  ready_for_pickup: { bg: Colors.brand[100], text: Colors.brand[800] },
  out_for_delivery: { bg: '#eff6ff', text: '#1d4ed8' },
  delivered: { bg: Colors.brand[50], text: Colors.brand[600] },
  cancelled: { bg: '#fef2f2', text: Colors.red[600] },
};

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={mockOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven&apos;t placed any orders yet.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const badge = statusColors[item.status] || { bg: Colors.neutral[50], text: Colors.neutral[600] };
          return (
            <TouchableOpacity
              id={`order-item-${item.id}`}
              style={styles.orderCard}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: `/(customer)/order-tracking/[id]`, params: { id: item.id } })}
            >
              <Image source={{ uri: item.storeLogo }} style={styles.storeLogo} />

              <View style={styles.orderInfo}>
                <View style={styles.orderHeader}>
                  <Text style={styles.storeName}>{item.storeName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusText, { color: badge.text }]}>
                      {item.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.orderId}>{item.orderId}</Text>
                <Text style={styles.orderMeta}>{item.itemsCount} items • {item.createdAt}</Text>
                
                <View style={styles.orderFooter}>
                  <Text style={styles.totalText}>Total: ₹{item.total}</Text>
                  <View style={styles.actionRow}>
                    <Text style={styles.trackLink}>View Details</Text>
                    <ChevronRight color={Colors.brand[600]} size={16} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
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
  orderCard: {
    flexDirection: 'row', backgroundColor: Colors.white, borderWidth: 1,
    borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl,
    padding: Spacing[3], gap: Spacing[3],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  storeLogo: { width: 60, height: 60, borderRadius: BorderRadius.lg },
  orderInfo: { flex: 1, justifyContent: 'center' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[800] },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  orderId: { fontSize: 11, color: Colors.neutral[400], marginTop: 2 },
  orderMeta: { fontSize: Typography.fontSize.xs, color: Colors.neutral[500], marginTop: 4 },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing[3], paddingTop: Spacing[2], borderTopWidth: 1, borderTopColor: Colors.neutral[50],
  },
  totalText: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[800] },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trackLink: { fontSize: Typography.fontSize.sm, color: Colors.brand[600], fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: Colors.neutral[400], fontSize: Typography.fontSize.sm },
});

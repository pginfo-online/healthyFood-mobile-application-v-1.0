import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Minus, Tag, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';
import { useCartStore } from '@/store/cart.store';

export default function CartTabScreen() {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = getTotal();
  const deliveryCharge = subtotal > 300 || subtotal === 0 ? 0 : 35;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = Math.max(0, subtotal + deliveryCharge + tax - appliedDiscount);

  const applyPromo = () => {
    if (coupon.trim().toUpperCase() === 'HEALTHY100') {
      setAppliedDiscount(100);
    } else if (coupon.trim().toUpperCase() === 'HEALTHY20') {
      setAppliedDiscount(Math.round(subtotal * 0.2));
    } else {
      Alert.alert('Invalid Coupon', 'Try HEALTHY100 for ₹100 off or HEALTHY20 for 20% off.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Healthy Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart} activeOpacity={0.7}>
            <Text style={styles.clearCartText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🥗</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Explore organic veggies, fruits & healthy snacks to get started!</Text>
          <TouchableOpacity 
            style={styles.emptyBtn} 
            onPress={() => router.push('/(customer)/(tabs)' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyBtnText}>Browse Stores</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Items List */}
            <View style={styles.itemsCard}>
              {items.map((item) => (
                <View key={item.productId} style={styles.cartItem}>
                  <Image
                    source={{ uri: item.image || 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&q=80' }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemUnit}>{item.unit}</Text>
                    <Text style={styles.itemPrice}>₹{item.discountPrice ?? item.price}</Text>
                  </View>

                  <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => removeItem(item.productId)} style={styles.trashBtn} activeOpacity={0.7}>
                      <Trash2 color={Colors.neutral[400]} size={16} />
                    </TouchableOpacity>

                    <View style={styles.qtyContainer}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.productId, item.quantity - 1)} activeOpacity={0.7}>
                        <Minus color={Colors.neutral[800]} size={14} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.productId, item.quantity + 1)} activeOpacity={0.7}>
                        <Plus color={Colors.neutral[800]} size={14} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Coupon Code */}
            <View style={styles.couponCard}>
              <View style={styles.couponInputWrapper}>
                <Tag color={Colors.brand[600]} size={18} />
                <TextInput
                  id="coupon-code-input"
                  style={styles.couponInput}
                  placeholder="Promo (e.g. HEALTHY100)"
                  placeholderTextColor={Colors.neutral[400]}
                  value={coupon}
                  onChangeText={setCoupon}
                  autoCapitalize="characters"
                />
                <TouchableOpacity onPress={applyPromo} style={styles.applyBtn} activeOpacity={0.8}>
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
              {appliedDiscount > 0 && (
                <Text style={styles.couponSuccess}>Coupon applied successfully! ₹{appliedDiscount} Off</Text>
              )}
            </View>

            {/* Bill Details */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill Summary</Text>
              
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{subtotal}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={[styles.billValue, deliveryCharge === 0 && styles.freeDelivery]}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Taxes & Charges (GST 5%)</Text>
                <Text style={styles.billValue}>₹{tax}</Text>
              </View>

              {appliedDiscount > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.discountLabel}>Promo Discount</Text>
                  <Text style={styles.discountValue}>-₹{appliedDiscount}</Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.billRow}>
                <Text style={styles.totalLabel}>To Pay</Text>
                <Text style={styles.totalValue}>₹{total}</Text>
              </View>
            </View>

            <View style={styles.guaranteeRow}>
              <ShieldCheck color={Colors.brand[600]} size={16} />
              <Text style={styles.guaranteeText}>100% Quality & Freshness Guarantee</Text>
            </View>
          </ScrollView>

          {/* Checkout Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              id="btn-proceed-checkout"
              style={styles.checkoutBtn} 
              activeOpacity={0.9}
              onPress={() => router.push('/(customer)/checkout' as any)}
            >
              <View>
                <Text style={styles.checkoutTotal}>₹{total}</Text>
                <Text style={styles.checkoutItemsCount}>{items.length} items</Text>
              </View>
              <View style={styles.checkoutRight}>
                <Text style={styles.checkoutText}>Proceed to Pay</Text>
                <ArrowRight color={Colors.white} size={18} />
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral[900] },
  clearCartText: { fontSize: Typography.fontSize.xs, color: Colors.red[500], fontWeight: '600' },

  scrollContent: { padding: Spacing[4], paddingBottom: 110 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing[6] },
  emptyEmoji: { fontSize: 54, marginBottom: Spacing[3] },
  emptyTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', color: Colors.neutral[900], marginBottom: Spacing[1] },
  emptySubtitle: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500], textAlign: 'center', marginBottom: Spacing[6], maxWidth: '80%' },
  emptyBtn: {
    backgroundColor: Colors.brand[600], paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3], borderRadius: BorderRadius.xl,
  },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSize.sm },

  itemsCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing[4], marginBottom: Spacing[4], borderWidth: 1, borderColor: Colors.neutral[100],
  },
  cartItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  itemImage: { width: 56, height: 56, borderRadius: BorderRadius.lg, backgroundColor: Colors.neutral[100] },
  itemDetails: { flex: 1, marginLeft: Spacing[3] },
  itemName: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[900] },
  itemUnit: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], marginTop: 2 },
  itemPrice: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.brand[700], marginTop: 2 },
  actionsContainer: { alignItems: 'flex-end', gap: 6 },
  trashBtn: { padding: 4 },
  qtyContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.neutral[50], borderRadius: BorderRadius.lg, padding: 4,
    borderWidth: 1, borderColor: Colors.neutral[200],
  },
  qtyBtn: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 13, fontWeight: '700', color: Colors.neutral[900], minWidth: 16, textAlign: 'center' },

  couponCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing[3], marginBottom: Spacing[4], borderWidth: 1, borderColor: Colors.neutral[100],
  },
  couponInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  couponInput: { flex: 1, fontSize: Typography.fontSize.xs, color: Colors.neutral[900] },
  applyBtn: { backgroundColor: Colors.brand[50], paddingHorizontal: Spacing[3], paddingVertical: 6, borderRadius: BorderRadius.lg },
  applyText: { color: Colors.brand[700], fontWeight: '700', fontSize: Typography.fontSize.xs },
  couponSuccess: { fontSize: 11, color: Colors.green[600], fontWeight: '600', marginTop: Spacing[2], marginLeft: Spacing[7] },

  billCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: Spacing[4], marginBottom: Spacing[3], borderWidth: 1, borderColor: Colors.neutral[100],
  },
  billTitle: { fontSize: 15, fontWeight: '700', color: Colors.neutral[900], marginBottom: Spacing[3] },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing[2] },
  billLabel: { fontSize: Typography.fontSize.xs, color: Colors.neutral[600] },
  billValue: { fontSize: Typography.fontSize.xs, fontWeight: '600', color: Colors.neutral[900] },
  freeDelivery: { color: Colors.green[600], fontWeight: '700' },
  discountLabel: { fontSize: Typography.fontSize.xs, color: Colors.brand[600], fontWeight: '600' },
  discountValue: { fontSize: Typography.fontSize.xs, color: Colors.brand[600], fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.neutral[100], marginVertical: Spacing[2] },
  totalLabel: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[900] },
  totalValue: { fontSize: 16, fontWeight: '800', color: Colors.brand[700] },

  guaranteeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: Spacing[2] },
  guaranteeText: { fontSize: 11, color: Colors.brand[700], fontWeight: '600' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, padding: Spacing[4],
    borderTopWidth: 1, borderTopColor: Colors.neutral[100],
  },
  checkoutBtn: {
    backgroundColor: Colors.brand[600], borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  checkoutTotal: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  checkoutItemsCount: { color: Colors.brand[200], fontSize: 10 },
  checkoutRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkoutText: { color: Colors.white, fontSize: Typography.fontSize.sm, fontWeight: '700' },
});

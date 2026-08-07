import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Minus, Tag, Trash2, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';

const mockCartItems = [
  {
    id: 'p1',
    name: 'Organic Avocados',
    price: 180,
    discountPrice: 150,
    unit: '2 pcs',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&q=80',
    quantity: 1,
  },
  {
    id: 'p4',
    name: 'Organic Baby Spinach',
    price: 60,
    discountPrice: 45,
    unit: '200g',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80',
    quantity: 2,
  },
];

export default function CartScreen() {
  const [items, setItems] = useState(mockCartItems);
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const updateQty = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const qty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);
  const deliveryCharge = subtotal > 300 || subtotal === 0 ? 0 : 35;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = Math.max(0, subtotal + deliveryCharge + tax - appliedDiscount);

  const applyPromo = () => {
    if (coupon.toUpperCase() === 'HEALTHY100') {
      setAppliedDiscount(100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty 🥗</Text>
          <TouchableOpacity 
            style={styles.emptyBtn} 
            onPress={() => router.push('/(customer)/(tabs)')}
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
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemUnit}>{item.unit}</Text>
                    <Text style={styles.itemPrice}>₹{item.discountPrice}</Text>
                  </View>

                  <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.trashBtn} activeOpacity={0.7}>
                      <Trash2 color={Colors.neutral[400]} size={16} />
                    </TouchableOpacity>

                    <View style={styles.qtyContainer}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)} activeOpacity={0.7}>
                        <Minus color={Colors.neutral[800]} size={14} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)} activeOpacity={0.7}>
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
                <Tag color={Colors.brand[600]} size={20} />
                <TextInput
                  id="coupon-code-input"
                  style={styles.couponInput}
                  placeholder="Enter Promo Code (e.g. HEALTHY100)"
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

            {/* Bill Summary */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill Summary</Text>
              
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Subtotal</Text>
                <Text style={styles.billVal}>₹{subtotal}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Charges</Text>
                <Text style={styles.billVal}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Govt. Taxes (5%)</Text>
                <Text style={styles.billVal}>₹{tax}</Text>
              </View>
              {appliedDiscount > 0 && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: Colors.brand[700] }]}>Discount</Text>
                  <Text style={[styles.billVal, { color: Colors.brand[700] }]}>-₹{appliedDiscount}</Text>
                </View>
              )}

              <View style={[styles.billRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalVal}>₹{total}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Bar */}
          <View style={styles.footer}>
            <View style={styles.footerTotal}>
              <Text style={styles.footerTotalText}>₹{total}</Text>
              <Text style={styles.footerSubText}>GRAND TOTAL</Text>
            </View>
            
            <TouchableOpacity 
              id="proceed-to-checkout-btn"
              style={styles.checkoutBtn} 
              activeOpacity={0.9}
              onPress={() => router.push('/(customer)/checkout')}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <ArrowRight color={Colors.white} size={18} />
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
  itemsCard: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl, padding: Spacing[4], gap: Spacing[4] },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.neutral[50], paddingBottom: Spacing[3] },
  itemImage: { width: 60, height: 60, borderRadius: BorderRadius.lg },
  itemDetails: { flex: 1 },
  itemName: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[800] },
  itemUnit: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], marginTop: 2 },
  itemPrice: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[700], marginTop: 4 },
  actionsContainer: { alignItems: 'flex-end', gap: 8 },
  trashBtn: { padding: 4 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.neutral[200], borderRadius: BorderRadius.lg, paddingHorizontal: 6, height: 32 },
  qtyBtn: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[800] },
  couponCard: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl, padding: Spacing[4] },
  couponInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  couponInput: { flex: 1, fontSize: Typography.fontSize.sm, color: Colors.neutral[900] },
  applyBtn: { backgroundColor: Colors.brand[50], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  applyText: { color: Colors.brand[700], fontWeight: '700', fontSize: Typography.fontSize.xs },
  couponSuccess: { fontSize: Typography.fontSize.xs, color: Colors.brand[600], fontWeight: '600', marginTop: 8 },
  billCard: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl, padding: Spacing[4], gap: 12 },
  billTitle: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[800], marginBottom: 4 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billLabel: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500] },
  billVal: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral[800] },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: Colors.neutral[100], paddingTop: 12, marginTop: 4 },
  grandTotalLabel: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[800] },
  grandTotalVal: { fontSize: 20, fontWeight: '800', color: Colors.brand[700] },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.neutral[100], paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], flexDirection: 'row', gap: Spacing[4], alignItems: 'center' },
  footerTotal: { justifyContent: 'center' },
  footerTotalText: { fontSize: 20, fontWeight: '800', color: Colors.neutral[800] },
  footerSubText: { fontSize: 8, color: Colors.neutral[400], fontWeight: '700', letterSpacing: 0.5 },
  checkoutBtn: { flex: 1, height: 50, backgroundColor: Colors.brand[600], borderRadius: BorderRadius.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  checkoutText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[6] },
  emptyText: { fontSize: 18, color: Colors.neutral[500], fontWeight: '600', marginBottom: Spacing[4] },
  emptyBtn: { backgroundColor: Colors.brand[600], paddingHorizontal: 20, paddingVertical: 12, borderRadius: BorderRadius.xl },
  emptyBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSize.sm },
});

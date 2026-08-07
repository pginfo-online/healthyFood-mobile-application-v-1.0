import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, CreditCard, ChevronRight, Check } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';

const mockAddresses = [
  { id: 'addr1', label: 'Home', address: 'Flat 402, Marvel Crest, Kalyani Nagar, Pune' },
  { id: 'addr2', label: 'Office', address: 'Tech Park, Phase 2, Hinjewadi, Pune' },
];

export default function CheckoutScreen() {
  const [selectedAddress, setSelectedAddress] = useState('addr1');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    setTimeout(() => {
      setIsPlacing(false);
      // Place success, route to tracking page
      router.push({ pathname: '/(customer)/order-tracking/[id]', params: { id: 'ord1' } });
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          
          {mockAddresses.map((addr) => {
            const isSelected = selectedAddress === addr.id;
            return (
              <TouchableOpacity
                key={addr.id}
                id={`address-option-${addr.id}`}
                style={[styles.addressCard, isSelected && styles.cardActive]}
                onPress={() => setSelectedAddress(addr.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.labelRow}>
                    <MapPin color={isSelected ? Colors.brand[600] : Colors.neutral[500]} size={18} />
                    <Text style={[styles.addrLabel, isSelected && styles.textActive]}>{addr.label}</Text>
                  </View>
                  {isSelected && <Check color={Colors.brand[600]} size={16} />}
                </View>
                <Text style={styles.addrText}>{addr.address}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.addNewBtn} activeOpacity={0.7}>
            <Text style={styles.addNewText}>+ Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {/* Razorpay Online */}
          <TouchableOpacity
            id="payment-online"
            style={[styles.paymentCard, paymentMethod === 'online' && styles.cardActive]}
            onPress={() => setPaymentMethod('online')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentDetails}>
              <CreditCard color={paymentMethod === 'online' ? Colors.brand[600] : Colors.neutral[500]} size={20} />
              <View>
                <Text style={[styles.paymentLabel, paymentMethod === 'online' && styles.textActive]}>Razorpay Online</Text>
                <Text style={styles.paymentSub}>Pay securely via UPI, Cards, NetBanking</Text>
              </View>
            </View>
            {paymentMethod === 'online' && <Check color={Colors.brand[600]} size={16} />}
          </TouchableOpacity>

          {/* Cash on Delivery */}
          <TouchableOpacity
            id="payment-cod"
            style={[styles.paymentCard, paymentMethod === 'cod' && styles.cardActive]}
            onPress={() => setPaymentMethod('cod')}
            activeOpacity={0.8}
          >
            <View style={styles.paymentDetails}>
              <Text style={styles.codEmoji}>💵</Text>
              <View>
                <Text style={[styles.paymentLabel, paymentMethod === 'cod' && styles.textActive]}>Cash on Delivery (COD)</Text>
                <Text style={styles.paymentSub}>Pay with cash/UPI at delivery</Text>
              </View>
            </View>
            {paymentMethod === 'cod' && <Check color={Colors.brand[600]} size={16} />}
          </TouchableOpacity>
        </View>

        {/* Order Details Confirmation Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Health Transparency Promise</Text>
          <Text style={styles.summaryText}>
            We certify that 100% of the products in your order comply with their listed health tags and nutritional details.
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          id="checkout-place-order"
          style={[styles.placeOrderBtn, isPlacing && styles.btnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPlacing}
          activeOpacity={0.9}
        >
          {isPlacing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.placeOrderText}>Place Order (₹215)</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { padding: Spacing[4], gap: Spacing[5], paddingBottom: 100 },
  section: { gap: Spacing[3] },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[800], marginBottom: 2 },
  addressCard: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl, padding: Spacing[4], gap: 8,
  },
  cardActive: { borderColor: Colors.brand[500], backgroundColor: Colors.brand[50] },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addrLabel: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[700] },
  textActive: { color: Colors.brand[700] },
  addrText: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500], lineHeight: 20 },
  addNewBtn: {
    height: 48, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.brand[500],
    borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.brand[50],
  },
  addNewText: { color: Colors.brand[700], fontWeight: '700', fontSize: Typography.fontSize.sm },
  paymentCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl, padding: Spacing[4],
  },
  paymentDetails: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  codEmoji: { fontSize: 20 },
  paymentLabel: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[700] },
  paymentSub: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], marginTop: 2, marginRight: 8 },
  summaryCard: {
    backgroundColor: Colors.brand[50], borderRadius: BorderRadius.xl,
    padding: Spacing[4], borderWidth: 1, borderColor: Colors.brand[100],
  },
  summaryTitle: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.brand[700], marginBottom: 4 },
  summaryText: { fontSize: Typography.fontSize.xs, color: Colors.brand[800], lineHeight: 18 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.neutral[100],
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
  },
  placeOrderBtn: {
    height: 52, backgroundColor: Colors.brand[600],
    borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  placeOrderText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, FlatList, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, ShoppingBag, Plus, Search } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const mockStore = {
  id: 'store_a',
  name: 'Pune Healthy Mart',
  logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80',
  description: 'Your one-stop destination for organic greens, local millets, cold pressed oils and custom keto thalis.',
  rating: 4.8,
  deliveryTime: '20-30 mins',
  deliveryCharge: 30,
  minOrder: 150,
  address: 'Shop 12, Kalyani Nagar, Pune',
  hours: '9:00 AM - 10:00 PM',
};

const mockStoreProducts = [
  {
    id: 'p1',
    name: 'Organic Avocados',
    price: 180,
    discountPrice: 150,
    unit: '2 pcs',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&q=80',
    category: 'Fresh Fruits',
  },
  {
    id: 'p4',
    name: 'Organic Baby Spinach',
    price: 60,
    discountPrice: 45,
    unit: '200g',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&q=80',
    category: 'Vegetables',
  },
  {
    id: 'p5',
    name: 'Cold Pressed Coconut Oil',
    price: 320,
    discountPrice: 280,
    unit: '500ml',
    image: 'https://images.unsplash.com/photo-1622484211148-717498c0b1b1?w=200&q=80',
    category: 'Organic',
  },
];

const categories = ['All', 'Fresh Fruits', 'Vegetables', 'Organic'];

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const store = mockStore; // fallbacks to mock

  const filteredProducts = selectedCategory === 'All'
    ? mockStoreProducts
    : mockStoreProducts.filter(p => p.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.neutral[800]} size={20} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Search color={Colors.neutral[800]} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(customer)/cart')} activeOpacity={0.7}>
            <ShoppingBag color={Colors.neutral[800]} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Store Banner & Info */}
        <View style={styles.bannerInfo}>
          <Image source={{ uri: store.logo }} style={styles.logo} />
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.desc}>{store.description}</Text>

          <View style={styles.storeStats}>
            <View style={styles.stat}>
              <Star color={Colors.yellow[600]} size={16} fill={Colors.yellow[600]} />
              <Text style={styles.statVal}>{store.rating}</Text>
            </View>
            <Text style={styles.divider}>|</Text>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{store.deliveryTime}</Text>
            </View>
            <Text style={styles.divider}>|</Text>
            <View style={styles.stat}>
              <Text style={styles.statVal}>Min. ₹{store.minOrder}</Text>
            </View>
          </View>

          <View style={styles.metadataContainer}>
            <Text style={styles.metaText}>📍 {store.address}</Text>
            <Text style={styles.metaText}>🕒 {store.hours}</Text>
          </View>
        </View>

        {/* Categories Tab bar */}
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products List */}
        <View style={styles.productsContainer}>
          {filteredProducts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              activeOpacity={0.9}
              onPress={() => router.push({ pathname: `/(customer)/product/[id]`, params: { id: item.id } })}
            >
              <Image source={{ uri: item.image }} style={styles.productImage} />
              
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productUnit}>{item.unit}</Text>
                
                <View style={styles.productFooter}>
                  <View style={styles.priceRow}>
                    <Text style={styles.discountPrice}>₹{item.discountPrice}</Text>
                    <Text style={styles.originalPrice}>₹{item.price}</Text>
                  </View>

                  <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
                    <Plus color={Colors.white} size={16} />
                    <Text style={styles.addText}>ADD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    position: 'absolute', top: 50, left: 16, right: 16, zIndex: 10,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  scrollContent: { paddingBottom: Spacing[8] },
  bannerInfo: { alignItems: 'center', paddingTop: 90, paddingHorizontal: Spacing[4], borderBottomWidth: 1, borderBottomColor: Colors.neutral[100], paddingBottom: Spacing[4] },
  logo: { width: 80, height: 80, borderRadius: BorderRadius.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  name: { fontSize: 20, fontWeight: '700', color: Colors.neutral[800], marginTop: Spacing[3] },
  desc: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500], textAlign: 'center', marginTop: 4, paddingHorizontal: Spacing[4], lineHeight: 18 },
  storeStats: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: Spacing[4] },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statVal: { fontSize: 13, fontWeight: '700', color: Colors.neutral[700] },
  divider: { color: Colors.neutral[300] },
  metadataContainer: { marginTop: Spacing[3], gap: 4 },
  metaText: { fontSize: Typography.fontSize.xs, color: Colors.neutral[500], fontWeight: '500' },
  categoriesWrapper: { paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  categoriesScroll: { paddingLeft: Spacing[4], paddingRight: Spacing[2], gap: 8 },
  categoryBtn: { paddingHorizontal: 16, height: 32, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.neutral[200], justifyContent: 'center' },
  categoryBtnActive: { borderColor: Colors.brand[500], backgroundColor: Colors.brand[50] },
  categoryText: { fontSize: 12, color: Colors.neutral[600], fontWeight: '600' },
  categoryTextActive: { color: Colors.brand[700] },
  productsContainer: { padding: Spacing[4], gap: Spacing[4] },
  productCard: { flexDirection: 'row', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl, padding: Spacing[3], gap: Spacing[3] },
  productImage: { width: 90, height: 90, borderRadius: BorderRadius.lg },
  productDetails: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[800] },
  productUnit: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], marginTop: 2 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing[2] },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  discountPrice: { fontSize: 16, fontWeight: '700', color: Colors.neutral[800] },
  originalPrice: { fontSize: 12, color: Colors.neutral[400], textDecorationLine: 'line-through' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.brand[600], paddingHorizontal: 12, height: 32, borderRadius: BorderRadius.lg },
  addText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, FlatList, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ArrowLeft, SlidersHorizontal, Star } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';

const dietaryFilters = [
  'vegan', 'gluten-free', 'keto-friendly', 'organic', 'high-protein', 'low-sugar',
];

const mockProducts = [
  {
    id: 'p1',
    name: 'Organic Avocados',
    price: 180,
    discountPrice: 150,
    unit: '2 pcs',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&q=80',
    tags: ['organic', 'keto-friendly'],
    storeName: 'Pune Healthy Mart',
  },
  {
    id: 'p2',
    name: 'Almond Milk (Unsweetened)',
    price: 250,
    discountPrice: 220,
    unit: '1L',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&q=80',
    tags: ['vegan', 'gluten-free'],
    storeName: 'Organic World',
  },
  {
    id: 'p3',
    name: 'Organic Quinoa Grains',
    price: 350,
    discountPrice: 300,
    unit: '500g',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&q=80',
    tags: ['organic', 'gluten-free', 'high-protein'],
    storeName: 'Fresh Basket',
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || product.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Search */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.neutral[800]} size={24} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Search color={Colors.neutral[400]} size={20} />
          <TextInput
            id="product-search-input"
            style={styles.input}
            placeholder="Search healthy food, stores..."
            placeholderTextColor={Colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      {/* Dietary Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <View style={styles.filterIconBg}>
            <SlidersHorizontal color={Colors.neutral[600]} size={16} />
          </View>
          {dietaryFilters.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                id={`dietary-filter-${tag}`}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No healthy products match your search.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            id={`product-result-${item.id}`}
            style={styles.productCard}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: `/(customer)/product/[id]`, params: { id: item.id } })}
          >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productStore}>{item.storeName}</Text>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productUnit}>{item.unit}</Text>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.productFooter}>
                <View style={styles.priceRow}>
                  <Text style={styles.discountPrice}>₹{item.discountPrice}</Text>
                  <Text style={styles.originalPrice}>₹{item.price}</Text>
                </View>

                <View style={styles.ratingBg}>
                  <Star color={Colors.yellow[600]} size={12} fill={Colors.yellow[600]} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.neutral[50],
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[3],
    height: 48,
  },
  input: { flex: 1, color: Colors.neutral[900], fontSize: Typography.fontSize.base },
  filtersWrapper: {
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  filtersScroll: { paddingLeft: Spacing[4], paddingRight: Spacing[2], gap: 8 },
  filterIconBg: {
    width: 32, height: 32, borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[50], alignItems: 'center', justifyContent: 'center',
  },
  filterChip: {
    paddingHorizontal: Spacing[3], height: 32,
    borderRadius: BorderRadius.full, borderWidth: 1,
    borderColor: Colors.neutral[200], backgroundColor: Colors.white,
    justifyContent: 'center',
  },
  filterChipActive: {
    borderColor: Colors.brand[500],
    backgroundColor: Colors.brand[50],
  },
  filterText: { fontSize: 12, color: Colors.neutral[600], fontWeight: '500' },
  filterTextActive: { color: Colors.brand[700], fontWeight: '600' },
  listContainer: { padding: Spacing[4], gap: Spacing[4] },
  productCard: {
    flexDirection: 'row', backgroundColor: Colors.white, borderWidth: 1,
    borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl,
    padding: Spacing[3], gap: Spacing[3],
  },
  productImage: { width: 100, height: 100, borderRadius: BorderRadius.lg },
  productInfo: { flex: 1, justifyContent: 'center' },
  productStore: { fontSize: 10, color: Colors.brand[600], fontWeight: '700', textTransform: 'uppercase' },
  productName: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[800], marginTop: 2 },
  productUnit: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], marginTop: 2 },
  tagsContainer: { flexDirection: 'row', gap: 4, marginVertical: Spacing[2] },
  tagBadge: { backgroundColor: Colors.brand[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 9, color: Colors.brand[700], fontWeight: '600' },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  discountPrice: { fontSize: 16, fontWeight: '700', color: Colors.neutral[800] },
  originalPrice: { fontSize: 12, color: Colors.neutral[400], textDecorationLine: 'line-through' },
  ratingBg: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.yellow[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 11, fontWeight: '700', color: Colors.yellow[600] },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.neutral[400], fontSize: Typography.fontSize.sm },
});

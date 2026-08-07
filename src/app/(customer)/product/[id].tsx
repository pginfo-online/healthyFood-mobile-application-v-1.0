import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, ShoppingBag, Plus, Minus } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const mockProductDetails = {
  id: 'p1',
  name: 'Organic Avocados',
  brand: 'Fresh Farms',
  description: 'Rich, creamy Hass avocados sourced directly from organic orchards. High in healthy fats, fiber, and essential minerals.',
  price: 180,
  discountPrice: 150,
  unit: '2 pcs (approx. 350-400g)',
  image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80',
  dietaryTags: ['organic', 'keto-friendly', 'vegan', 'gluten-free'],
  healthScore: 'A',
  nutritionInfo: {
    servingSize: '100g',
    calories: 160,
    protein: 2,
    carbohydrates: 9,
    fat: 15,
    fiber: 7,
    sugar: 0.7,
    sodium: 7,
  },
  ingredients: ['100% Organic Hass Avocado'],
  allergens: ['None'],
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  // We can fallback to mock details for representation
  const product = mockProductDetails;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.neutral[800]} size={20} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsLiked(!isLiked)} activeOpacity={0.7}>
            <Heart color={isLiked ? Colors.red[500] : Colors.neutral[800]} fill={isLiked ? Colors.red[500] : 'transparent'} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(customer)/cart')} activeOpacity={0.7}>
            <ShoppingBag color={Colors.neutral[800]} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <Image source={{ uri: product.image }} style={styles.image} />

        <View style={styles.content}>
          {/* Main Info */}
          <Text style={styles.brand}>{product.brand}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{product.name}</Text>
            {product.healthScore && (
              <View style={[styles.healthBadge, styles[`score${product.healthScore}` as any]]}>
                <Text style={styles.healthText}>NutriScore {product.healthScore}</Text>
              </View>
            )}
          </View>
          <Text style={styles.unit}>{product.unit}</Text>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.discountPrice}>₹{product.discountPrice}</Text>
            <Text style={styles.originalPrice}>₹{product.price}</Text>
          </View>

          {/* Dietary Badges */}
          <View style={styles.tagsContainer}>
            {product.dietaryTags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag.toUpperCase().replace('-', ' ')}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>{product.description}</Text>

          {/* Nutritional Information (Core differentiator) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nutritional Information</Text>
            <Text style={styles.servingSize}>Per {product.nutritionInfo.servingSize}</Text>
          </View>

          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionVal}>{product.nutritionInfo.calories} kcal</Text>
              <Text style={styles.nutritionLabel}>Energy</Text>
            </View>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionVal}>{product.nutritionInfo.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionVal}>{product.nutritionInfo.carbohydrates}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionVal}>{product.nutritionInfo.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fats</Text>
            </View>
          </View>

          {/* Detailed Nutritional Rows */}
          <View style={styles.nutritionTable}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Dietary Fiber</Text>
              <Text style={styles.tableValue}>{product.nutritionInfo.fiber}g</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Sugars</Text>
              <Text style={styles.tableValue}>{product.nutritionInfo.sugar}g</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Sodium</Text>
              <Text style={styles.tableValue}>{product.nutritionInfo.sodium}mg</Text>
            </View>
          </View>

          {/* Ingredients & Allergens */}
          <View style={styles.extraContainer}>
            <Text style={styles.extraTitle}>Ingredients</Text>
            <Text style={styles.extraText}>{product.ingredients.join(', ')}</Text>

            <Text style={[styles.extraTitle, { marginTop: Spacing[4] }]}>Allergens</Text>
            <Text style={styles.extraText}>{product.allergens.join(', ')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Add To Cart */}
      <View style={styles.footer}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            activeOpacity={0.7}
          >
            <Minus color={Colors.neutral[800]} size={16} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => setQuantity(quantity + 1)}
            activeOpacity={0.7}
          >
            <Plus color={Colors.neutral[800]} size={16} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          id="add-to-cart-btn"
          style={styles.addToCartBtn} 
          activeOpacity={0.9}
          onPress={() => {
            router.push('/(customer)/cart');
          }}
        >
          <Text style={styles.addToCartText}>Add to Cart • ₹{product.discountPrice * quantity}</Text>
        </TouchableOpacity>
      </View>
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
  scrollContent: { paddingBottom: 100 },
  image: { width: width, height: width * 0.85, resizeMode: 'cover' },
  content: { padding: Spacing[4] },
  brand: { fontSize: 11, fontWeight: '700', color: Colors.brand[600], textTransform: 'uppercase' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.neutral[800], flex: 1 },
  healthBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  scoreA: { backgroundColor: '#15803d' },
  healthText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  unit: { fontSize: Typography.fontSize.sm, color: Colors.neutral[400], marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing[3] },
  discountPrice: { fontSize: 24, fontWeight: '800', color: Colors.neutral[800] },
  originalPrice: { fontSize: 16, color: Colors.neutral[400], textDecorationLine: 'line-through' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: Spacing[4] },
  tagBadge: { backgroundColor: Colors.brand[50], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, color: Colors.brand[700], fontWeight: '700' },
  description: { fontSize: Typography.fontSize.base, color: Colors.neutral[600], lineHeight: 22, marginBottom: Spacing[6] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing[3] },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.neutral[800] },
  servingSize: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400] },
  nutritionGrid: { flexDirection: 'row', gap: 8, marginBottom: Spacing[4] },
  nutritionCard: {
    flex: 1, backgroundColor: Colors.brand[50],
    borderRadius: BorderRadius.xl, padding: Spacing[3],
    alignItems: 'center', justifyContent: 'center',
  },
  nutritionVal: { fontSize: 16, fontWeight: '700', color: Colors.brand[700] },
  nutritionLabel: { fontSize: 10, color: Colors.neutral[500], marginTop: 2, fontWeight: '500' },
  nutritionTable: { borderTopWidth: 1, borderTopColor: Colors.neutral[100] },
  tableRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  tableLabel: { fontSize: Typography.fontSize.sm, color: Colors.neutral[600] },
  tableValue: { fontSize: Typography.fontSize.sm, fontWeight: '600', color: Colors.neutral[800] },
  extraContainer: { marginTop: Spacing[6], backgroundColor: Colors.neutral[50], padding: Spacing[4], borderRadius: BorderRadius.xl },
  extraTitle: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[800], marginBottom: 4 },
  extraText: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500], lineHeight: 20 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.neutral[100],
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    flexDirection: 'row', gap: Spacing[4], alignItems: 'center',
  },
  qtyContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl, paddingHorizontal: 8, height: 50,
  },
  qtyBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 16, fontWeight: '700', color: Colors.neutral[800] },
  addToCartBtn: {
    flex: 1, height: 50, backgroundColor: Colors.brand[600],
    borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center',
  },
  addToCartText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
});

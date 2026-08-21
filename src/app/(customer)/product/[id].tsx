import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, StatusBar, Dimensions, ActivityIndicator,
  FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, ShoppingBag, Plus, Minus, Star, ShieldCheck, Check } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { useCartStore } from '@/store/cart.store';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const { items, addItem, updateQuantity, getItemCount } = useCartStore();
  const cartItem = items.find((i) => i.productId === id);
  const currentQuantity = cartItem?.quantity || 1;
  const totalCartCount = getItemCount();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data?.data ?? res.data;
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch product details:', err);
        setError(err.response?.data?.message || 'Could not load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const storeId = typeof product.storeId === 'object' ? product.storeId?._id : product.storeId;
    addItem({
      productId: product._id || product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice || undefined,
      image: (product.images && product.images.length > 0) ? product.images[0] : (product.image || undefined),
      unit: product.unit || '1 unit',
      storeId: storeId || 'store_1',
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const prodId = product._id || product.id;
    if (cartItem) {
      updateQuantity(prodId, cartItem.quantity + delta);
    } else {
      if (delta > 0) {
        handleAddToCart();
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.brand[600]} />
        <Text style={styles.loadingText}>Loading healthy goodness...</Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.errorEmoji}>🥑</Text>
        <Text style={styles.errorTitle}>Oops! Product Unavailable</Text>
        <Text style={styles.errorSubtitle}>{error || 'This product might be out of stock or removed.'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const rawImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80'];

  const images = rawImages.filter(Boolean);
  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const storeName = typeof product.storeId === 'object' ? product.storeId?.name : (product.storeName || 'HealthyFood Verified Partner');
  const nutrition = product.nutritionInfo || {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft color={Colors.neutral[800]} size={20} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsLiked(!isLiked)} activeOpacity={0.8}>
            <Heart color={isLiked ? Colors.red[500] : Colors.neutral[800]} fill={isLiked ? Colors.red[500] : 'transparent'} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(customer)/cart' as any)} activeOpacity={0.8}>
            <ShoppingBag color={Colors.neutral[800]} size={20} />
            {totalCartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Images Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
            )}
          />
          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, activeImageIndex === idx && styles.activeDot]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Brand & Store */}
          <View style={styles.storeHeaderRow}>
            <Text style={styles.brand}>{product.brand || 'ORGANIC ESSENTIALS'}</Text>
            <View style={styles.verifiedStoreBadge}>
              <ShieldCheck size={12} color={Colors.brand[700]} />
              <Text style={styles.storeNameText} numberOfLines={1}>{storeName}</Text>
            </View>
          </View>

          {/* Title & NutriScore */}
          <View style={styles.titleRow}>
            <Text style={styles.name}>{product.name}</Text>
            {product.healthScore && (
              <View style={[styles.healthBadge, styles[`score${product.healthScore}` as keyof typeof styles] || styles.scoreDefault]}>
                <Text style={styles.healthText}>NutriScore {product.healthScore}</Text>
              </View>
            )}
          </View>

          <Text style={styles.unit}>{product.unit || '1 pack'}</Text>

          {/* Pricing & Ratings */}
          <View style={styles.priceAndRatingRow}>
            <View style={styles.priceRow}>
              <Text style={styles.discountPrice}>₹{finalPrice}</Text>
              {product.discountPrice > 0 && product.discountPrice < product.price && (
                <Text style={styles.originalPrice}>₹{product.price}</Text>
              )}
            </View>

            <View style={styles.ratingBadge}>
              <Star color={Colors.yellow[600]} size={14} fill={Colors.yellow[600]} />
              <Text style={styles.ratingText}>
                {product.averageRating ? product.averageRating.toFixed(1) : '4.8'}
              </Text>
              <Text style={styles.ratingCount}>
                ({product.totalRatings || 24})
              </Text>
            </View>
          </View>

          {/* Dietary Badges */}
          {product.dietaryTags && product.dietaryTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.dietaryTags.map((tag: string) => (
                <View key={tag} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag.toUpperCase().replace('-', ' ')}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>About this product</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Nutritional Information */}
          {(nutrition.calories || nutrition.protein || nutrition.carbohydrates || nutrition.fat) && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nutritional Information</Text>
                <Text style={styles.servingSize}>Per {nutrition.servingSize || '100g'}</Text>
              </View>

              <View style={styles.nutritionGrid}>
                {nutrition.calories !== undefined && (
                  <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionVal}>{nutrition.calories} kcal</Text>
                    <Text style={styles.nutritionLabel}>Energy</Text>
                  </View>
                )}
                {nutrition.protein !== undefined && (
                  <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionVal}>{nutrition.protein}g</Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                )}
                {nutrition.carbohydrates !== undefined && (
                  <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionVal}>{nutrition.carbohydrates}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                )}
                {nutrition.fat !== undefined && (
                  <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionVal}>{nutrition.fat}g</Text>
                    <Text style={styles.nutritionLabel}>Fats</Text>
                  </View>
                )}
              </View>

              {/* Detailed Breakdown */}
              <View style={styles.nutritionTable}>
                {nutrition.fiber !== undefined && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableLabel}>Dietary Fiber</Text>
                    <Text style={styles.tableValue}>{nutrition.fiber}g</Text>
                  </View>
                )}
                {nutrition.sugar !== undefined && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableLabel}>Sugars</Text>
                    <Text style={styles.tableValue}>{nutrition.sugar}g</Text>
                  </View>
                )}
                {nutrition.sodium !== undefined && (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableLabel}>Sodium</Text>
                    <Text style={styles.tableValue}>{nutrition.sodium}mg</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Ingredients & Allergens */}
          {((product.ingredients && product.ingredients.length > 0) || (product.allergens && product.allergens.length > 0)) && (
            <View style={styles.extraContainer}>
              {product.ingredients && product.ingredients.length > 0 && (
                <View>
                  <Text style={styles.extraTitle}>Ingredients</Text>
                  <Text style={styles.extraText}>{product.ingredients.join(', ')}</Text>
                </View>
              )}

              {product.allergens && product.allergens.length > 0 && (
                <View style={{ marginTop: Spacing[3] }}>
                  <Text style={styles.extraTitle}>Allergens Warning</Text>
                  <Text style={styles.extraText}>{product.allergens.join(', ')}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.footer}>
        {cartItem ? (
          <View style={styles.quantityControl}>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => handleQuantityChange(-1)}
              activeOpacity={0.7}
            >
              <Minus color={Colors.neutral[800]} size={18} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{cartItem.quantity}</Text>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => handleQuantityChange(1)}
              activeOpacity={0.7}
            >
              <Plus color={Colors.neutral[800]} size={18} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            id="add-to-cart-btn"
            style={[styles.addToCartBtn, addedAnimation && styles.addedCartBtn]} 
            activeOpacity={0.9}
            onPress={handleAddToCart}
          >
            {addedAnimation ? (
              <View style={styles.btnContent}>
                <Check color={Colors.white} size={20} />
                <Text style={styles.addToCartText}>Added to Cart</Text>
              </View>
            ) : (
              <View style={styles.btnContent}>
                <ShoppingBag color={Colors.white} size={18} />
                <Text style={styles.addToCartText}>Add to Cart • ₹{finalPrice}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {cartItem && (
          <TouchableOpacity
            style={styles.viewCartBtn}
            activeOpacity={0.9}
            onPress={() => router.push('/(customer)/cart' as any)}
          >
            <Text style={styles.viewCartText}>View Cart (₹{finalPrice * cartItem.quantity})</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  centerContainer: { flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', padding: Spacing[6] },
  loadingText: { marginTop: Spacing[3], fontSize: Typography.fontSize.sm, color: Colors.neutral[600], fontWeight: '500' },
  errorEmoji: { fontSize: 48, marginBottom: Spacing[3] },
  errorTitle: { fontSize: Typography.fontSize.lg, fontWeight: '700', color: Colors.neutral[900], marginBottom: Spacing[1] },
  errorSubtitle: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500], textAlign: 'center', marginBottom: Spacing[6] },
  backButton: { backgroundColor: Colors.brand[600], paddingHorizontal: Spacing[6], paddingVertical: Spacing[3], borderRadius: BorderRadius.xl },
  backButtonText: { color: Colors.white, fontWeight: '600', fontSize: Typography.fontSize.sm },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    position: 'absolute', top: 50, left: 16, right: 16, zIndex: 10,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  badge: {
    position: 'absolute', top: -3, right: -3,
    backgroundColor: Colors.brand[600], borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4, borderWidth: 1.5, borderColor: Colors.white,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },

  scrollContent: { paddingBottom: 120 },
  carouselContainer: { width: width, height: width * 0.85, position: 'relative' },
  image: { width: width, height: width * 0.85 },
  paginationDots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  activeDot: { width: 16, backgroundColor: Colors.brand[600] },

  content: { padding: Spacing[4] },
  storeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  brand: { fontSize: 11, fontWeight: '700', color: Colors.brand[600], letterSpacing: 0.5 },
  verifiedStoreBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.brand[50], paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: BorderRadius.full, maxWidth: '50%',
  },
  storeNameText: { fontSize: 10, fontWeight: '600', color: Colors.brand[800] },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.neutral[900], flex: 1, lineHeight: 28 },
  healthBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 4 },
  scoreA: { backgroundColor: '#15803d' },
  scoreB: { backgroundColor: '#65a30d' },
  scoreC: { backgroundColor: '#ca8a04' },
  scoreD: { backgroundColor: '#ea580c' },
  scoreE: { backgroundColor: '#dc2626' },
  scoreDefault: { backgroundColor: Colors.brand[700] },
  healthText: { color: Colors.white, fontSize: 10, fontWeight: '700' },

  unit: { fontSize: Typography.fontSize.sm, color: Colors.neutral[500], marginTop: 4 },

  priceAndRatingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing[3], paddingBottom: Spacing[3],
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  discountPrice: { fontSize: 24, fontWeight: '800', color: Colors.neutral[900] },
  originalPrice: { fontSize: 16, color: Colors.neutral[400], textDecorationLine: 'line-through' },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.yellow[50], paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.md,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: Colors.yellow[700] },
  ratingCount: { fontSize: 10, color: Colors.neutral[400] },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing[3] },
  tagBadge: { backgroundColor: Colors.brand[50], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, color: Colors.brand[700], fontWeight: '700' },

  sectionContainer: { marginTop: Spacing[5] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing[2] },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  servingSize: { fontSize: Typography.fontSize.xs, color: Colors.neutral[500] },
  description: { fontSize: Typography.fontSize.sm, color: Colors.neutral[600], lineHeight: 22, marginTop: 4 },

  nutritionGrid: { flexDirection: 'row', gap: 8, marginTop: Spacing[2], marginBottom: Spacing[3] },
  nutritionCard: {
    flex: 1, backgroundColor: Colors.brand[50],
    borderRadius: BorderRadius.xl, padding: Spacing[3],
    alignItems: 'center', justifyContent: 'center',
  },
  nutritionVal: { fontSize: 14, fontWeight: '700', color: Colors.brand[800] },
  nutritionLabel: { fontSize: 10, color: Colors.neutral[500], marginTop: 2, fontWeight: '500' },

  nutritionTable: { borderTopWidth: 1, borderTopColor: Colors.neutral[100] },
  tableRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing[2], borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  tableLabel: { fontSize: Typography.fontSize.xs, color: Colors.neutral[600] },
  tableValue: { fontSize: Typography.fontSize.xs, fontWeight: '600', color: Colors.neutral[800] },

  extraContainer: {
    marginTop: Spacing[5], backgroundColor: Colors.neutral[50],
    padding: Spacing[4], borderRadius: BorderRadius.xl,
  },
  extraTitle: { fontSize: Typography.fontSize.xs, fontWeight: '700', color: Colors.neutral[800], marginBottom: 4, textTransform: 'uppercase' },
  extraText: { fontSize: Typography.fontSize.xs, color: Colors.neutral[600], lineHeight: 18 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.neutral[100],
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    flexDirection: 'row', gap: Spacing[3], alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 8,
  },
  quantityControl: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl, paddingHorizontal: 12, height: 48,
  },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900], minWidth: 20, textAlign: 'center' },

  addToCartBtn: {
    flex: 1, height: 48, backgroundColor: Colors.brand[600],
    borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center',
  },
  addedCartBtn: { backgroundColor: Colors.green[600] },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addToCartText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

  viewCartBtn: {
    flex: 1, height: 48, backgroundColor: Colors.brand[600],
    borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center',
  },
  viewCartText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});

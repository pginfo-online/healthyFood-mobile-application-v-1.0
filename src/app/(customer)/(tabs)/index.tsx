import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, StatusBar,
  Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, ChevronDown, Bell, Star, ShoppingCart, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';
import api from '@/services/api';
import { useAddressStore } from '@/store/address.store';
import { useCartStore } from '@/store/cart.store';

const { width } = Dimensions.get('window');

export default function CustomerHomeScreen() {
  const { getDisplayAddress, selectedCity } = useAddressStore();
  const { items, getTotal } = useCartStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayAddress = getDisplayAddress();
  const cartTotal = getTotal();
  const cartItemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const fetchData = async () => {
    try {
      const [catRes, storeRes] = await Promise.all([
        api.get('/categories', { params: { isActive: true } }).catch(() => ({ data: [] })),
        api.get('/stores/nearby', { params: { city: selectedCity?.name } }).catch(() =>
          api.get('/stores', { params: { status: 'approved' } }).catch(() => ({ data: { data: [] } }))
        ),
      ]);

      const catData = catRes.data?.data ?? catRes.data ?? [];
      const storeData = storeRes.data?.data ?? storeRes.data ?? [];
      setCategories(Array.isArray(catData) ? catData : []);
      setStores(Array.isArray(storeData) ? storeData : []);
    } catch (e) {
      console.error('Failed to fetch home screen data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCity?.name]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          id="btn-deliver-to"
          style={styles.locationContainer}
          activeOpacity={0.7}
          onPress={() => router.push('/(customer)/city-select' as any)}
        >
          <View style={styles.locationPinBg}>
            <MapPin color={Colors.brand[600]} size={18} />
          </View>
          <View style={styles.locationText}>
            <Text style={styles.deliverTo}>DELIVER TO</Text>
            <View style={styles.addressSelector}>
              <Text style={styles.address} numberOfLines={1}>{displayAddress}</Text>
              <ChevronDown color={Colors.neutral[600]} size={15} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconBtn} 
          activeOpacity={0.7}
          onPress={() => router.push('/(customer)/(tabs)/cart' as any)}
        >
          <ShoppingCart color={Colors.neutral[800]} size={20} />
          {cartItemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.brand[600]]} />}
      >
        {/* Search Bar */}
        <TouchableOpacity 
          id="home-search-bar"
          style={styles.searchContainer} 
          activeOpacity={0.9}
          onPress={() => router.push('/(customer)/(tabs)/search' as any)}
        >
          <Search color={Colors.neutral[400]} size={18} />
          <Text style={styles.searchText}>Search organic fruits, salads, cold-pressed oils...</Text>
        </TouchableOpacity>

        {/* Promo Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerTextContainer}>
            <View style={styles.pillBadge}>
              <Text style={styles.pillText}>100% ORGANIC & FRESH</Text>
            </View>
            <Text style={styles.bannerTitle}>Healthy Diet,{'\n'}Delivered Fast</Text>
            <TouchableOpacity 
              style={styles.bannerBtn} 
              activeOpacity={0.8}
              onPress={() => router.push('/(customer)/(tabs)/search' as any)}
            >
              <Text style={styles.bannerBtnText}>Explore Menu</Text>
              <ArrowRight color={Colors.white} size={14} />
            </TouchableOpacity>
          </View>
          <View style={styles.bannerEmojiContainer}>
            <Text style={styles.bannerEmoji}>🥑</Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.push('/(customer)/(tabs)/search' as any)}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.categoriesLoading}>
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} style={styles.categorySkeleton} />
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((cat) => {
              const catId = cat._id || cat.id;
              return (
                <TouchableOpacity
                  key={catId}
                  id={`cat-card-${catId}`}
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/(customer)/(tabs)/search' as any, params: { categoryId: catId } })}
                >
                  <View style={styles.categoryImageWrapper}>
                    {cat.image ? (
                      <Image source={{ uri: cat.image }} style={styles.categoryImg} resizeMode="cover" />
                    ) : (
                      <View style={styles.categoryFallbackBg}>
                        <Text style={styles.categoryFallbackEmoji}>🌿</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Stores Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Healthy Stores Near You</Text>
          <Text style={styles.storesCountText}>{stores.length} available</Text>
        </View>

        {loading ? (
          <View style={{ padding: Spacing[4], alignItems: 'center' }}>
            <ActivityIndicator size="small" color={Colors.brand[600]} />
          </View>
        ) : stores.length === 0 ? (
          <View style={styles.emptyStoresCard}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🏪</Text>
            <Text style={styles.emptyStoresTitle}>No active stores in {selectedCity?.name || 'this area'}</Text>
            <Text style={styles.emptyStoresSubtitle}>
              Tap the location header above to switch cities or explore available categories!
            </Text>
          </View>
        ) : (
          <View style={styles.storesList}>
            {stores.map((store) => {
              const storeId = store._id ?? store.id;
              return (
                <TouchableOpacity 
                  key={storeId} 
                  id={`store-card-${storeId}`}
                  style={styles.storeCard} 
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: `/(customer)/store/[id]` as any, params: { id: storeId } })}
                >
                  <Image
                    source={{ uri: store.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' }}
                    style={styles.storeLogo}
                  />
                  
                  <View style={styles.storeDetails}>
                    <View style={styles.storeNameRow}>
                      <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
                      <View style={styles.ratingBg}>
                        <Star color={Colors.yellow[600]} size={12} fill={Colors.yellow[600]} />
                        <Text style={styles.ratingText}>{store.averageRating ? Number(store.averageRating).toFixed(1) : '4.8'}</Text>
                      </View>
                    </View>

                    <Text style={styles.storeAddressText} numberOfLines={1}>
                      {store.addressLine || store.city || 'Verified Healthy Partner'}
                    </Text>

                    <View style={styles.tagsContainer}>
                      {(store.tags || ['Organic', 'Farm Fresh', 'Cold-Pressed']).slice(0, 3).map((tag: string) => (
                        <View key={tag} style={styles.tagBadge}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.storeFooter}>
                      <Text style={styles.infoText}>🛵 25-35 mins</Text>
                      <Text style={styles.infoDot}>•</Text>
                      <Text style={styles.infoText}>Min ₹{store.minimumOrderValue || 100}</Text>
                      <Text style={styles.infoDot}>•</Text>
                      <Text style={styles.infoText}>
                        {store.deliveryCharge === 0 ? 'FREE Del' : `₹${store.deliveryCharge || 30} Del`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Cart Preview if items exist */}
      {cartItemCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.floatingCartBar}
            onPress={() => router.push('/(customer)/(tabs)/cart' as any)}
            activeOpacity={0.9}
          >
            <View style={styles.floatingCartLeft}>
              <View style={styles.cartCountCircle}>
                <Text style={styles.cartCountNum}>{cartItemCount}</Text>
              </View>
              <View>
                <Text style={styles.floatingCartPrice}>₹{cartTotal}</Text>
                <Text style={styles.floatingCartSub}>plus taxes</Text>
              </View>
            </View>

            <View style={styles.floatingCartRight}>
              <Text style={styles.floatingViewCart}>View Cart</Text>
              <ArrowRight color={Colors.white} size={16} />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2.5], flex: 1 },
  locationPinBg: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  locationText: { flex: 1 },
  deliverTo: { fontSize: 9, fontWeight: '800', color: Colors.neutral[400], letterSpacing: 0.5 },
  addressSelector: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  address: { fontSize: 13, fontWeight: '700', color: Colors.neutral[900], maxWidth: '85%' },
  iconBtn: {
    width: 38, height: 38, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.neutral[50], position: 'relative',
  },
  badge: {
    position: 'absolute', top: 6, right: 6,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.brand[600], alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },

  scrollContent: { paddingBottom: Spacing[12] },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    backgroundColor: Colors.neutral[50], borderWidth: 1,
    borderColor: Colors.neutral[200], borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing[4], marginTop: Spacing[3], marginBottom: Spacing[4],
    paddingHorizontal: Spacing[3.5], height: 46,
  },
  searchText: { color: Colors.neutral[400], fontSize: Typography.fontSize.xs, flex: 1 },

  bannerContainer: {
    backgroundColor: '#052e16',
    borderRadius: BorderRadius['2xl'],
    marginHorizontal: Spacing[4],
    padding: Spacing[4.5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[5],
  },
  bannerTextContainer: { flex: 1, paddingRight: Spacing[2] },
  pillBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full,
  },
  pillText: { color: Colors.brand[300], fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  bannerTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', marginTop: Spacing[1.5], lineHeight: 22 },
  bannerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.brand[600], borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[3], paddingVertical: 6,
    alignSelf: 'flex-start', marginTop: Spacing[2.5],
  },
  bannerBtnText: { color: Colors.white, fontWeight: '700', fontSize: 11 },
  bannerEmojiContainer: { width: 64, height: 64, justifyContent: 'center', alignItems: 'center' },
  bannerEmoji: { fontSize: 44 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing[4], marginBottom: Spacing[3],
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },
  seeAll: { fontSize: Typography.fontSize.xs, color: Colors.brand[600], fontWeight: '700' },
  storesCountText: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400] },

  categoriesLoading: { flexDirection: 'row', paddingHorizontal: Spacing[4], gap: 12 },
  categorySkeleton: { width: 70, height: 70, borderRadius: BorderRadius.xl, backgroundColor: Colors.neutral[100] },

  categoriesScroll: { paddingLeft: Spacing[4], paddingRight: Spacing[2], marginBottom: Spacing[5] },
  categoryCard: { marginRight: Spacing[3], alignItems: 'center', width: 72 },
  categoryImageWrapper: {
    width: 58, height: 58, borderRadius: BorderRadius.xl,
    backgroundColor: Colors.brand[50], overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.brand[100],
    marginBottom: 6,
  },
  categoryImg: { width: 58, height: 58 },
  categoryFallbackBg: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  categoryFallbackEmoji: { fontSize: 24 },
  categoryName: { fontSize: 11, color: Colors.neutral[700], fontWeight: '600', textAlign: 'center' },

  storesList: { paddingHorizontal: Spacing[4], gap: Spacing[3] },
  storeCard: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl,
    padding: Spacing[3], gap: Spacing[3],
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  storeLogo: { width: 76, height: 76, borderRadius: BorderRadius.lg, backgroundColor: Colors.neutral[100] },
  storeDetails: { flex: 1, justifyContent: 'center' },
  storeNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[900], flex: 1 },
  storeAddressText: { fontSize: 10, color: Colors.neutral[400], marginTop: 2 },
  ratingBg: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.yellow[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: Colors.yellow[700] },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4, marginBottom: 6 },
  tagBadge: { backgroundColor: Colors.neutral[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 9, color: Colors.neutral[500], fontWeight: '600' },
  storeFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 10, color: Colors.neutral[500], fontWeight: '500' },
  infoDot: { fontSize: 6, color: Colors.neutral[300] },

  emptyStoresCard: {
    padding: Spacing[6], alignItems: 'center',
    marginHorizontal: Spacing[4], backgroundColor: Colors.neutral[50], borderRadius: BorderRadius.xl,
  },
  emptyStoresTitle: { fontSize: Typography.fontSize.sm, color: Colors.neutral[700], fontWeight: '700', textAlign: 'center' },
  emptyStoresSubtitle: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], textAlign: 'center', marginTop: 4 },

  floatingCartContainer: {
    position: 'absolute', bottom: 12, left: 16, right: 16,
  },
  floatingCartBar: {
    backgroundColor: Colors.brand[700], borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
  floatingCartLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  cartCountCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
  },
  cartCountNum: { color: Colors.brand[700], fontSize: 11, fontWeight: '800' },
  floatingCartPrice: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  floatingCartSub: { color: Colors.brand[200], fontSize: 9 },
  floatingCartRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  floatingViewCart: { color: Colors.white, fontSize: 13, fontWeight: '700' },
});

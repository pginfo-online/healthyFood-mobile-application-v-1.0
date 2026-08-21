import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, FlatList, Image, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ArrowLeft, SlidersHorizontal, Star, Plus, Check, Store, Package, X } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';
import { useCartStore } from '@/store/cart.store';

const dietaryFilters = [
  'vegan', 'organic', 'gluten-free', 'keto-friendly', 'high-protein', 'low-sugar', 'dairy-free',
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'products' | 'stores'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.categoryId || null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const { addItem } = useCartStore();

  // Load categories
  useEffect(() => {
    api.get('/categories', { params: { isActive: true } })
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  // Update selectedCategory if params change
  useEffect(() => {
    if (params.categoryId) {
      setSelectedCategory(params.categoryId);
    }
  }, [params.categoryId]);

  const searchData = async () => {
    setLoading(true);
    try {
      if (searchType === 'products') {
        const queryParams: Record<string, string> = {};
        if (searchQuery.trim()) queryParams.search = searchQuery.trim();
        if (selectedTag) queryParams.dietaryTags = selectedTag;
        if (selectedCategory) queryParams.categoryId = selectedCategory;

        const res = await api.get('/products', { params: queryParams });
        const data = res.data?.data ?? res.data ?? [];
        setProducts(Array.isArray(data) ? data : []);
      } else {
        const queryParams: Record<string, string> = { status: 'approved' };
        if (searchQuery.trim()) queryParams.search = searchQuery.trim();

        const res = await api.get('/stores', { params: queryParams });
        const data = res.data?.data ?? res.data ?? [];
        setStores(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to search:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedTag, selectedCategory, searchType]);

  const toggleTag = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategory(selectedCategory === catId ? null : catId);
  };

  const handleAddToCart = (item: any) => {
    const prodId = item._id || item.id;
    const storeId = typeof item.storeId === 'object' ? item.storeId?._id : item.storeId;
    addItem({
      productId: prodId,
      name: item.name,
      price: item.price,
      discountPrice: item.discountPrice || undefined,
      image: (item.images && item.images.length > 0) ? item.images[0] : item.image,
      unit: item.unit || '1 unit',
      storeId: storeId || 'store_1',
    });

    setAddedItemIds((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [prodId]: false }));
    }, 1200);
  };

  const clearAllFilters = () => {
    setSelectedTag(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const hasActiveFilters = Boolean(selectedTag || selectedCategory || searchQuery);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Search */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.neutral[800]} size={22} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Search color={Colors.neutral[400]} size={18} />
          <TextInput
            id="product-search-input"
            style={styles.input}
            placeholder={searchType === 'products' ? 'Search organic fruits, salads, whey...' : 'Search organic stores by name, city...'}
            placeholderTextColor={Colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={!params.categoryId}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X color={Colors.neutral[400]} size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mode Switcher: Products vs Stores */}
      <View style={styles.typeSwitcher}>
        <TouchableOpacity
          style={[styles.typeTab, searchType === 'products' && styles.typeTabActive]}
          onPress={() => setSearchType('products')}
          activeOpacity={0.8}
        >
          <Package size={14} color={searchType === 'products' ? Colors.brand[700] : Colors.neutral[500]} />
          <Text style={[styles.typeTabText, searchType === 'products' && styles.typeTabTextActive]}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeTab, searchType === 'stores' && styles.typeTabActive]}
          onPress={() => setSearchType('stores')}
          activeOpacity={0.8}
        >
          <Store size={14} color={searchType === 'stores' ? Colors.brand[700] : Colors.neutral[500]} />
          <Text style={[styles.typeTabText, searchType === 'stores' && styles.typeTabTextActive]}>Stores</Text>
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearAllFilters} activeOpacity={0.7}>
            <Text style={styles.clearFiltersText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills (Products mode only) */}
      {searchType === 'products' && categories.length > 0 && (
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {categories.map((cat) => {
              const catId = cat._id || cat.id;
              const isSelected = selectedCategory === catId;
              return (
                <TouchableOpacity
                  key={catId}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => toggleCategory(catId)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Dietary Filter Chips (Products mode only) */}
      {searchType === 'products' && (
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            <View style={styles.filterIconBg}>
              <SlidersHorizontal color={Colors.neutral[600]} size={14} />
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
      )}

      {/* Results List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.brand[600]} />
        </View>
      ) : searchType === 'products' ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No healthy products found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search terms or clearing the active filters.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const itemId = item._id || item.id;
            const isAdded = Boolean(addedItemIds[itemId]);
            const finalPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
            const storeName = typeof item.storeId === 'object' ? item.storeId?.name : (item.storeName || 'Verified Partner');
            const imgUri = (item.images && item.images.length > 0) ? item.images[0] : (item.image || 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&q=80');

            return (
              <TouchableOpacity
                id={`product-result-${itemId}`}
                style={styles.productCard}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: `/(customer)/product/[id]` as any, params: { id: itemId } })}
              >
                <Image source={{ uri: imgUri }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productStore} numberOfLines={1}>{storeName}</Text>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productUnit}>{item.unit || '1 unit'}</Text>

                  {/* Tags */}
                  {(item.dietaryTags || []).length > 0 && (
                    <View style={styles.tagsContainer}>
                      {item.dietaryTags.slice(0, 2).map((tag: string) => (
                        <View key={tag} style={styles.tagBadge}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.productFooter}>
                    <View style={styles.priceRow}>
                      <Text style={styles.discountPrice}>₹{finalPrice}</Text>
                      {item.discountPrice > 0 && item.discountPrice < item.price && (
                        <Text style={styles.originalPrice}>₹{item.price}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      id={`add-btn-${itemId}`}
                      style={[styles.addBtn, isAdded && styles.addBtnSuccess]}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleAddToCart(item);
                      }}
                      activeOpacity={0.8}
                    >
                      {isAdded ? (
                        <Check color={Colors.white} size={14} />
                      ) : (
                        <>
                          <Plus color={Colors.brand[700]} size={14} />
                          <Text style={styles.addBtnText}>ADD</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        /* Stores Search Results */
        <FlatList
          data={stores}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🏪</Text>
              <Text style={styles.emptyTitle}>No stores found</Text>
              <Text style={styles.emptySubtitle}>Try searching for a different city or store name.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const storeId = item._id ?? item.id;
            return (
              <TouchableOpacity
                key={storeId}
                id={`store-card-${storeId}`}
                style={styles.storeCard}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: `/(customer)/store/[id]` as any, params: { id: storeId } })}
              >
                <Image
                  source={{ uri: item.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' }}
                  style={styles.storeLogo}
                />
                
                <View style={styles.storeDetails}>
                  <View style={styles.storeNameRow}>
                    <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.ratingBg}>
                      <Star color={Colors.yellow[600]} size={12} fill={Colors.yellow[600]} />
                      <Text style={styles.ratingText}>{item.averageRating ? Number(item.averageRating).toFixed(1) : '4.8'}</Text>
                    </View>
                  </View>

                  <Text style={styles.storeAddressText} numberOfLines={1}>
                    {item.addressLine || item.city || 'Verified Partner'}
                  </Text>

                  <View style={styles.storeFooter}>
                    <Text style={styles.infoText}>🛵 25-35 mins</Text>
                    <Text style={styles.infoDot}>•</Text>
                    <Text style={styles.infoText}>Min ₹{item.minimumOrderValue || 100}</Text>
                    <Text style={styles.infoDot}>•</Text>
                    <Text style={styles.infoText}>
                      {item.deliveryCharge === 0 ? 'FREE Del' : `₹${item.deliveryCharge || 30} Del`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[2.5],
    gap: Spacing[2], borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    backgroundColor: Colors.neutral[50], borderWidth: 1, borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl, paddingHorizontal: Spacing[3], height: 44,
  },
  input: { flex: 1, color: Colors.neutral[900], fontSize: Typography.fontSize.sm },
  clearBtn: { padding: 4 },

  typeSwitcher: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[2.5],
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  typeTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing[3.5], paddingVertical: 6,
    borderRadius: BorderRadius.lg, backgroundColor: Colors.neutral[100],
  },
  typeTabActive: { backgroundColor: Colors.brand[50] },
  typeTabText: { fontSize: 12, fontWeight: '600', color: Colors.neutral[600] },
  typeTabTextActive: { color: Colors.brand[800], fontWeight: '700' },
  clearFiltersBtn: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 4 },
  clearFiltersText: { fontSize: 11, color: Colors.brand[600], fontWeight: '700' },

  categoriesWrapper: {
    paddingVertical: Spacing[2],
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  categoriesScroll: { paddingHorizontal: Spacing[4], gap: 8 },
  categoryPill: {
    paddingHorizontal: Spacing[3], paddingVertical: 5,
    borderRadius: BorderRadius.full, backgroundColor: Colors.neutral[50],
    borderWidth: 1, borderColor: Colors.neutral[200],
  },
  categoryPillActive: {
    backgroundColor: Colors.brand[600], borderColor: Colors.brand[600],
  },
  categoryPillText: { fontSize: 11, fontWeight: '600', color: Colors.neutral[700] },
  categoryPillTextActive: { color: Colors.white },

  filtersWrapper: {
    paddingVertical: Spacing[2],
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  filtersScroll: { paddingHorizontal: Spacing[4], gap: 6 },
  filterIconBg: {
    width: 28, height: 28, borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[50], alignItems: 'center', justifyContent: 'center',
  },
  filterChip: {
    paddingHorizontal: Spacing[3], height: 28,
    borderRadius: BorderRadius.full, borderWidth: 1,
    borderColor: Colors.neutral[200], backgroundColor: Colors.white,
    justifyContent: 'center',
  },
  filterChipActive: { borderColor: Colors.brand[500], backgroundColor: Colors.brand[50] },
  filterText: { fontSize: 11, color: Colors.neutral[600], fontWeight: '500' },
  filterTextActive: { color: Colors.brand[700], fontWeight: '700' },

  listContainer: { padding: Spacing[4], gap: Spacing[3] },
  productCard: {
    flexDirection: 'row', backgroundColor: Colors.white, borderWidth: 1,
    borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl,
    padding: Spacing[3], gap: Spacing[3],
  },
  productImage: { width: 88, height: 88, borderRadius: BorderRadius.lg, backgroundColor: Colors.neutral[100] },
  productInfo: { flex: 1, justifyContent: 'center' },
  productStore: { fontSize: 9, color: Colors.brand[600], fontWeight: '800', textTransform: 'uppercase' },
  productName: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[900], marginTop: 1 },
  productUnit: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], marginTop: 1 },
  tagsContainer: { flexDirection: 'row', gap: 4, marginVertical: 4 },
  tagBadge: { backgroundColor: Colors.brand[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 9, color: Colors.brand[700], fontWeight: '700' },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  discountPrice: { fontSize: 15, fontWeight: '800', color: Colors.neutral[900] },
  originalPrice: { fontSize: 11, color: Colors.neutral[400], textDecorationLine: 'line-through' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: Colors.brand[50], borderWidth: 1, borderColor: Colors.brand[200],
    paddingHorizontal: Spacing[3], paddingVertical: 4, borderRadius: BorderRadius.lg,
  },
  addBtnSuccess: { backgroundColor: Colors.green[600], borderColor: Colors.green[600] },
  addBtnText: { fontSize: 11, fontWeight: '800', color: Colors.brand[700] },

  storeCard: {
    flexDirection: 'row', backgroundColor: Colors.white, borderWidth: 1,
    borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl,
    padding: Spacing[3], gap: Spacing[3],
  },
  storeLogo: { width: 72, height: 72, borderRadius: BorderRadius.lg, backgroundColor: Colors.neutral[100] },
  storeDetails: { flex: 1, justifyContent: 'center' },
  storeNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[900], flex: 1 },
  storeAddressText: { fontSize: 10, color: Colors.neutral[400], marginTop: 2 },
  ratingBg: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.yellow[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  ratingText: { fontSize: 11, fontWeight: '700', color: Colors.yellow[700] },
  storeFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  infoText: { fontSize: 10, color: Colors.neutral[500], fontWeight: '500' },
  infoDot: { fontSize: 6, color: Colors.neutral[300] },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing[8] },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing[2] },
  emptyTitle: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[700] },
  emptySubtitle: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], textAlign: 'center', marginTop: 4, maxWidth: '80%' },
});

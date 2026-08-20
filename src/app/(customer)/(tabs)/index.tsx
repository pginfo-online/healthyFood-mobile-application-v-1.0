import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, FlatList, StatusBar,
  Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, ChevronDown, Bell, Star } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';
import api from '@/services/api';

const { width } = Dimensions.get('window');

export default function CustomerHomeScreen() {
  const [address, setAddress] = useState('Kalyani Nagar, Pune');
  const [categories, setCategories] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [catRes, storeRes] = await Promise.all([
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/stores').catch(() => ({ data: { data: [] } })),
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
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin color={Colors.brand[600]} size={20} />
          <View style={styles.locationText}>
            <Text style={styles.deliverTo}>DELIVER TO</Text>
            <TouchableOpacity style={styles.addressSelector} activeOpacity={0.7}>
              <Text style={styles.address} numberOfLines={1}>{address}</Text>
              <ChevronDown color={Colors.neutral[600]} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
          <Bell color={Colors.neutral[800]} size={20} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer} 
          activeOpacity={0.9}
          onPress={() => router.push('/(customer)/(tabs)/search')}
        >
          <Search color={Colors.neutral[400]} size={20} />
          <Text style={styles.searchText}>Search organic fruits, salads, whey...</Text>
        </TouchableOpacity>

        {/* Promo Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerSubtitle}>GET UP TO 50% OFF</Text>
            <Text style={styles.bannerTitle}>Healthy & Delicious Grocery Delivery</Text>
            <TouchableOpacity style={styles.bannerBtn} activeOpacity={0.8}>
              <Text style={styles.bannerBtnText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerEmojiContainer}>
            <Text style={styles.bannerEmoji}>🥗</Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard} activeOpacity={0.8}>
              <View style={styles.categoryEmojiBg}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stores Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Healthy Stores</Text>
        </View>

        {stores.length === 0 ? (
          <View style={{ padding: Spacing[6], alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🏪</Text>
            <Text style={{ fontSize: Typography.fontSize.sm, color: Colors.neutral[600], fontWeight: '600' }}>
              No stores nearby
            </Text>
            <Text style={{ fontSize: Typography.fontSize.xs, color: Colors.neutral[400], marginTop: 2 }}>
              Check back soon as new healthy stores get approved!
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
                      <Text style={styles.storeName}>{store.name}</Text>
                      <View style={styles.ratingBg}>
                        <Star color={Colors.yellow[600]} size={12} fill={Colors.yellow[600]} />
                        <Text style={styles.ratingText}>{store.averageRating || '4.8'}</Text>
                      </View>
                    </View>

                    <View style={styles.tagsContainer}>
                      {(store.tags || ['Organic', 'Keto']).map((tag: string) => (
                        <View key={tag} style={styles.tagBadge}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.storeFooter}>
                      <Text style={styles.infoText}>🛵 {store.deliveryTime || '20-30 mins'}</Text>
                      <Text style={styles.infoDot}>•</Text>
                      <Text style={styles.infoText}>Min. ₹{store.minimumOrderValue || 150}</Text>
                      <Text style={styles.infoDot}>•</Text>
                      <Text style={styles.infoText}>Charge ₹{store.deliveryCharge || 30}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], flex: 1 },
  locationText: { flex: 1 },
  deliverTo: { fontSize: 9, fontWeight: '700', color: Colors.neutral[400], letterSpacing: 0.5 },
  addressSelector: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  address: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[800], maxWidth: '85%' },
  iconBtn: {
    width: 40, height: 40, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.neutral[50], position: 'relative',
  },
  badge: {
    position: 'absolute', top: 10, right: 12,
    width: 8, height: 8, borderRadius: BorderRadius.full,
    backgroundColor: Colors.red[500],
  },
  scrollContent: { paddingBottom: Spacing[8] },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    backgroundColor: Colors.neutral[50], borderInterfaceWidth: 1,
    borderColor: Colors.neutral[200], borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing[4], marginVertical: Spacing[4],
    paddingHorizontal: Spacing[4], height: 50,
  },
  searchText: { color: Colors.neutral[400], fontSize: Typography.fontSize.sm },
  bannerContainer: {
    backgroundColor: Colors.brand[950],
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing[4],
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[6],
  },
  bannerTextContainer: { flex: 1, pr: Spacing[2] },
  bannerSubtitle: { color: Colors.brand[300], fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  bannerTitle: { color: Colors.white, fontSize: 18, fontWeight: '700', marginTop: Spacing[1], lineHeight: 24 },
  bannerBtn: {
    backgroundColor: Colors.brand[500],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    alignSelf: 'flex-start',
    marginTop: Spacing[3],
  },
  bannerBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSize.xs },
  bannerEmojiContainer: { width: 70, height: 70, justifyContent: 'center', alignItems: 'center' },
  bannerEmoji: { fontSize: 50 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing[4], marginBottom: Spacing[3],
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.neutral[800] },
  seeAll: { fontSize: Typography.fontSize.sm, color: Colors.brand[600], fontWeight: '600' },
  categoriesScroll: { paddingLeft: Spacing[4], paddingRight: Spacing[2], marginBottom: Spacing[6] },
  categoryCard: { marginRight: Spacing[3], alignItems: 'center', width: 80 },
  categoryEmojiBg: {
    width: 60, height: 60, borderRadius: BorderRadius.xl,
    backgroundColor: Colors.brand[50], alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[1.5],
  },
  categoryEmoji: { fontSize: 28 },
  categoryName: { fontSize: Typography.fontSize.xs, color: Colors.neutral[700], fontWeight: '600', textAlign: 'center' },
  storesList: { paddingHorizontal: Spacing[4], gap: Spacing[4] },
  storeCard: {
    flexDirection: 'row', backgroundColor: Colors.white, borderSize: 1,
    borderColor: Colors.neutral[100], borderRadius: BorderRadius.xl,
    padding: Spacing[3], gap: Spacing[3],
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  storeLogo: { width: 80, height: 80, borderRadius: BorderRadius.lg },
  storeDetails: { flex: 1, justifyContent: 'center' },
  storeNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[800], flex: 1 },
  ratingBg: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.yellow[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 11, fontWeight: '700', color: Colors.yellow[600] },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: Spacing[1.5], marginBottom: Spacing[2] },
  tagBadge: { backgroundColor: Colors.neutral[50], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 9, color: Colors.neutral[500], fontWeight: '600' },
  storeFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 11, color: Colors.neutral[500], fontWeight: '500' },
  infoDot: { fontSize: 8, color: Colors.neutral[300] },
});

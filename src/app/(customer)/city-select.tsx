import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Image, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, MapPin, Check, Building2 } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';
import api from '@/services/api';
import { useAddressStore, CityItem } from '@/store/address.store';

export default function CitySelectScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cities, setCities] = useState<CityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedCity, setSelectedCity, setDraft } = useAddressStore();

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/cities');
        const data = res.data?.data ?? res.data ?? [];
        setCities(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to load cities:', err);
        setError('Failed to load cities');
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const filteredCities = cities.filter((city) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return city.name.toLowerCase().includes(q) || city.state?.toLowerCase().includes(q);
  });

  const handleSelectCity = (city: CityItem) => {
    setSelectedCity(city);
    setDraft({ city: city.name, state: city.state });
    // Navigate to step 2: address select with places autocomplete
    router.push('/(customer)/address-select' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.neutral[800]} size={22} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.stepText}>STEP 1 OF 3</Text>
          <Text style={styles.headerTitle}>Select Your City</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search color={Colors.neutral[400]} size={18} />
        <TextInput
          id="city-search-input"
          style={styles.searchInput}
          placeholder="Search for your city (e.g. Pune, Mumbai)..."
          placeholderTextColor={Colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={false}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.brand[600]} />
          <Text style={styles.loadingText}>Fetching available cities...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.replace('/(customer)/city-select' as any)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCities}
          keyExtractor={(item) => item._id || item.name}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            selectedCity ? (
              <View style={styles.currentCityCard}>
                <View style={styles.currentCityLeft}>
                  <MapPin color={Colors.brand[600]} size={20} />
                  <View>
                    <Text style={styles.currentCityLabel}>Current Selected City</Text>
                    <Text style={styles.currentCityName}>{selectedCity.name}, {selectedCity.state}</Text>
                  </View>
                </View>
                <Check color={Colors.brand[600]} size={18} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Building2 color={Colors.neutral[300]} size={48} />
              <Text style={styles.emptyTitle}>City not found</Text>
              <Text style={styles.emptySubtitle}>We currently operate in select cities. More locations coming soon!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = selectedCity?.name?.toLowerCase() === item.name.toLowerCase();
            return (
              <TouchableOpacity
                id={`city-option-${item.name.toLowerCase()}`}
                style={[styles.cityCard, isSelected && styles.cityCardSelected]}
                onPress={() => handleSelectCity(item)}
                activeOpacity={0.8}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.cityImage} />
                ) : (
                  <View style={styles.cityIconBg}>
                    <Building2 color={Colors.brand[600]} size={20} />
                  </View>
                )}

                <View style={styles.cityInfo}>
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.cityState}>{item.state}</Text>
                </View>

                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Check color={Colors.white} size={12} />
                  </View>
                )}
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
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitles: { marginLeft: Spacing[2] },
  stepText: { fontSize: 10, fontWeight: '800', color: Colors.brand[600], letterSpacing: 0.5 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.neutral[900] },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[2],
    backgroundColor: Colors.neutral[50], borderWidth: 1, borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.xl, marginHorizontal: Spacing[4], marginVertical: Spacing[3],
    paddingHorizontal: Spacing[3], height: 46,
  },
  searchInput: { flex: 1, color: Colors.neutral[900], fontSize: Typography.fontSize.sm },

  listContainer: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[8] },
  currentCityCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.brand[50], borderWidth: 1, borderColor: Colors.brand[200],
    borderRadius: BorderRadius.xl, padding: Spacing[3], marginBottom: Spacing[4],
  },
  currentCityLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  currentCityLabel: { fontSize: 10, fontWeight: '700', color: Colors.brand[800], textTransform: 'uppercase' },
  currentCityName: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.brand[950], marginTop: 2 },

  cityCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing[3], borderRadius: BorderRadius.xl,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.neutral[100],
    marginBottom: Spacing[2.5],
  },
  cityCardSelected: { borderColor: Colors.brand[500], backgroundColor: Colors.brand[50] },
  cityImage: { width: 44, height: 44, borderRadius: BorderRadius.lg, backgroundColor: Colors.neutral[100] },
  cityIconBg: {
    width: 44, height: 44, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  cityInfo: { flex: 1, marginLeft: Spacing[3] },
  cityName: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[900] },
  cityState: { fontSize: Typography.fontSize.xs, color: Colors.neutral[500], marginTop: 2 },
  selectedBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.brand[600], alignItems: 'center', justifyContent: 'center',
  },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing[6] },
  loadingText: { marginTop: Spacing[3], fontSize: Typography.fontSize.sm, color: Colors.neutral[500] },
  errorText: { fontSize: Typography.fontSize.sm, color: Colors.red[500], marginBottom: Spacing[3] },
  retryBtn: { backgroundColor: Colors.brand[600], paddingHorizontal: Spacing[4], paddingVertical: Spacing[2], borderRadius: BorderRadius.lg },
  retryText: { color: Colors.white, fontWeight: '600', fontSize: Typography.fontSize.xs },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing[8] },
  emptyTitle: { fontSize: Typography.fontSize.base, fontWeight: '700', color: Colors.neutral[700], marginTop: Spacing[3] },
  emptySubtitle: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], textAlign: 'center', marginTop: 4, maxWidth: '80%' },
});

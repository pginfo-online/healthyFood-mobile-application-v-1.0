import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, MapPin, Navigation, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { router } from 'expo-router';
import { useAddressStore } from '@/store/address.store';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCCWonK_9QaSv9_vhRM3bKsVJUoU2e4MRM';

export default function AddressSelectScreen() {
  const { draft, selectedCity, setDraft } = useAddressStore();
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cityName = draft.city || selectedCity?.name || 'Pune';

  useEffect(() => {
    if (query.trim().length < 2) {
      setPredictions([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const fullQuery = `${query}, ${cityName}`;
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          fullQuery
        )}&components=country:in&key=${GOOGLE_API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.predictions) {
          setPredictions(data.predictions);
        } else {
          setPredictions([]);
        }
      } catch (err) {
        console.error('Google Places Autocomplete error:', err);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, cityName]);

  const handleSelectPrediction = async (item: PlacePrediction) => {
    setLoading(true);
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&fields=geometry,formatted_address,address_components&key=${GOOGLE_API_KEY}`;
      const response = await fetch(detailsUrl);
      const data = await response.json();

      let lat = 18.5204;
      let lng = 73.8567;
      let formattedAddress = item.description;

      if (data.status === 'OK' && data.result?.geometry?.location) {
        lat = data.result.geometry.location.lat;
        lng = data.result.geometry.location.lng;
        formattedAddress = data.result.formatted_address || item.description;
      }

      const mainText = item.structured_formatting?.main_text || item.description.split(',')[0];

      setDraft({
        area: mainText,
        formattedAddress,
        lat,
        lng,
      });

      // Proceed to Step 3: Complete address form
      router.push('/(customer)/address-form' as any);
    } catch (err) {
      console.error('Failed to get place details:', err);
      // Fallback
      setDraft({
        area: item.structured_formatting?.main_text || item.description,
        formattedAddress: item.description,
      });
      router.push('/(customer)/address-form' as any);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    setDraft({
      area: query.trim() || 'My Area',
      formattedAddress: query.trim(),
    });
    router.push('/(customer)/address-form' as any);
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
          <Text style={styles.stepText}>STEP 2 OF 3 • {cityName.toUpperCase()}</Text>
          <Text style={styles.headerTitle}>Select Area or Street</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Search color={Colors.neutral[400]} size={18} />
        <TextInput
          id="address-search-input"
          style={styles.searchInput}
          placeholder={`Search area, apartment, street in ${cityName}...`}
          placeholderTextColor={Colors.neutral[400]}
          value={query}
          onChangeText={setQuery}
          autoFocus={true}
        />
      </View>

      {/* Use current location or manual quick enter */}
      <TouchableOpacity 
        style={styles.currentLocationBtn}
        onPress={handleManualEntry}
        activeOpacity={0.8}
      >
        <View style={styles.locationIconBg}>
          <Navigation color={Colors.brand[600]} size={18} />
        </View>
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationBtnTitle}>Use entered location</Text>
          <Text style={styles.locationBtnSubtitle}>
            {query.trim() ? `Use "${query.trim()}" directly` : 'Fill in house details manually'}
          </Text>
        </View>
        <ChevronRight color={Colors.neutral[400]} size={18} />
      </TouchableOpacity>

      {/* Suggestions List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.brand[600]} />
          <Text style={styles.loadingText}>Searching Google Places...</Text>
        </View>
      ) : (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.place_id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            query.length >= 2 ? (
              <View style={styles.emptyContainer}>
                <MapPin color={Colors.neutral[300]} size={40} />
                <Text style={styles.emptyTitle}>No exact matches found</Text>
                <Text style={styles.emptySubtitle}>You can tap &quot;Use entered location&quot; above to type your address manually.</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelectPrediction(item)}
              activeOpacity={0.8}
            >
              <View style={styles.pinBg}>
                <MapPin color={Colors.neutral[600]} size={18} />
              </View>
              <View style={styles.suggestionTextContainer}>
                <Text style={styles.mainText} numberOfLines={1}>
                  {item.structured_formatting?.main_text || item.description}
                </Text>
                <Text style={styles.secondaryText} numberOfLines={1}>
                  {item.structured_formatting?.secondary_text || item.description}
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: Spacing[3], height: 48,
  },
  searchInput: { flex: 1, color: Colors.neutral[900], fontSize: Typography.fontSize.sm },

  currentLocationBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[3],
    marginHorizontal: Spacing[4], marginBottom: Spacing[2],
    backgroundColor: Colors.brand[50], borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.brand[100],
  },
  locationIconBg: {
    width: 36, height: 36, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
  },
  locationTextContainer: { flex: 1, marginLeft: Spacing[3] },
  locationBtnTitle: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.brand[900] },
  locationBtnSubtitle: { fontSize: Typography.fontSize.xs, color: Colors.brand[700], marginTop: 2 },

  listContainer: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[8] },
  suggestionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing[3.5], borderBottomWidth: 1, borderBottomColor: Colors.neutral[100],
  },
  pinBg: {
    width: 36, height: 36, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[50], alignItems: 'center', justifyContent: 'center',
  },
  suggestionTextContainer: { flex: 1, marginLeft: Spacing[3] },
  mainText: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[900] },
  secondaryText: { fontSize: Typography.fontSize.xs, color: Colors.neutral[500], marginTop: 2 },

  loadingContainer: { padding: Spacing[6], alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: Spacing[2], fontSize: Typography.fontSize.xs, color: Colors.neutral[500] },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing[8] },
  emptyTitle: { fontSize: Typography.fontSize.sm, fontWeight: '700', color: Colors.neutral[700], marginTop: Spacing[2] },
  emptySubtitle: { fontSize: Typography.fontSize.xs, color: Colors.neutral[400], textAlign: 'center', marginTop: 4, maxWidth: '80%' },
});

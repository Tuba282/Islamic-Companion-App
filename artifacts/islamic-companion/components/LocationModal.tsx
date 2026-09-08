import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAppState } from '@/context/AppState';
import { useColors } from '@/hooks/useColors';

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PopularCity {
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  badge?: string;
}

const POPULAR_CITIES: PopularCity[] = [
  { name: 'Makkah', country: 'Saudi Arabia', countryCode: 'SA', latitude: 21.422487, longitude: 39.826206, badge: 'Haramain' },
  { name: 'Madinah', country: 'Saudi Arabia', countryCode: 'SA', latitude: 24.4672, longitude: 39.6111, badge: 'Haramain' },
  { name: 'Jerusalem (Al-Quds)', country: 'Palestine', countryCode: '', latitude: 31.7683, longitude: 35.2137, badge: 'Al-Aqsa' },
  { name: 'Lahore', country: 'Pakistan', countryCode: 'PK', latitude: 31.5204, longitude: 74.3587 },
  { name: 'Karachi', country: 'Pakistan', countryCode: 'PK', latitude: 24.8607, longitude: 67.0011 },
  { name: 'Islamabad', country: 'Pakistan', countryCode: 'PK', latitude: 33.6844, longitude: 73.0479 },
  { name: 'Rawalpindi', country: 'Pakistan', countryCode: 'PK', latitude: 33.5651, longitude: 73.0169 },
  { name: 'Peshawar', country: 'Pakistan', countryCode: 'PK', latitude: 34.0151, longitude: 71.5249 },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Istanbul', country: 'Turkey', countryCode: 'TR', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Cairo', country: 'Egypt', countryCode: 'EG', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', latitude: 23.8103, longitude: 90.4125 },
  { name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', latitude: -6.2088, longitude: 106.8456 },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.006 },
];

export function LocationModal({ visible, onClose }: LocationModalProps) {
  const colors = useColors();
  const {
    locationLabel,
    coordinates,
    locationTimezoneLabel,
    refreshLocation,
    setLocationManually,
    locationStatus,
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ name: string; latitude: number; longitude: number }>>([]);
  const [searchError, setSearchError] = useState('');
  const [showCustomCoords, setShowCustomCoords] = useState(false);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customName, setCustomName] = useState('');

  const handleUseCurrentLocation = async () => {
    await refreshLocation();
    onClose();
  };

  const handleSelectCity = async (city: PopularCity) => {
    await setLocationManually(
      { latitude: city.latitude, longitude: city.longitude },
      `${city.name}, ${city.country}`,
      city.countryCode
    );
    onClose();
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const results = await Location.geocodeAsync(query);
      if (results && results.length > 0) {
        // Try reverse geocoding the first result for a friendly name
        const mapped = await Promise.all(
          results.slice(0, 4).map(async (r) => {
            const places = await Location.reverseGeocodeAsync({
              latitude: r.latitude,
              longitude: r.longitude,
            }).catch(() => []);
            const place = places[0];
            const name = place
              ? [place.city || place.name, place.region, place.country].filter(Boolean).join(', ')
              : `${query} (${r.latitude.toFixed(2)}°, ${r.longitude.toFixed(2)}°)`;
            return {
              name,
              latitude: r.latitude,
              longitude: r.longitude,
            };
          })
        );
        setSearchResults(mapped);
      } else {
        setSearchError('No places found. Please check spelling or try another city.');
      }
    } catch {
      setSearchError('Search failed. Check your internet connection or enter coordinates.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: { name: string; latitude: number; longitude: number }) => {
    await setLocationManually(
      { latitude: result.latitude, longitude: result.longitude },
      result.name
    );
    onClose();
  };

  const handleSaveCustomCoords = async () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setSearchError('Please enter valid Latitude (-90 to 90) and Longitude (-180 to 180).');
      return;
    }
    const label = customName.trim() || `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
    await setLocationManually({ latitude: lat, longitude: lng }, label);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.foreground }]}>Select Location</Text>
                <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                  For accurate prayer times & Qibla direction
                </Text>
              </View>
              <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceRaised }]}>
                <Feather name="x" size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Current Active Location Card */}
              <View style={[styles.activeCard, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                <View style={[styles.activeIcon, { backgroundColor: colors.goldSoft }]}>
                  <Feather name="map-pin" size={16} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.activeTopRow}>
                    <Text style={[styles.activeTag, { color: colors.gold }]}>CURRENT ACTIVE</Text>
                    <Text style={[styles.timezoneTag, { color: colors.mutedForeground }]}>{locationTimezoneLabel}</Text>
                  </View>
                  <Text style={[styles.activeLocation, { color: colors.foreground }]} numberOfLines={1}>
                    {locationLabel}
                  </Text>
                  {coordinates && (
                    <Text style={[styles.coordsText, { color: colors.mutedForeground }]}>
                      {coordinates.latitude.toFixed(4)}°, {coordinates.longitude.toFixed(4)}°
                    </Text>
                  )}
                </View>
              </View>

              {/* Option 1: Use Current Location (Auto GPS) */}
              <Pressable
                onPress={handleUseCurrentLocation}
                style={({ pressed }) => [
                  styles.gpsButton,
                  { backgroundColor: colors.gold },
                  pressed && { opacity: 0.85 },
                ]}
              >
                {locationStatus === 'loading' ? (
                  <ActivityIndicator size="small" color={colors.primaryForeground} />
                ) : (
                  <Feather name="crosshair" size={18} color={colors.primaryForeground} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.gpsBtnTitle, { color: colors.primaryForeground }]}>
                    Use Current Location (GPS)
                  </Text>
                  <Text style={[styles.gpsBtnSubtitle, { color: colors.primaryForeground }]}>
                    Auto-detect via phone GPS sensor
                  </Text>
                </View>
                <Feather name="arrow-right" size={16} color={colors.primaryForeground} />
              </Pressable>

              <View style={[styles.divider, { borderBottomColor: colors.border }]} />

              {/* Option 2: Search Manually */}
              <Text style={[styles.sectionHeading, { color: colors.foreground }]}>Add Location Manually</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
                Type any city name or select from popular cities
              </Text>

              {/* Search Bar */}
              <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="search" size={17} color={colors.mutedForeground} />
                <TextInput
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    if (searchError) setSearchError('');
                  }}
                  onSubmitEditing={handleSearch}
                  placeholder="e.g. Lahore, Dubai, London, Dallas..."
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.searchInput, { color: colors.foreground }]}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <Feather name="x-circle" size={16} color={colors.mutedForeground} />
                  </Pressable>
                )}
                <Pressable
                  onPress={handleSearch}
                  style={[styles.searchActionBtn, { backgroundColor: colors.gold }]}
                >
                  {isSearching ? (
                    <ActivityIndicator size="small" color={colors.primaryForeground} />
                  ) : (
                    <Text style={[styles.searchActionText, { color: colors.primaryForeground }]}>Search</Text>
                  )}
                </Pressable>
              </View>

              {searchError ? (
                <Text style={[styles.errorText, { color: colors.destructive }]}>{searchError}</Text>
              ) : null}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <View style={styles.resultsWrap}>
                  <Text style={[styles.resultsTitle, { color: colors.gold }]}>Search Results:</Text>
                  {searchResults.map((res, i) => (
                    <Pressable
                      key={`${res.latitude}-${res.longitude}-${i}`}
                      onPress={() => handleSelectSearchResult(res)}
                      style={({ pressed }) => [
                        styles.resultItem,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <Feather name="map-pin" size={14} color={colors.gold} />
                      <Text style={[styles.resultItemText, { color: colors.foreground }]} numberOfLines={1}>
                        {res.name}
                      </Text>
                      <Feather name="check" size={14} color={colors.gold} />
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Popular Cities Grid */}
              <Text style={[styles.popularTitle, { color: colors.foreground }]}>Popular Islamic Cities</Text>
              <View style={styles.citiesGrid}>
                {POPULAR_CITIES.map((city) => {
                  const isSelected =
                    coordinates &&
                    Math.abs(coordinates.latitude - city.latitude) < 0.05 &&
                    Math.abs(coordinates.longitude - city.longitude) < 0.05;

                  return (
                    <Pressable
                      key={city.name}
                      onPress={() => handleSelectCity(city)}
                      style={({ pressed }) => [
                        styles.cityChip,
                        {
                          backgroundColor: isSelected ? colors.goldSoft : colors.card,
                          borderColor: isSelected ? colors.gold : colors.border,
                        },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.cityNameRow}>
                          <Text style={[styles.cityName, { color: isSelected ? colors.gold : colors.foreground }]}>
                            {city.name}
                          </Text>
                          {city.badge && (
                            <View style={[styles.cityBadge, { backgroundColor: colors.gold }]}>
                              <Text style={[styles.cityBadgeText, { color: colors.primaryForeground }]}>
                                {city.badge}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.cityCountry, { color: colors.mutedForeground }]}>{city.country}</Text>
                      </View>
                      {isSelected ? (
                        <Feather name="check-circle" size={16} color={colors.gold} />
                      ) : (
                        <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* Direct Coordinate Input Toggle */}
              <Pressable
                onPress={() => setShowCustomCoords(!showCustomCoords)}
                style={styles.customCoordsToggle}
              >
                <Feather
                  name={showCustomCoords ? 'chevron-down' : 'chevron-right'}
                  size={16}
                  color={colors.gold}
                />
                <Text style={[styles.customCoordsToggleText, { color: colors.gold }]}>
                  Enter exact Latitude & Longitude coordinates
                </Text>
              </Pressable>

              {showCustomCoords && (
                <View style={[styles.customCoordsBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    value={customName}
                    onChangeText={setCustomName}
                    placeholder="Custom Location Name (optional)"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.coordInput, { color: colors.foreground, borderColor: colors.border }]}
                  />
                  <View style={styles.coordInputsRow}>
                    <TextInput
                      value={customLat}
                      onChangeText={setCustomLat}
                      placeholder="Latitude (e.g. 31.52)"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="numeric"
                      style={[styles.coordInputHalf, { color: colors.foreground, borderColor: colors.border }]}
                    />
                    <TextInput
                      value={customLng}
                      onChangeText={setCustomLng}
                      placeholder="Longitude (e.g. 74.35)"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="numeric"
                      style={[styles.coordInputHalf, { color: colors.foreground, borderColor: colors.border }]}
                    />
                  </View>
                  <Pressable
                    onPress={handleSaveCustomCoords}
                    style={[styles.saveCoordsBtn, { backgroundColor: colors.gold }]}
                  >
                    <Text style={[styles.saveCoordsBtnText, { color: colors.primaryForeground }]}>
                      Set Custom Location
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  keyboardWrap: {
    maxHeight: '92%',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 34 : 22,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
  },
  activeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeTag: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
  },
  timezoneTag: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  activeLocation: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  coordsText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
  },
  gpsBtnTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  gpsBtnSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    opacity: 0.85,
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  searchActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  searchActionText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    marginTop: 6,
  },
  resultsWrap: {
    marginTop: 12,
    gap: 6,
  },
  resultsTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  resultItemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  popularTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    marginTop: 18,
    marginBottom: 10,
  },
  citiesGrid: {
    gap: 8,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cityName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  cityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  cityBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  cityCountry: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  customCoordsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    paddingVertical: 6,
  },
  customCoordsToggleText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  customCoordsBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
    gap: 10,
  },
  coordInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  coordInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  coordInputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  saveCoordsBtn: {
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveCoordsBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
});

import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { qiblaBearing } from '@/lib/prayer';
import { useAppState } from '@/context/AppState';
import { Screen, Header, GlassCard, PrimaryButton } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

export default function QiblaScreen() {
  const colors = useColors();
  const { locationStatus, locationLabel, coordinates, refreshLocation } = useAppState();
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [sensorError, setSensorError] = useState(false);
  const bearing = coordinates ? qiblaBearing(coordinates.latitude, coordinates.longitude) : null;

  useEffect(() => {
    if (locationStatus === 'idle') void refreshLocation();
    if (Platform.OS === 'web') {
      setSensorError(true);
      return;
    }
    let subscription: Location.LocationSubscription | undefined;
    Location.watchHeadingAsync(({ trueHeading, magHeading }) => {
      const nextHeading = trueHeading >= 0 ? trueHeading : magHeading;
      setDeviceHeading(Math.round(nextHeading));
    }).then((next) => { subscription = next; }).catch(() => setSensorError(true));
    return () => subscription?.remove();
  }, [locationStatus, refreshLocation]);

  const compassRotation = bearing !== null && deviceHeading !== null ? bearing - deviceHeading : 0;
  const handleRetry = async () => {
    await refreshLocation();
    if (Platform.OS !== 'web') {
      const permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted') Alert.alert('Location permission needed', 'Allow location access in your phone settings to calculate Qibla.');
    }
  };

  return <Screen>
    <Header title="Qibla Direction" subtitle="Live direction from your current location" />
    <GlassCard style={styles.locationCard}><View style={[styles.pin, { backgroundColor: colors.goldSoft }]}><Feather name="map-pin" size={17} color={colors.gold} /></View><View style={{ flex: 1 }}><Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>CURRENT LOCATION</Text><Text style={[styles.location, { color: colors.foreground }]}>{locationStatus === 'loading' ? 'Detecting location…' : locationLabel}</Text></View><Feather name="navigation" size={17} color={colors.gold} /></GlassCard>
    <View style={styles.compassWrap}>
      <View style={[styles.outer, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, transform: [{ rotate: `${compassRotation}deg` }] }]}>
        {['N', 'E', 'S', 'W'].map((mark, index) => <Text key={mark} style={[styles.direction, { color: colors.gold, top: index === 0 ? 17 : index === 2 ? undefined : '46%', bottom: index === 2 ? 17 : undefined, left: index === 3 ? 17 : undefined, right: index === 1 ? 17 : undefined }]}>{mark}</Text>)}
        <View style={[styles.ring, { borderColor: colors.gold }]}><View style={[styles.needle, { backgroundColor: colors.gold }]}><Feather name="navigation" size={29} color={colors.gold} /></View><View style={[styles.center, { backgroundColor: colors.gold }]} /></View>
      </View>
      <View style={styles.angle}><Text style={[styles.angleValue, { color: colors.foreground }]}>{bearing !== null ? `${bearing}°` : '--°'}</Text><Text style={[styles.angleLabel, { color: colors.mutedForeground }]}>QIBLA BEARING FROM NORTH</Text></View>
    </View>
    <GlassCard style={styles.infoCard} accent><View style={styles.infoRow}><Feather name={sensorError ? 'smartphone' : 'radio'} size={16} color={colors.gold} /><Text style={[styles.infoText, { color: colors.foreground }]}>{sensorError ? 'Live compass sensors are unavailable in this preview. Open the app on your phone for device orientation.' : deviceHeading !== null ? `Phone heading ${deviceHeading}°. Rotate until the gold direction marker points toward Qibla.` : 'Hold your phone flat and move it in a figure-eight to calibrate the compass.'}</Text></View></GlassCard>
    <PrimaryButton label={locationStatus === 'ready' ? 'Refresh current location' : 'Enable location'} onPress={handleRetry} icon="refresh-cw" />
    <Text style={[styles.footer, { color: colors.mutedForeground }]}>{coordinates ? `${coordinates.latitude.toFixed(4)}°, ${coordinates.longitude.toFixed(4)}° · Kaaba, Makkah` : 'Location is required for an accurate Qibla bearing'}</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  pin: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  smallLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  location: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
  compassWrap: { alignItems: 'center', marginVertical: 22 },
  outer: { width: 270, height: 270, borderRadius: 140, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  direction: { position: 'absolute', fontSize: 12, fontFamily: 'Inter_700Bold' },
  ring: { width: 194, height: 194, borderRadius: 100, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  needle: { width: 2, height: 130, position: 'absolute', opacity: 0.9, alignItems: 'center', justifyContent: 'flex-start' },
  center: { width: 14, height: 14, borderRadius: 8, position: 'absolute' },
  angle: { alignItems: 'center', marginTop: 19 },
  angleValue: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  angleLabel: { fontSize: 9, letterSpacing: 1.4, fontFamily: 'Inter_700Bold', marginTop: 4 },
  infoCard: { marginBottom: 14, padding: 13 },
  infoRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 11, lineHeight: 17, fontFamily: 'Inter_400Regular' },
  footer: { textAlign: 'center', fontSize: 11, lineHeight: 17, fontFamily: 'Inter_400Regular', marginTop: 16 },
});
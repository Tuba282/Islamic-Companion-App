import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Screen, Header, GlassCard, PrimaryButton } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

export default function QiblaScreen() {
  const colors = useColors();
  const [heading, setHeading] = useState(243);
  const [location, setLocation] = useState('Karachi, Pakistan');
  const [enabled, setEnabled] = useState(false);

  const enableCompass = async () => {
    if (enabled) return;
    if (Location.requestForegroundPermissionsAsync) {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Location permission needed', 'Enable location to calculate the Qibla direction from your current position.');
        return;
      }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => null);
      if (current) setLocation(`${current.coords.latitude.toFixed(2)}°, ${current.coords.longitude.toFixed(2)}°`);
    }
    setEnabled(true);
  };

  return (
    <Screen>
      <Header title="Qibla Direction" subtitle="Find your way to the Kaaba" />
      <GlassCard style={styles.locationCard}><View style={[styles.pin, { backgroundColor: colors.goldSoft }]}><Feather name="map-pin" size={17} color={colors.gold} /></View><View style={{ flex: 1 }}><Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>YOUR LOCATION</Text><Text style={[styles.location, { color: colors.foreground }]}>{location}</Text></View><Feather name="chevron-right" size={17} color={colors.mutedForeground} /></GlassCard>
      <View style={styles.compassWrap}>
        <View style={[styles.outer, { borderColor: colors.border, backgroundColor: colors.surfaceRaised, transform: [{ rotate: `${-heading}deg` }] }]}>
          {['N', 'E', 'S', 'W'].map((mark, index) => <Text key={mark} style={[styles.direction, { color: colors.gold, top: index === 0 ? 17 : index === 2 ? undefined : '46%', bottom: index === 2 ? 17 : undefined, left: index === 3 ? 17 : undefined, right: index === 1 ? 17 : undefined }]}>{mark}</Text>)}
          <View style={[styles.ring, { borderColor: colors.gold }]}><View style={[styles.needle, { backgroundColor: colors.gold }]}><Feather name="navigation" size={29} color={colors.gold} /></View><View style={[styles.center, { backgroundColor: colors.gold }]} /></View>
        </View>
        <View style={styles.angle}><Text style={[styles.angleValue, { color: colors.foreground }]}>{heading}°</Text><Text style={[styles.angleLabel, { color: colors.mutedForeground }]}>QIBLA ANGLE</Text></View>
      </View>
      <GlassCard style={styles.infoCard} accent><View style={styles.infoRow}><Feather name="info" size={16} color={colors.gold} /><Text style={[styles.infoText, { color: colors.foreground }]}>For best accuracy, hold your phone flat and away from magnetic objects.</Text></View></GlassCard>
      <PrimaryButton label={enabled ? 'Compass enabled' : 'Enable compass'} onPress={enableCompass} icon={enabled ? 'check' : 'compass'} />
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>Kaaba · Makkah, Saudi Arabia</Text>
    </Screen>
  );
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
  footer: { textAlign: 'center', fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 16 },
});
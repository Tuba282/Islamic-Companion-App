import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Svg, { Rect, Path, Circle, Polygon, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { distanceToKaabaKm, qiblaBearing } from '@/lib/prayer';
import { useAppState } from '@/context/AppState';
import { Screen, Header, GlassCard, PrimaryButton } from '@/components/Primitives';
import { LocationModal } from '@/components/LocationModal';
import { useColors } from '@/hooks/useColors';

/**
 * Beautiful, crisp vector representation of the Holy Kaaba
 */
function KaabaIcon({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="kaabaBody" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1E2022" />
          <Stop offset="1" stopColor="#0B0C0E" />
        </LinearGradient>
        <LinearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#F5D77F" />
          <Stop offset="0.5" stopColor="#D4AF37" />
          <Stop offset="1" stopColor="#AA820A" />
        </LinearGradient>
      </Defs>

      {/* Outer shadow / glow ring */}
      <Circle cx="32" cy="32" r="30" fill="rgba(212, 175, 55, 0.12)" />

      {/* Kaaba Roof / Top Perspective */}
      <Polygon points="16,22 32,13 48,22 32,27" fill="#2D3035" />

      {/* Kaaba Left Face */}
      <Polygon points="16,22 32,27 32,52 16,45" fill="url(#kaabaBody)" />

      {/* Kaaba Right Face */}
      <Polygon points="32,27 48,22 48,45 32,52" fill="#141618" />

      {/* Kiswah Gold Band (Left Face) */}
      <Polygon points="16,28 32,33 32,36 16,31" fill="url(#goldTrim)" />

      {/* Kiswah Gold Band (Right Face) */}
      <Polygon points="32,33 48,28 48,31 32,36" fill="url(#goldTrim)" />

      {/* Door of Kaaba (Bab al-Kaaba) on Left/Front Face */}
      <Polygon points="22,34 28,36 28,47 22,45" fill="url(#goldTrim)" stroke="#684D02" strokeWidth="0.5" />
      <Path d="M 23 37 L 27 38.5" stroke="#4A3702" strokeWidth="0.5" />
      <Path d="M 23 41 L 27 42.5" stroke="#4A3702" strokeWidth="0.5" />

      {/* Roof Golden Trim border */}
      <Path d="M 16 22 L 32 13 L 48 22" stroke="url(#goldTrim)" strokeWidth="1" fill="none" />

      {/* Base Marble Step (Shadhirwan) */}
      <Polygon points="14,46 32,54 50,46 32,56" fill="#757D8A" opacity={0.6} />
    </Svg>
  );
}

export default function QiblaScreen() {
  const colors = useColors();
  const { locationStatus, locationLabel, coordinates, refreshLocation } = useAppState();

  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(true);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [isAligned, setIsAligned] = useState(false);

  // Animated rotation value for fluid, buttery-smooth compass needle
  const animatedRotation = useRef(new Animated.Value(0)).current;
  const currentRotationRef = useRef<number>(0);
  const lastHapticRef = useRef<number>(0);

  const bearing = coordinates ? qiblaBearing(coordinates.latitude, coordinates.longitude) : 260;
  const distanceKm = coordinates ? distanceToKaabaKm(coordinates.latitude, coordinates.longitude) : null;

  // Shortest-path continuous rotation interpolation
  const animateToHeading = (heading: number) => {
    // Relative angle between current phone heading and Qibla bearing
    const targetAngle = bearing - heading;

    // Normalize shortest path
    let current = currentRotationRef.current;
    let diff = ((targetAngle - current + 540) % 360) - 180;
    let next = current + diff;

    currentRotationRef.current = next;

    Animated.spring(animatedRotation, {
      toValue: next,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();

    // Check alignment within ±4 degrees of Qibla
    const deviation = Math.abs((((targetAngle % 360) + 360) % 360));
    const alignedNow = deviation <= 4 || deviation >= 356;
    setIsAligned(alignedNow);

    if (alignedNow) {
      const now = Date.now();
      if (now - lastHapticRef.current > 1500 && Platform.OS !== 'web') {
        lastHapticRef.current = now;
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  useEffect(() => {
    if (locationStatus === 'idle') void refreshLocation();

    if (Platform.OS === 'web') {
      setSensorAvailable(false);
      return;
    }

    let subscription: Location.LocationSubscription | undefined;

    Location.watchHeadingAsync((headingData) => {
      const { trueHeading, magHeading } = headingData;
      const heading = trueHeading >= 0 ? trueHeading : magHeading;
      if (heading >= 0) {
        setDeviceHeading(Math.round(heading));
        animateToHeading(heading);
      }
    })
      .then((sub) => {
        subscription = sub;
      })
      .catch(() => {
        setSensorAvailable(false);
      });

    return () => {
      subscription?.remove();
    };
  }, [locationStatus, bearing]);

  // Turn guidance text
  const relativeAngle = ((bearing - deviceHeading + 360) % 360);
  let guidanceText = '';
  if (isAligned) {
    guidanceText = '✓ Perfect! You are facing the Holy Kaaba';
  } else if (relativeAngle > 0 && relativeAngle <= 180) {
    guidanceText = `Turn ${Math.round(relativeAngle)}° to your Right →`;
  } else {
    guidanceText = `← Turn ${Math.round(360 - relativeAngle)}° to your Left`;
  }

  // Web / Simulator test rotation control
  const handleSimulateTurn = (degDelta: number) => {
    const nextH = (deviceHeading + degDelta + 360) % 360;
    setDeviceHeading(nextH);
    animateToHeading(nextH);
  };

  const spinInterpolation = animatedRotation.interpolate({
    inputRange: [-3600, 3600],
    outputRange: ['-3600deg', '3600deg'],
  });

  return (
    <Screen>
      <Header
        title="Qibla Direction"
        subtitle="Real-time direction to the Holy Kaaba in Makkah"
      />

      {/* Interactive Location Card */}
      <Pressable
        onPress={() => setLocationModalVisible(true)}
        style={({ pressed }) => [
          styles.locationCard,
          { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={[styles.pin, { backgroundColor: colors.goldSoft }]}>
          <Feather name="map-pin" size={17} color={colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.smallLabel, { color: colors.mutedForeground }]}>CURRENT LOCATION</Text>
          <Text style={[styles.locationText, { color: colors.foreground }]} numberOfLines={1}>
            {locationStatus === 'loading' ? 'Detecting location…' : locationLabel}
          </Text>
        </View>
        <View style={[styles.changeBtn, { backgroundColor: colors.goldSoft }]}>
          <Text style={[styles.changeBtnText, { color: colors.gold }]}>Change</Text>
          <Feather name="chevron-right" size={12} color={colors.gold} />
        </View>
      </Pressable>

      {/* Compass Container */}
      <View style={styles.compassWrap}>
        {/* Glow halo when aligned with Qibla */}
        {isAligned && (
          <View
            style={[
              styles.alignedHalo,
              {
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
              },
            ]}
          />
        )}

        {/* Outer Dial */}
        <View
          style={[
            styles.outerDial,
            {
              borderColor: isAligned ? '#10B981' : colors.border,
              backgroundColor: colors.surfaceRaised,
            },
          ]}
        >
          {/* Cardinal Directions on Outer Fixed Dial */}
          <Text style={[styles.cardinalNorth, { color: colors.destructive }]}>N</Text>
          <Text style={[styles.cardinalEast, { color: colors.mutedForeground }]}>E</Text>
          <Text style={[styles.cardinalSouth, { color: colors.mutedForeground }]}>S</Text>
          <Text style={[styles.cardinalWest, { color: colors.mutedForeground }]}>W</Text>

          {/* Rotating Compass Disc */}
          <Animated.View
            style={[
              styles.rotatingDial,
              {
                transform: [{ rotate: spinInterpolation }],
              },
            ]}
          >
            {/* Kaaba positioned at TOP of pointer */}
            <View style={styles.kaabaPlacement}>
              <KaabaIcon size={46} />
              <View style={[styles.kaabaGlowDot, { backgroundColor: colors.gold }]} />
            </View>

            {/* Inner Ring */}
            <View
              style={[
                styles.innerRing,
                { borderColor: isAligned ? '#10B981' : colors.gold },
              ]}
            >
              {/* Golden Direction Needle / Arrow */}
              <View style={styles.arrowContainer}>
                {/* Arrow Head */}
                <Svg width="36" height="120" viewBox="0 0 36 120">
                  <Defs>
                    <LinearGradient id="needleGrad" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor={isAligned ? '#34D399' : '#F5D77F'} />
                      <Stop offset="0.5" stopColor={isAligned ? '#10B981' : '#D4AF37'} />
                      <Stop offset="1" stopColor={isAligned ? '#059669' : '#AA820A'} />
                    </LinearGradient>
                  </Defs>
                  {/* Top Arrow pointing to Kaaba */}
                  <Polygon points="18,0 32,50 22,46 22,60 14,60 14,46 4,50" fill="url(#needleGrad)" />
                  {/* Bottom Tail */}
                  <Polygon points="18,120 23,65 13,65" fill="#4B5563" opacity={0.4} />
                </Svg>
              </View>

              {/* Center Pivot */}
              <View style={[styles.centerPivot, { backgroundColor: isAligned ? '#10B981' : colors.gold }]} />
            </View>
          </Animated.View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isAligned ? 'rgba(16, 185, 129, 0.15)' : colors.goldSoft,
              borderColor: isAligned ? '#10B981' : colors.gold,
            },
          ]}
        >
          <Feather
            name={isAligned ? 'check-circle' : 'navigation'}
            size={14}
            color={isAligned ? '#10B981' : colors.gold}
          />
          <Text
            style={[
              styles.statusBadgeText,
              { color: isAligned ? '#10B981' : colors.gold },
            ]}
          >
            {guidanceText}
          </Text>
        </View>

        {/* Bearing & Distance Info */}
        <View style={styles.angleRow}>
          <View style={styles.angleBox}>
            <Text style={[styles.angleValue, { color: colors.foreground }]}>{bearing}°</Text>
            <Text style={[styles.angleLabel, { color: colors.mutedForeground }]}>QIBLA BEARING</Text>
          </View>
          <View style={[styles.boxDivider, { backgroundColor: colors.border }]} />
          <View style={styles.angleBox}>
            <Text style={[styles.angleValue, { color: colors.foreground }]}>
              {distanceKm ? `${distanceKm.toLocaleString()} km` : '--- km'}
            </Text>
            <Text style={[styles.angleLabel, { color: colors.mutedForeground }]}>DISTANCE TO MAKKAH</Text>
          </View>
        </View>
      </View>

      {/* Sensor / Simulation Controls */}
      {!sensorAvailable && (
        <GlassCard style={styles.simCard}>
          <View style={styles.simHeader}>
            <Feather name="info" size={15} color={colors.gold} />
            <Text style={[styles.simTitle, { color: colors.foreground }]}>
              Live Compass Preview / Test Mode
            </Text>
          </View>
          <Text style={[styles.simSubtitle, { color: colors.mutedForeground }]}>
            In browser preview or devices without magnetometer, rotate using these buttons to test the needle and Kaaba alignment:
          </Text>
          <View style={styles.simButtonsRow}>
            <Pressable
              onPress={() => handleSimulateTurn(-15)}
              style={[styles.simBtn, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
            >
              <Feather name="rotate-ccw" size={14} color={colors.gold} />
              <Text style={[styles.simBtnText, { color: colors.foreground }]}>Turn Left 15°</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setDeviceHeading(bearing);
                animateToHeading(bearing);
              }}
              style={[styles.simBtn, { backgroundColor: colors.goldSoft, borderColor: colors.gold }]}
            >
              <Feather name="check" size={14} color={colors.gold} />
              <Text style={[styles.simBtnText, { color: colors.gold }]}>Face Qibla</Text>
            </Pressable>
            <Pressable
              onPress={() => handleSimulateTurn(15)}
              style={[styles.simBtn, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
            >
              <Feather name="rotate-cw" size={14} color={colors.gold} />
              <Text style={[styles.simBtnText, { color: colors.foreground }]}>Turn Right 15°</Text>
            </Pressable>
          </View>
        </GlassCard>
      )}

      {sensorAvailable && (
        <GlassCard style={styles.infoCard} accent>
          <View style={styles.infoRow}>
            <Feather name="compass" size={16} color={colors.gold} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              Hold your phone flat horizontally. Rotate yourself until the golden arrow and Khana Kaaba align with the top marker.
            </Text>
          </View>
        </GlassCard>
      )}

      <PrimaryButton
        label="Change / Select Location"
        onPress={() => setLocationModalVisible(true)}
        icon="map-pin"
      />

      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        {coordinates
          ? `${coordinates.latitude.toFixed(4)}°, ${coordinates.longitude.toFixed(4)}° · Holy Kaaba (21.4225° N, 39.8262° E)`
          : 'Location required for exact Qibla calculation'}
      </Text>

      {/* Location Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeBtnText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  compassWrap: {
    alignItems: 'center',
    marginVertical: 18,
    position: 'relative',
  },
  alignedHalo: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    top: -10,
  },
  outerDial: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardinalNorth: {
    position: 'absolute',
    top: 10,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  cardinalEast: {
    position: 'absolute',
    right: 14,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  cardinalSouth: {
    position: 'absolute',
    bottom: 10,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  cardinalWest: {
    position: 'absolute',
    left: 14,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  rotatingDial: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaPlacement: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  kaabaGlowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -2,
  },
  innerRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 25,
  },
  centerPivot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFF',
    position: 'absolute',
    zIndex: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 18,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  angleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 18,
    width: '100%',
  },
  angleBox: {
    alignItems: 'center',
    flex: 1,
  },
  boxDivider: {
    width: 1,
    height: 32,
  },
  angleValue: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  angleLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    marginTop: 3,
  },
  simCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    gap: 10,
  },
  simHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  simSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  simBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  simBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  infoCard: {
    marginBottom: 14,
    padding: 13,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    fontFamily: 'Inter_400Regular',
    marginTop: 14,
    marginBottom: 20,
  },
});
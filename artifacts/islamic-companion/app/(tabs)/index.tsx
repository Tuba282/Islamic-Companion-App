import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { formatClockTime, formatDate, formatPrayerTime, nextPrayer } from '@/lib/prayer';
import { useAppState } from '@/context/AppState';
import { Screen, GlassCard, SectionTitle, IconButton } from '@/components/Primitives';
import { LocationModal } from '@/components/LocationModal';
import { useColors } from '@/hooks/useColors';

const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

function countdown(target: Date | undefined, now: Date) {
  if (!target) return '--:--:--';
  let difference = target.getTime() - now.getTime();
  if (difference < 0) difference += 86400000;
  const hours = Math.floor(difference / 3600000).toString().padStart(2, '0');
  const minutes = Math.floor((difference % 3600000) / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((difference % 60000) / 1000).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const {
    locationStatus,
    locationLabel,
    locationTimezoneOffsetMinutes,
    locationTimezoneLabel,
    prayerTimes,
    refreshLocation,
  } = useAppState();

  const [now, setNow] = useState(new Date());
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    if (locationStatus === 'idle') void refreshLocation();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [locationStatus, refreshLocation]);

  const upcoming = prayerTimes ? nextPrayer(prayerTimes, now) : null;
  const currentTime = formatClockTime(now, locationTimezoneOffsetMinutes);
  const date = formatDate(now, locationTimezoneOffsetMinutes);
  const locationMessage =
    locationStatus === 'loading'
      ? 'Detecting location…'
      : locationStatus === 'denied'
      ? 'Tap to select location'
      : locationLabel;

  return (
    <Screen>
      <View style={styles.top}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={[styles.eyebrow, { color: colors.gold }]}>ASSALAMU ALAIKUM</Text>
          <Text style={[styles.greeting, { color: colors.foreground }]}>
            Good morning, <Text style={{ color: colors.gold }}>Tuba</Text>
          </Text>

          {/* Interactive Location Pill */}
          <Pressable
            onPress={() => setLocationModalVisible(true)}
            style={({ pressed }) => [
              styles.locationPill,
              { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Feather name="map-pin" size={12} color={colors.gold} />
            <Text style={[styles.locationText, { color: colors.foreground }]} numberOfLines={1}>
              {locationMessage}
            </Text>
            {locationStatus === 'loading' ? (
              <Feather name="loader" size={11} color={colors.gold} />
            ) : (
              <View style={[styles.changeBadge, { backgroundColor: colors.goldSoft }]}>
                <Text style={[styles.changeText, { color: colors.gold }]}>Change</Text>
                <Feather name="chevron-down" size={10} color={colors.gold} />
              </View>
            )}
          </Pressable>
        </View>
        <IconButton icon="bell" onPress={() => router.push('/(tabs)/alarm')} />
      </View>

      <View style={styles.clockRow}>
        <Text style={[styles.clock, { color: colors.foreground }]}>{currentTime}</Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>{date}</Text>
        <Text style={[styles.hijri, { color: colors.gold }]}>
          Local prayer times · {locationTimezoneLabel}
        </Text>
      </View>

      <LinearGradient
        colors={[colors.gold, '#B8914B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.nextCard}
      >
        <View style={styles.nextTop}>
          <Text style={styles.nextLabel}>NEXT PRAYER</Text>
          <View style={styles.sun}>
            <Feather name="sun" size={16} color={colors.primaryForeground} />
          </View>
        </View>
        <Text style={[styles.nextName, { color: colors.primaryForeground }]}>
          {upcoming?.[0] ?? (locationStatus === 'loading' ? 'Locating…' : 'Unavailable')}
        </Text>
        <View style={styles.nextTimeRow}>
          <Text style={[styles.nextTime, { color: colors.primaryForeground }]}>
            {upcoming ? formatPrayerTime(upcoming[1], locationTimezoneOffsetMinutes) : '--:--'}
          </Text>
          <Text style={[styles.until, { color: colors.primaryForeground }]}>
            {upcoming ? `in ${countdown(upcoming[1], now)}` : 'Set location to calculate'}
          </Text>
        </View>
      </LinearGradient>

      <SectionTitle
        title="Today's prayers"
        action="Change Location"
        onAction={() => setLocationModalVisible(true)}
      />

      <GlassCard style={styles.schedule}>
        {prayerKeys.map((name) => {
          const value = prayerTimes?.[name];
          const isNext = upcoming?.[0] === name;
          return (
            <View
              key={name}
              style={[
                styles.prayerRow,
                isNext && {
                  backgroundColor: colors.goldSoft,
                  marginHorizontal: -8,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                },
              ]}
            >
              <View
                style={[
                  styles.prayerIcon,
                  { backgroundColor: isNext ? colors.gold : colors.muted },
                ]}
              >
                <Feather
                  name={
                    name === 'Fajr'
                      ? 'sunrise'
                      : name === 'Isha'
                      ? 'moon'
                      : name === 'Sunrise'
                      ? 'sunrise'
                      : 'sun'
                  }
                  size={14}
                  color={isNext ? colors.primaryForeground : colors.gold}
                />
              </View>
              <Text style={[styles.prayerName, { color: colors.foreground }]}>{name}</Text>
              <Text
                style={[
                  styles.prayerTime,
                  { color: isNext ? colors.gold : colors.mutedForeground },
                ]}
              >
                {formatPrayerTime(value, locationTimezoneOffsetMinutes)}
              </Text>
              {isNext ? <View style={[styles.nowDot, { backgroundColor: colors.gold }]} /> : null}
            </View>
          );
        })}
      </GlassCard>

      <SectionTitle title="Quick access" />
      <View style={styles.quickGrid}>
        {[
          ['compass', 'Qibla', '/(tabs)/qibla'],
          ['bell', 'Alarm', '/(tabs)/alarm'],
          ['check-circle', 'Tracker', '/(tabs)/tracker'],
          ['more-horizontal', 'More', '/(tabs)/more'],
        ].map(([icon, label, route]) => (
          <Pressable
            key={label}
            onPress={() => router.push(route as never)}
            style={({ pressed }) => [
              styles.quickItem,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={[styles.quickIcon, { backgroundColor: colors.goldSoft }]}>
              <Feather name={icon as keyof typeof Feather.glyphMap} size={19} color={colors.gold} />
            </View>
            <Text style={[styles.quickText, { color: colors.foreground }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Location Picker Modal */}
      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.4 },
  greeting: { fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 7 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  locationText: { fontSize: 11, fontFamily: 'Inter_500Medium', flexShrink: 1 },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 2,
  },
  changeText: { fontSize: 9, fontFamily: 'Inter_700Bold' },
  clockRow: { alignItems: 'center', marginTop: 24, gap: 7 },
  clock: { fontSize: 45, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  date: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  hijri: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  nextCard: { borderRadius: 22, padding: 18, marginTop: 24, minHeight: 150 },
  nextTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextLabel: { color: '#17352E', fontSize: 10, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' },
  sun: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: 'rgba(23,53,46,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextName: { fontSize: 23, fontFamily: 'Inter_700Bold', marginTop: 18 },
  nextTimeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 4 },
  nextTime: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  until: { fontSize: 11, fontFamily: 'Inter_500Medium', opacity: 0.75 },
  schedule: { paddingVertical: 5 },
  prayerRow: { flexDirection: 'row', alignItems: 'center', minHeight: 43, gap: 10 },
  prayerIcon: { width: 27, height: 27, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  prayerName: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1 },
  prayerTime: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  nowDot: { width: 5, height: 5, borderRadius: 3, marginLeft: 3 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickItem: { width: '48%', minHeight: 84, padding: 13, borderRadius: 17, borderWidth: 1, gap: 9 },
  quickIcon: { width: 29, height: 29, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
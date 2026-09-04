import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Screen, GlassCard, SectionTitle, IconButton } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const prayers = [
  ['Fajr', '04:58 AM', '04:58'],
  ['Sunrise', '06:15 AM', '06:15'],
  ['Dhuhr', '01:30 PM', '13:30'],
  ['Asr', '03:55 PM', '15:55'],
  ['Maghrib', '06:47 PM', '18:47'],
  ['Isha', '08:15 PM', '20:15'],
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <Screen>
      <View style={styles.top}><View><Text style={[styles.eyebrow, { color: colors.gold }]}>ASSALAMU ALAIKUM</Text><Text style={[styles.greeting, { color: colors.foreground }]}>Good morning, <Text style={{ color: colors.gold }}>Tuba</Text></Text><View style={styles.location}><Feather name="map-pin" size={12} color={colors.mutedForeground} /><Text style={[styles.locationText, { color: colors.mutedForeground }]}>Karachi, Pakistan</Text></View></View><IconButton icon="bell" /></View>
      <View style={styles.clockRow}><Text style={[styles.clock, { color: colors.foreground }]}>{time}</Text><View style={styles.dateWrap}><Text style={[styles.date, { color: colors.mutedForeground }]}>{date}</Text><Text style={[styles.hijri, { color: colors.gold }]}>11 Dhul-Qadah 1445 AH</Text></View></View>
      <LinearGradient colors={[colors.gold, '#B8914B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nextCard}>
        <View style={styles.nextTop}><Text style={styles.nextLabel}>NEXT PRAYER</Text><View style={styles.sun}><Feather name="sun" size={16} color={colors.primaryForeground} /></View></View>
        <Text style={[styles.nextName, { color: colors.primaryForeground }]}>Asr</Text><View style={styles.nextTimeRow}><Text style={[styles.nextTime, { color: colors.primaryForeground }]}>3:55 PM</Text><Text style={[styles.until, { color: colors.primaryForeground }]}>in 01:22:30</Text></View>
      </LinearGradient>
      <SectionTitle title="Today's prayers" action="View all" />
      <GlassCard style={styles.schedule}>
        {prayers.map(([name, label], index) => <View key={name} style={[styles.prayerRow, index === 3 && { backgroundColor: colors.goldSoft, marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 12 }]}><View style={[styles.prayerIcon, { backgroundColor: index === 3 ? colors.gold : colors.muted }]}><Feather name={index === 0 ? 'sunrise' : index === 5 ? 'moon' : 'sun'} size={14} color={index === 3 ? colors.primaryForeground : colors.gold} /></View><Text style={[styles.prayerName, { color: colors.foreground }]}>{name}</Text><Text style={[styles.prayerTime, { color: index === 3 ? colors.gold : colors.mutedForeground }]}>{label}</Text>{index === 3 ? <View style={[styles.nowDot, { backgroundColor: colors.gold }]} /> : null}</View>)}
      </GlassCard>
      <SectionTitle title="Quick access" />
      <View style={styles.quickGrid}>
        {[['compass', 'Qibla', '/(tabs)/qibla'], ['bell', 'Alarm', '/(tabs)/alarm'], ['check-circle', 'Tracker', '/(tabs)/tracker'], ['more-horizontal', 'More', '/(tabs)/more']].map(([icon, label, route]) => <Pressable key={label} onPress={() => router.push(route as never)} style={({ pressed }) => [styles.quickItem, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}><View style={[styles.quickIcon, { backgroundColor: colors.goldSoft }]}><Feather name={icon as keyof typeof Feather.glyphMap} size={19} color={colors.gold} /></View><Text style={[styles.quickText, { color: colors.foreground }]}>{label}</Text></Pressable>)}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.4 },
  greeting: { fontSize: 20, fontFamily: 'Inter_700Bold', marginTop: 7 },
  location: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 7 },
  locationText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  clockRow: { alignItems: 'center', marginTop: 24, gap: 7 },
  clock: { fontSize: 45, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  dateWrap: { alignItems: 'center', gap: 4 },
  date: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  hijri: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  nextCard: { borderRadius: 22, padding: 18, marginTop: 24, minHeight: 150 },
  nextTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextLabel: { color: '#17352E', fontSize: 10, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' },
  sun: { width: 32, height: 32, borderRadius: 11, backgroundColor: 'rgba(23,53,46,0.14)', alignItems: 'center', justifyContent: 'center' },
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

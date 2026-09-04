import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen, Header, GlassCard, Row } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const links: Array<[keyof typeof Feather.glyphMap, string, string, string]> = [
  ['calendar', 'Islamic Calendar', 'Hijri dates and important events', '/calendar'],
  ['book-open', 'Azkar & Duas', 'Daily remembrance and supplications', '/azkar'],
  ['circle', 'Tasbeeh', 'Keep your dhikr close', '/tasbeeh'],
  ['moon', 'Ramadan', 'Your Ramadan companion', '/ramadan'],
  ['sliders', 'Settings', 'Preferences and notifications', '/settings'],
];

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  return <Screen><Header title="More" subtitle="Everything you need for your day" /><GlassCard style={styles.profile}><View style={[styles.avatar, { backgroundColor: colors.gold }]}><Text style={[styles.avatarText, { color: colors.primaryForeground }]}>T</Text></View><View style={{ flex: 1 }}><Text style={[styles.name, { color: colors.foreground }]}>Tuba</Text><Text style={[styles.sub, { color: colors.mutedForeground }]}>May your day be blessed</Text></View><Feather name="heart" size={19} color={colors.gold} /></GlassCard><View style={styles.list}>{links.map(([icon, title, detail, route]) => <Row key={title} icon={icon} title={title} detail={detail} onPress={() => router.push(route as never)} />)}</View><View style={[styles.quote, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}><Text style={[styles.arabic, { color: colors.gold }]}>وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ</Text><Text style={[styles.quoteText, { color: colors.foreground }]}>“And remember your Lord when you forget.”</Text><Text style={[styles.reference, { color: colors.mutedForeground }]}>Surah Al-Kahf, 18:24</Text></View></Screen>;
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  avatar: { width: 48, height: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  name: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
  list: { marginTop: 15 },
  quote: { padding: 18, borderWidth: 1, borderRadius: 20, alignItems: 'center', marginTop: 20 },
  arabic: { fontSize: 18, marginBottom: 11 },
  quoteText: { fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  reference: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 7 },
});
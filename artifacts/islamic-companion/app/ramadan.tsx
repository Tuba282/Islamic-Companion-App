import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Header, GlassCard, SectionTitle, ProgressBar, Row } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

export default function RamadanScreen() {
  const colors = useColors();
  const router = useRouter();
  return <Screen><Header title="Ramadan" subtitle="A month of mercy and reflection" onBack={() => router.back()} /><LinearGradient colors={[colors.gold, '#B8914B']} style={styles.hero}><View style={styles.moon}><Feather name="moon" size={22} color={colors.primaryForeground} /></View><Text style={[styles.dayLabel, { color: colors.primaryForeground }]}>RAMADAN 1445 AH</Text><Text style={[styles.day, { color: colors.primaryForeground }]}>Day 30</Text><Text style={[styles.remaining, { color: colors.primaryForeground }]}>May Allah accept your fasting and prayers</Text></LinearGradient><GlassCard style={styles.countdown}><View><Text style={[styles.label, { color: colors.mutedForeground }]}>IFTAR IN</Text><Text style={[styles.timer, { color: colors.foreground }]}>02 : 17 : 45</Text><Text style={[styles.units, { color: colors.mutedForeground }]}>hours     minutes     seconds</Text></View><Feather name="sunset" size={24} color={colors.gold} /></GlassCard><View style={styles.meals}><GlassCard style={styles.meal}><Feather name="sunrise" size={18} color={colors.gold} /><Text style={[styles.mealLabel, { color: colors.mutedForeground }]}>SEHRI</Text><Text style={[styles.mealTime, { color: colors.foreground }]}>04:15 AM</Text></GlassCard><GlassCard style={styles.meal}><Feather name="sunset" size={18} color={colors.gold} /><Text style={[styles.mealLabel, { color: colors.mutedForeground }]}>IFTAR</Text><Text style={[styles.mealTime, { color: colors.foreground }]}>06:47 PM</Text></GlassCard></View><SectionTitle title="Ramadan goals" /><GlassCard><Row icon="book-open" title="Quran progress" detail="12 of 30 juz completed" /><ProgressBar value={40} /><Row icon="check-circle" title="Daily prayers" detail="4 of 5 completed" /><ProgressBar value={80} /><Row icon="heart" title="Daily duas" detail="3 of 5 completed" right={<Feather name="chevron-right" size={17} color={colors.mutedForeground} />} /></GlassCard></Screen>;
}

const styles = StyleSheet.create({
  hero: { borderRadius: 22, padding: 20, alignItems: 'center', minHeight: 182 },
  moon: { width: 45, height: 45, borderRadius: 16, backgroundColor: 'rgba(23,53,46,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  dayLabel: { fontSize: 10, letterSpacing: 1.3, fontFamily: 'Inter_700Bold' },
  day: { fontSize: 30, fontFamily: 'Inter_700Bold', marginTop: 5 },
  remaining: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 5 },
  countdown: { marginTop: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 9, letterSpacing: 1.2, fontFamily: 'Inter_700Bold' },
  timer: { fontSize: 25, fontFamily: 'Inter_700Bold', marginTop: 5 },
  units: { fontSize: 9, fontFamily: 'Inter_400Regular', marginTop: 2 },
  meals: { flexDirection: 'row', gap: 10, marginTop: 10 },
  meal: { flex: 1, padding: 13, gap: 6 },
  mealLabel: { fontSize: 9, letterSpacing: 1, fontFamily: 'Inter_700Bold' },
  mealTime: { fontSize: 15, fontFamily: 'Inter_700Bold' },
});
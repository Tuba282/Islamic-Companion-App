import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppState, PrayerKey } from '@/context/AppState';
import { Screen, Header, GlassCard, SectionTitle, ProgressBar } from '@/components/Primitives';
import { useColors } from '@/hooks/useColors';

const prayers: PrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export default function TrackerScreen() {
  const colors = useColors();
  const { completedPrayers, togglePrayer } = useAppState();
  const completed = prayers.filter((key) => completedPrayers[key]).length;
  return <Screen><Header title="Salah Tracker" subtitle="Build consistency, one prayer at a time" /><GlassCard accent style={styles.summary}><View><Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>TODAY'S PROGRESS</Text><Text style={[styles.summaryCount, { color: colors.foreground }]}>{completed}<Text style={{ color: colors.mutedForeground }}> / 5</Text></Text><Text style={[styles.summaryHint, { color: colors.gold }]}>Keep going, you’re doing well</Text></View><View style={[styles.progressCircle, { borderColor: colors.gold }]}><Text style={[styles.circleText, { color: colors.gold }]}>{completed * 20}%</Text></View></GlassCard><SectionTitle title="Today's prayers" /><GlassCard style={styles.list}>{prayers.map((name) => <Pressable key={name} onPress={() => togglePrayer(name)} style={({ pressed }) => [styles.prayerRow, pressed && { opacity: 0.7 }]}><View style={[styles.check, { borderColor: completedPrayers[name] ? colors.success : colors.border, backgroundColor: completedPrayers[name] ? colors.success : 'transparent' }]}>{completedPrayers[name] ? <Feather name="check" size={14} color={colors.primaryForeground} /> : null}</View><Text style={[styles.prayerName, { color: colors.foreground }]}>{name}</Text><Text style={[styles.status, { color: completedPrayers[name] ? colors.success : colors.mutedForeground }]}>{completedPrayers[name] ? 'Completed' : 'Not completed'}</Text></Pressable>)}</GlassCard><SectionTitle title="This week" action="View history" /><GlassCard><View style={styles.chart}>{[55, 80, 65, 92, 72, 100, completed * 20].map((value, index) => <View key={index} style={styles.barGroup}><View style={[styles.bar, { height: `${Math.max(15, value)}%`, backgroundColor: index === 6 ? colors.gold : colors.success }]} /><Text style={[styles.day, { color: colors.mutedForeground }]}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text></View>)}</View><ProgressBar value={completed * 20} /></GlassCard></Screen>;
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  summaryLabel: { fontSize: 9, letterSpacing: 1.1, fontFamily: 'Inter_700Bold' },
  summaryCount: { fontSize: 37, fontFamily: 'Inter_700Bold', marginTop: 5 },
  summaryHint: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 4 },
  progressCircle: { width: 83, height: 83, borderRadius: 42, borderWidth: 5, alignItems: 'center', justifyContent: 'center' },
  circleText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  list: { paddingVertical: 5 },
  prayerRow: { minHeight: 49, flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 24, height: 24, borderWidth: 1.5, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  prayerName: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  status: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  chart: { height: 130, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 15 },
  barGroup: { height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  bar: { width: 20, minHeight: 15, borderRadius: 6 },
  day: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
});